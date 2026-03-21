import { NextRequest } from "next/server";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { jwtVerify, SignJWT } from "jose";

export const AUTH_COOKIE_NAME = "sentence_auth";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7;
const SESSION_DURATION_SECONDS = SESSION_DURATION_MS / 1000;
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_WINDOW_DURATION = "15 m";
type RequiredEnvName =
	| "ACCESS_PASSWORD"
	| "AUTH_SECRET"
	| "UPSTASH_REDIS_REST_URL"
	| "UPSTASH_REDIS_REST_TOKEN";

let redisClient: Redis | null = null;
let loginFailRatelimit: Ratelimit | null = null;

function getRequiredEnv(name: RequiredEnvName) {
	const value = process.env[name];

	if (typeof value !== "string" || value.length === 0) {
		throw new Error(`${name} is not configured.`);
	}

	return value;
}

type AuthConfig = {
	accessPassword: string;
	authSecretKey: Uint8Array;
	upstashRedisRestUrl: string;
	upstashRedisRestToken: string;
};

let authConfig: AuthConfig | null = null;

function getAuthConfig() {
	if (authConfig) {
		return authConfig;
	}

	authConfig = {
		accessPassword: getRequiredEnv("ACCESS_PASSWORD"),
		authSecretKey: new TextEncoder().encode(getRequiredEnv("AUTH_SECRET")),
		upstashRedisRestUrl: getRequiredEnv("UPSTASH_REDIS_REST_URL"),
		upstashRedisRestToken: getRequiredEnv("UPSTASH_REDIS_REST_TOKEN"),
	};
	return authConfig;
}

function getRedisClient() {
	if (redisClient) {
		return redisClient;
	}

	redisClient = new Redis({
		url: getAuthConfig().upstashRedisRestUrl,
		token: getAuthConfig().upstashRedisRestToken,
	});
	return redisClient;
}

function getLoginFailRatelimit() {
	if (loginFailRatelimit) {
		return loginFailRatelimit;
	}

	loginFailRatelimit = new Ratelimit({
		redis: getRedisClient(),
		limiter: Ratelimit.slidingWindow(
			MAX_FAILED_ATTEMPTS,
			LOCK_WINDOW_DURATION,
		),
		prefix: "sentence-auth-login-fail",
	});
	return loginFailRatelimit;
}

export async function createSessionToken() {
	return new SignJWT({})
		.setProtectedHeader({ alg: "HS256" })
		.setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
		.sign(getAuthConfig().authSecretKey);
}

export async function verifySessionToken(token: string) {
	try {
		await jwtVerify(token, getAuthConfig().authSecretKey, {
			algorithms: ["HS256"],
		});
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
	const now = Date.now();
	const { remaining, reset } =
		await getLoginFailRatelimit().getRemaining(key);
	const isLocked = remaining === 0 && reset > now;

	return {
		isLocked,
		remainingMs: isLocked ? reset - now : 0,
	};
}

export async function recordFailedAttempt(key: string) {
	const now = Date.now();
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
	return password === getAuthConfig().accessPassword;
}

export function getSessionMaxAgeSeconds() {
	return SESSION_DURATION_SECONDS;
}

export function formatRemainingLockTime(remainingMs: number) {
	const remainingMinutes = Math.ceil(remainingMs / (1000 * 60));
	return `${remainingMinutes}分後に再試行してください。`;
}
