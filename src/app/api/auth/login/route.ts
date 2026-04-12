import { NextRequest, NextResponse } from "next/server";
import {
	AUTH_COOKIE_NAME,
	clearFailedAttempts,
	createSessionToken,
	formatRemainingLockTime,
	getClientKey,
	getLockStatus,
	getSessionMaxAgeSeconds,
	isValidPassword,
	recordFailedAttempt,
} from "@/lib/auth";
import { LoginRequestSchema } from "@/lib/api-schemas/auth";
import { jsonApiError } from "@/lib/api-response";
import { readJsonObject } from "@/lib/request-json";

export async function POST(request: NextRequest) {
	try {
		const clientKey = getClientKey(request);
		const lockStatus = await getLockStatus(clientKey);

		if (lockStatus.isLocked) {
			return jsonApiError(
				`ログインは一時的にロックされています。${formatRemainingLockTime(lockStatus.remainingMs)}`,
				429,
			);
		}

		const body = await readJsonObject(request);
		if (body === null) {
			return jsonApiError("リクエスト形式が不正です。", 400);
		}
		const parsedBody = LoginRequestSchema.safeParse(body);
		if (!parsedBody.success) {
			return jsonApiError("パスワードを入力してください。", 400);
		}
		const { password } = parsedBody.data;

		if (!isValidPassword(password)) {
			const result = await recordFailedAttempt(clientKey);
			const errorMessage = result.isLocked
				? `ログインは一時的にロックされています。${formatRemainingLockTime(result.remainingMs)}`
				: "パスワードが違います。";

			return jsonApiError(errorMessage, 401);
		}

		await clearFailedAttempts(clientKey);

		const response = NextResponse.json({ ok: true });

		response.cookies.set({
			name: AUTH_COOKIE_NAME,
			value: await createSessionToken(),
			httpOnly: true,
			sameSite: "lax",
			secure: process.env.NODE_ENV === "production",
			path: "/",
			maxAge: getSessionMaxAgeSeconds(),
		});

		return response;
	} catch (error) {
		if (error instanceof Error) {
			console.error("Login API error:", error.message);

			if (
				error.message.includes("ACCESS_PASSWORD is not configured") ||
				error.message.includes("AUTH_SECRET is not configured") ||
				error.message.includes(
					"UPSTASH_REDIS_REST_URL is not configured",
				) ||
				error.message.includes(
					"UPSTASH_REDIS_REST_TOKEN is not configured",
				)
			) {
				return jsonApiError(error.message, 500);
			}
		}

		return jsonApiError(
			"認証設定が不足しています。環境変数を確認してください。",
			500,
		);
	}
}
