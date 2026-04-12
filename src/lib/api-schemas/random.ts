import { z } from "zod";

export const SentenceSchema = z
	.object({
		id: z.number().int().positive(),
		content: z.string(),
	})
	.meta({
		id: "Sentence",
		description: "保存されている文",
	});

export const RandomSentencesResponseSchema = z
	.object({
		sentences: z.array(SentenceSchema),
		limit: z.number().int().positive(),
		count: z.number().int().min(0),
	})
	.meta({
		id: "RandomSentencesResponse",
		description: "ランダム取得APIのレスポンス",
	});
