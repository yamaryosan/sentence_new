import { NextRequest } from "next/server";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { jwtVerify, SignJWT } from "jose";

export const AUTH_COOKIE_NAME = "sentence_auth";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7;
const SESSION_DURATION_SECONDS = SESSION_DURATION_MS / 1000;
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_WINDOW_DURATION = "15 m";

let redisClient: Redis | null = null;
let loginFailRatelimit: Ratelimit | null = null;

// 環境変数を安全に取得
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

// JWTの署名と検証に使用するキーを取得
function getAuthSecretKey() {
	return new TextEncoder().encode(getRequiredEnv("AUTH_SECRET"));
}

function getRedisClient() {
	if (redisClient) {
		return redisClient;
	}

	redisClient = new Redis({
		url: getRequiredEnv("UPSTASH_REDIS_REST_URL"),
		token: getRequiredEnv("UPSTASH_REDIS_REST_TOKEN"),
	});
	return redisClient;
}

function getLoginFailRatelimit() {
	if (loginFailRatelimit) {
		return loginFailRatelimit;
	}

	loginFailRatelimit = new Ratelimit({
		redis: getRedisClient(),
		limiter: Ratelimit.fixedWindow(MAX_FAILED_ATTEMPTS, LOCK_WINDOW_DURATION),
		prefix: "sentence-auth-login-fail",
	});
	return loginFailRatelimit;
}

// タイミング攻撃に対する安全な文字列比較
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

// クライアントを一意に識別するキーを生成
export function getClientKey(request: Pick<NextRequest, "headers"> | Request) {
	const forwardedFor = request.headers.get("x-forwarded-for");
	const realIp = request.headers.get("x-real-ip");
	const userAgent = request.headers.get("user-agent") ?? "unknown";
	const ip = forwardedFor?.split(",")[0]?.trim() || realIp || "unknown";
	return `${ip}:${userAgent}`;
}

export async function getLockStatus(key: string) {
	const now = getNow();
	const { remaining, reset } = await getLoginFailRatelimit().getRemaining(key);
	const isLocked = remaining <= 0 && reset > now;

	return {
		isLocked,
		remainingMs: isLocked ? reset - now : 0,
	};
}

export async function recordFailedAttempt(key: string) {
	const now = getNow();
	const result = await getLoginFailRatelimit().limit(key);
	const isLocked = !result.success;
	const remainingMs = isLocked ? Math.max(0, result.reset - now) : 0;

	return {
		isLocked,
		remainingMs,
		remainingAttempts: Math.max(0, result.remaining),
	};
}

export async function clearFailedAttempts(key: string) {
	await getLoginFailRatelimit().resetUsedTokens(key);
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
