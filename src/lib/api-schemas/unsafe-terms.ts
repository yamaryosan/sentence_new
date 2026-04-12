import { z } from "zod";

const MAX_UNSAFE_TERM_LENGTH = 100;

export const UnsafeTermSchema = z
	.object({
		id: z.number().int().positive(),
		term: z.string(),
		createdAt: z.string(),
	})
	.meta({
		id: "UnsafeTerm",
		description: "登録済みアンセーフ用語",
	});

export const UnsafeTermsListResponseSchema = z
	.object({
		terms: z.array(UnsafeTermSchema),
	})
	.meta({
		id: "UnsafeTermsListResponse",
		description: "アンセーフ用語一覧取得レスポンス",
	});

export const CreateUnsafeTermRequestSchema = z
	.object({
		term: z
			.string()
			.min(1, "用語を入力してください。")
			.max(
				MAX_UNSAFE_TERM_LENGTH,
				`用語は${MAX_UNSAFE_TERM_LENGTH}文字以内で入力してください。`,
			),
	})
	.meta({
		id: "CreateUnsafeTermRequest",
		description: "アンセーフ用語登録リクエスト",
	});

export const CreateUnsafeTermResponseSchema = z
	.object({
		term: UnsafeTermSchema,
	})
	.meta({
		id: "CreateUnsafeTermResponse",
		description: "アンセーフ用語登録レスポンス",
	});

export const DeleteUnsafeTermQuerySchema = z
	.object({
		id: z.number().int().positive(),
	})
	.meta({
		id: "DeleteUnsafeTermQuery",
		description: "アンセーフ用語削除クエリ",
	});

export const DeleteUnsafeTermResponseSchema = z
	.object({
		id: z.number().int().positive(),
	})
	.meta({
		id: "DeleteUnsafeTermResponse",
		description: "アンセーフ用語削除レスポンス",
	});
