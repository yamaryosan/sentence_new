import { NextRequest } from "next/server";

export const AUTH_COOKIE_NAME = "sentence_auth";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7;
const LOCK_WINDOW_MS = 1000 * 60 * 15;
const MAX_FAILED_ATTEMPTS = 5;

type AttemptState = {
	failedAt: number[];
	lockedUntil: number | null;
};

declare global {
	var __sentenceAuthAttempts: Map<string, AttemptState> | undefined;
}

const attemptStore =
	globalThis.__sentenceAuthAttempts ?? new Map<string, AttemptState>();

if (!globalThis.__sentenceAuthAttempts) {
	globalThis.__sentenceAuthAttempts = attemptStore;
}

function getRequiredEnv(name: "ACCESS_PASSWORD" | "AUTH_SECRET") {
	const value = process.env[name];

	if (!value) {
		throw new Error(`${name} is not configured.`);
	}

	return value;
}

function getNow() {
	return Date.now();
}

function pruneState(state: AttemptState, now: number) {
	state.failedAt = state.failedAt.filter(
		(timestamp) => now - timestamp < LOCK_WINDOW_MS,
	);

	if (state.lockedUntil !== null && state.lockedUntil <= now) {
		state.lockedUntil = null;
	}
}

function getOrCreateState(key: string, now: number) {
	const existing = attemptStore.get(key);

	if (existing) {
		pruneState(existing, now);
		return existing;
	}

	const state: AttemptState = { failedAt: [], lockedUntil: null };
	attemptStore.set(key, state);
	return state;
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

async function sign(value: string) {
	const secret = getRequiredEnv("AUTH_SECRET");
	const encoder = new TextEncoder();
	const key = await crypto.subtle.importKey(
		"raw",
		encoder.encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	const signature = await crypto.subtle.sign(
		"HMAC",
		key,
		encoder.encode(value),
	);
	return Array.from(new Uint8Array(signature), (byte) =>
		byte.toString(16).padStart(2, "0"),
	).join("");
}

export async function createSessionToken() {
	const expiresAt = String(getNow() + SESSION_DURATION_MS);
	const signature = await sign(expiresAt);
	return `${expiresAt}.${signature}`;
}

export async function verifySessionToken(token: string) {
	const [expiresAt, actualSignature] = token.split(".");

	if (!expiresAt || !actualSignature) {
		return false;
	}

	const expiresAtNumber = Number(expiresAt);

	if (!Number.isFinite(expiresAtNumber) || expiresAtNumber <= getNow()) {
		return false;
	}

	const expectedSignature = await sign(expiresAt);
	return timingSafeEqual(actualSignature, expectedSignature);
}

export function getClientKey(request: Pick<NextRequest, "headers"> | Request) {
	const forwardedFor = request.headers.get("x-forwarded-for");
	const realIp = request.headers.get("x-real-ip");
	const userAgent = request.headers.get("user-agent") ?? "unknown";
	const ip = forwardedFor?.split(",")[0]?.trim() || realIp || "unknown";
	return `${ip}:${userAgent}`;
}

export function getLockStatus(key: string) {
	const now = getNow();
	const state = getOrCreateState(key, now);

	return {
		isLocked: state.lockedUntil !== null && state.lockedUntil > now,
		remainingMs:
			state.lockedUntil !== null && state.lockedUntil > now
				? state.lockedUntil - now
				: 0,
	};
}

export function recordFailedAttempt(key: string) {
	const now = getNow();
	const state = getOrCreateState(key, now);
	state.failedAt.push(now);

	if (state.failedAt.length >= MAX_FAILED_ATTEMPTS) {
		state.lockedUntil = now + LOCK_WINDOW_MS;
		state.failedAt = [];
	}

	attemptStore.set(key, state);

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

export function clearFailedAttempts(key: string) {
	attemptStore.delete(key);
}

export function isValidPassword(password: string) {
	return timingSafeEqual(password, getRequiredEnv("ACCESS_PASSWORD"));
}

export function getSessionMaxAgeSeconds() {
	return SESSION_DURATION_MS / 1000;
}

export function formatRemainingLockTime(remainingMs: number) {
	const remainingMinutes = Math.ceil(remainingMs / (1000 * 60));
	return `${remainingMinutes}分後に再試行してください。`;
}
