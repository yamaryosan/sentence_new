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
import { readJsonObject } from "@/lib/request-json";

export async function POST(request: NextRequest) {
	try {
		const clientKey = getClientKey(request);
		const lockStatus = await getLockStatus(clientKey);

		if (lockStatus.isLocked) {
			return NextResponse.json(
				{
					error: `ログインは一時的にロックされています。${formatRemainingLockTime(lockStatus.remainingMs)}`,
				},
				{ status: 429 },
			);
		}

		const body = await readJsonObject(request);
		if (body === null) {
			return NextResponse.json(
				{ error: "リクエスト形式が不正です。" },
				{ status: 400 },
			);
		}
		const parsedBody = LoginRequestSchema.safeParse(body);
		if (!parsedBody.success) {
			return NextResponse.json(
				{ error: "パスワードを入力してください。" },
				{ status: 400 },
			);
		}
		const { password } = parsedBody.data;

		if (!isValidPassword(password)) {
			const result = await recordFailedAttempt(clientKey);
			const errorMessage = result.isLocked
				? `ログインは一時的にロックされています。${formatRemainingLockTime(result.remainingMs)}`
				: "パスワードが違います。";

			return NextResponse.json({ error: errorMessage }, { status: 401 });
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
				return NextResponse.json(
					{ error: error.message },
					{ status: 500 },
				);
			}
		}

		return NextResponse.json(
			{ error: "認証設定が不足しています。環境変数を確認してください。" },
			{ status: 500 },
		);
	}
}
