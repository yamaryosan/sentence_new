import { z } from "zod";

export const UploadCountResponseSchema = z
	.object({
		count: z.number().int().min(0),
	})
	.meta({
		id: "UploadCountResponse",
		description: "アップロード/削除件数レスポンス",
	});
