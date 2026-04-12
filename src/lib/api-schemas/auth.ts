import { z } from "zod";

export const LoginRequestSchema = z
	.object({
		password: z.string().min(1),
	})
	.meta({
		id: "LoginRequest",
		description: "ログイン時のリクエストボディ",
	});

export const LoginSuccessResponseSchema = z
	.object({
		ok: z.literal(true),
	})
	.meta({
		id: "LoginSuccessResponse",
		description: "ログイン成功レスポンス",
	});
