import { z } from "zod";
import { SentenceSchema } from "@/lib/api-schemas/random";

const MAX_SEARCH_QUERY_LENGTH = 40;

export const SearchSortOptionSchema = z.enum(["id-asc", "content-asc"]).meta({
	id: "SearchSortOption",
	description: "検索結果のソート順",
});

export const SearchQuerySchema = z
	.object({
		q: z
			.string()
			.min(1, "検索キーワードを入力してください。")
			.max(
				MAX_SEARCH_QUERY_LENGTH,
				`検索キーワードは${MAX_SEARCH_QUERY_LENGTH}文字以内で入力してください。`,
			),
		sort: SearchSortOptionSchema.optional(),
		unsafeMode: z.enum(["true", "false"]).optional(),
	})
	.meta({
		id: "SearchQuery",
		description: "検索APIのクエリパラメータ",
	});

export const SearchSentencesResponseSchema = z
	.object({
		sentences: z.array(SentenceSchema),
	})
	.meta({
		id: "SearchSentencesResponse",
		description: "検索APIのレスポンス",
	});
