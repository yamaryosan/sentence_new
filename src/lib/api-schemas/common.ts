import { z } from "zod";

export const ApiErrorResponseSchema = z
	.object({
		error: z.string(),
	})
	.meta({
		id: "ApiErrorResponse",
		description: "APIエラーレスポンス",
	});
