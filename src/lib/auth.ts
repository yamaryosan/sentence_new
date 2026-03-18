import { NextRequest } from "next/server";
import { Redis } from "@upstash/redis";
import { jwtVerify, SignJWT } from "jose";

export const AUTH_COOKIE_NAME = "sentence_auth";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7;
const SESSION_DURATION_SECONDS = SESSION_DURATION_MS / 1000;
const LOCK_WINDOW_MS = 1000 * 60 * 15;
const MAX_FAILED_ATTEMPTS = 5;

type AttemptState = {
	failedAt: number[];
	lockedUntil: number | null;
};

declare global {
	var __sentenceAuthRedis: Redis | undefined;
}

function getRequiredEnv(
	name:
		| "ACCESS_PASSWORD"
		| "AUTH_SECRET"
		| "UPSTASH_REDIS_REST_URL"
		| "UPSTASH_REDIS_REST_TOKEN",
) {
	const value = process.env[name];

	if (typeof value !== "string" || value.length === 0) {
		throw new Error(`${name} is not configured.`);
	}

	return value;
}

function getNow() {
	return Date.now();
}

function getAuthSecretKey() {
	return new TextEncoder().encode(getRequiredEnv("AUTH_SECRET"));
}

function getRedisClient() {
	if (globalThis.__sentenceAuthRedis) {
		return globalThis.__sentenceAuthRedis;
	}

	const client = new Redis({
		url: getRequiredEnv("UPSTASH_REDIS_REST_URL"),
		token: getRequiredEnv("UPSTASH_REDIS_REST_TOKEN"),
	});

	globalThis.__sentenceAuthRedis = client;
	return client;
}

function pruneState(state: AttemptState, now: number) {
	state.failedAt = state.failedAt.filter(
		(timestamp) => now - timestamp < LOCK_WINDOW_MS,
	);

	if (state.lockedUntil !== null && state.lockedUntil <= now) {
		state.lockedUntil = null;
	}
}

function getAttemptStateKey(key: string) {
	return `auth:attempt:${key}`;
}

async function loadAttemptState(key: string, now: number) {
	const state =
		(await getRedisClient().get<AttemptState>(getAttemptStateKey(key))) ?? {
			failedAt: [],
			lockedUntil: null,
		};

	pruneState(state, now);
	return state;
}

async function saveAttemptState(key: string, state: AttemptState, now: number) {
	let ttlSeconds = Math.ceil(LOCK_WINDOW_MS / 1000);

	if (state.lockedUntil !== null && state.lockedUntil > now) {
		ttlSeconds = Math.max(
			ttlSeconds,
			Math.ceil((state.lockedUntil - now) / 1000),
		);
	}

	await getRedisClient().set(getAttemptStateKey(key), state, {
		ex: Math.max(1, ttlSeconds),
	});
}

function timingSafeEqual(a: string, b: string) {
	if (a.length !== b.length) {
		return false;
	}

	let mismatch = 0;

	for (let index = 0; index < a.length; index += 1) {
		mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
	}

	return mismatch === 0;
}

export async function createSessionToken() {
	return new SignJWT({})
		.setProtectedHeader({ alg: "HS256" })
		.setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
		.sign(getAuthSecretKey());
}

export async function verifySessionToken(token: string) {
	try {
		await jwtVerify(token, getAuthSecretKey(), { algorithms: ["HS256"] });
		return true;
	} catch {
		return false;
	}
}

export function getClientKey(request: Pick<NextRequest, "headers"> | Request) {
	const forwardedFor = request.headers.get("x-forwarded-for");
	const realIp = request.headers.get("x-real-ip");
	const userAgent = request.headers.get("user-agent") ?? "unknown";
	const ip = forwardedFor?.split(",")[0]?.trim() || realIp || "unknown";
	return `${ip}:${userAgent}`;
}

export async function getLockStatus(key: string) {
	const now = getNow();
	const state = await loadAttemptState(key, now);

	return {
		isLocked: state.lockedUntil !== null && state.lockedUntil > now,
		remainingMs:
			state.lockedUntil !== null && state.lockedUntil > now
				? state.lockedUntil - now
				: 0,
	};
}

export async function recordFailedAttempt(key: string) {
	const now = getNow();
	const state = await loadAttemptState(key, now);
	state.failedAt.push(now);

	if (state.failedAt.length >= MAX_FAILED_ATTEMPTS) {
		state.lockedUntil = now + LOCK_WINDOW_MS;
		state.failedAt = [];
	}

	await saveAttemptState(key, state, now);

	return {
		isLocked: state.lockedUntil !== null && state.lockedUntil > now,
		remainingMs:
			state.lockedUntil !== null && state.lockedUntil > now
				? state.lockedUntil - now
				: 0,
		remainingAttempts: Math.max(
			0,
			MAX_FAILED_ATTEMPTS - state.failedAt.length,
		),
	};
}

export async function clearFailedAttempts(key: string) {
	await getRedisClient().del(getAttemptStateKey(key));
}

export function isValidPassword(password: string) {
	return timingSafeEqual(password, getRequiredEnv("ACCESS_PASSWORD"));
}

export function getSessionMaxAgeSeconds() {
	return SESSION_DURATION_SECONDS;
}

export function formatRemainingLockTime(remainingMs: number) {
	const remainingMinutes = Math.ceil(remainingMs / (1000 * 60));
	return `${remainingMinutes}分後に再試行してください。`;
}
