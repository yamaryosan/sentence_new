import { z } from "zod";
import { SentenceSchema } from "@/lib/api-schemas/random";

export const ViewSortOptionSchema = z.enum(["id-asc", "content-asc"]).meta({
	id: "ViewSortOption",
	description: "一覧表示のソート順",
});

export const ViewQuerySchema = z
	.object({
		sort: ViewSortOptionSchema.optional(),
		page: z.number().int().positive().optional(),
	})
	.meta({
		id: "ViewQuery",
		description: "一覧取得APIのクエリパラメータ",
	});

export const ViewSentencesResponseSchema = z
	.object({
		sentences: z.array(SentenceSchema),
		page: z.number().int().positive(),
		pageSize: z.number().int().positive(),
		totalCount: z.number().int().min(0),
		totalPages: z.number().int().positive(),
	})
	.meta({
		id: "ViewSentencesResponse",
		description: "一覧取得APIのレスポンス",
	});
