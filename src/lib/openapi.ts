import {
	OpenAPIRegistry,
	OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";
import {
	LoginRequestSchema,
	LoginSuccessResponseSchema,
} from "@/lib/api-schemas/auth";
import { ApiErrorResponseSchema } from "@/lib/api-schemas/common";
import { RandomSentencesResponseSchema } from "@/lib/api-schemas/random";
import {
	SearchQuerySchema,
	SearchSentencesResponseSchema,
} from "@/lib/api-schemas/search";
import {
	CreateUnsafeTermRequestSchema,
	CreateUnsafeTermResponseSchema,
	DeleteUnsafeTermQuerySchema,
	DeleteUnsafeTermResponseSchema,
	UnsafeTermsListResponseSchema,
} from "@/lib/api-schemas/unsafe-terms";
import { UploadCountResponseSchema } from "@/lib/api-schemas/upload";
import {
	ViewQuerySchema,
	ViewSentencesResponseSchema,
} from "@/lib/api-schemas/view";

const registry = new OpenAPIRegistry();

registry.registerPath({
	method: "post",
	path: "/api/auth/login",
	summary: "ログイン",
	description: "パスワードで管理画面へログインします。",
	tags: ["auth"],
	request: {
		body: {
			required: true,
			content: {
				"application/json": {
					schema: LoginRequestSchema,
				},
			},
		},
	},
	responses: {
		200: {
			description: "ログイン成功",
			content: {
				"application/json": {
					schema: LoginSuccessResponseSchema,
				},
			},
		},
		400: {
			description: "入力不正",
			content: {
				"application/json": {
					schema: ApiErrorResponseSchema,
				},
			},
		},
		401: {
			description: "認証失敗",
			content: {
				"application/json": {
					schema: ApiErrorResponseSchema,
				},
			},
		},
		429: {
			description: "レート制限",
			content: {
				"application/json": {
					schema: ApiErrorResponseSchema,
				},
			},
		},
		500: {
			description: "サーバーエラー",
			content: {
				"application/json": {
					schema: ApiErrorResponseSchema,
				},
			},
		},
	},
});

registry.registerPath({
	method: "get",
	path: "/api/unsafe-terms",
	summary: "アンセーフ用語一覧取得",
	description: "登録済みのアンセーフ用語一覧を取得します。",
	tags: ["unsafe-terms"],
	responses: {
		200: {
			description: "取得成功",
			content: {
				"application/json": {
					schema: UnsafeTermsListResponseSchema,
				},
			},
		},
		500: {
			description: "サーバーエラー",
			content: {
				"application/json": {
					schema: ApiErrorResponseSchema,
				},
			},
		},
	},
});

registry.registerPath({
	method: "post",
	path: "/api/unsafe-terms",
	summary: "アンセーフ用語追加",
	description: "アンセーフ用語を1件追加します。",
	tags: ["unsafe-terms"],
	request: {
		body: {
			required: true,
			content: {
				"application/json": {
					schema: CreateUnsafeTermRequestSchema,
				},
			},
		},
	},
	responses: {
		201: {
			description: "追加成功",
			content: {
				"application/json": {
					schema: CreateUnsafeTermResponseSchema,
				},
			},
		},
		400: {
			description: "入力不正",
			content: {
				"application/json": {
					schema: ApiErrorResponseSchema,
				},
			},
		},
		409: {
			description: "重複エラー",
			content: {
				"application/json": {
					schema: ApiErrorResponseSchema,
				},
			},
		},
		500: {
			description: "サーバーエラー",
			content: {
				"application/json": {
					schema: ApiErrorResponseSchema,
				},
			},
		},
	},
});

registry.registerPath({
	method: "delete",
	path: "/api/unsafe-terms",
	summary: "アンセーフ用語削除",
	description: "指定したIDのアンセーフ用語を削除します。",
	tags: ["unsafe-terms"],
	request: {
		query: DeleteUnsafeTermQuerySchema,
	},
	responses: {
		200: {
			description: "削除成功",
			content: {
				"application/json": {
					schema: DeleteUnsafeTermResponseSchema,
				},
			},
		},
		400: {
			description: "入力不正",
			content: {
				"application/json": {
					schema: ApiErrorResponseSchema,
				},
			},
		},
		404: {
			description: "対象なし",
			content: {
				"application/json": {
					schema: ApiErrorResponseSchema,
				},
			},
		},
		500: {
			description: "サーバーエラー",
			content: {
				"application/json": {
					schema: ApiErrorResponseSchema,
				},
			},
		},
	},
});

registry.registerPath({
	method: "post",
	path: "/api/upload",
	summary: "文章アップロード",
	description: ".txtファイルをアップロードして文章を保存します。",
	tags: ["sentences"],
	request: {
		body: {
			required: true,
			content: {
				"multipart/form-data": {
					schema: {
						type: "object",
						required: ["file"],
						properties: {
							file: {
								type: "string",
								format: "binary",
								description: "アップロードするtxtファイル",
							},
						},
					},
				},
			},
		},
	},
	responses: {
		200: {
			description: "保存成功",
			content: {
				"application/json": {
					schema: UploadCountResponseSchema,
				},
			},
		},
		400: {
			description: "入力不正",
			content: {
				"application/json": {
					schema: ApiErrorResponseSchema,
				},
			},
		},
		500: {
			description: "サーバーエラー",
			content: {
				"application/json": {
					schema: ApiErrorResponseSchema,
				},
			},
		},
	},
});

registry.registerPath({
	method: "delete",
	path: "/api/upload",
	summary: "文章全削除",
	description: "保存済みの文章をすべて削除します。",
	tags: ["sentences"],
	responses: {
		200: {
			description: "削除成功",
			content: {
				"application/json": {
					schema: UploadCountResponseSchema,
				},
			},
		},
		500: {
			description: "サーバーエラー",
			content: {
				"application/json": {
					schema: ApiErrorResponseSchema,
				},
			},
		},
	},
});

registry.registerPath({
	method: "get",
	path: "/api/view",
	summary: "文一覧取得",
	description: "保存済みの文をページネーション付きで取得します。",
	tags: ["sentences"],
	request: {
		query: ViewQuerySchema,
	},
	responses: {
		200: {
			description: "取得成功",
			content: {
				"application/json": {
					schema: ViewSentencesResponseSchema,
				},
			},
		},
		500: {
			description: "サーバーエラー",
			content: {
				"application/json": {
					schema: ApiErrorResponseSchema,
				},
			},
		},
	},
});

registry.registerPath({
	method: "get",
	path: "/api/search",
	summary: "文検索",
	description: "キーワードで文を検索します。",
	tags: ["sentences"],
	request: {
		query: SearchQuerySchema,
	},
	responses: {
		200: {
			description: "取得成功",
			content: {
				"application/json": {
					schema: SearchSentencesResponseSchema,
				},
			},
		},
		400: {
			description: "入力不正",
			content: {
				"application/json": {
					schema: ApiErrorResponseSchema,
				},
			},
		},
		500: {
			description: "サーバーエラー",
			content: {
				"application/json": {
					schema: ApiErrorResponseSchema,
				},
			},
		},
	},
});

registry.registerPath({
	method: "get",
	path: "/api/random",
	summary: "ランダム文取得",
	description: "保存済みの文を最大200件ランダムな範囲から取得します。",
	tags: ["sentences"],
	responses: {
		200: {
			description: "取得成功",
			content: {
				"application/json": {
					schema: RandomSentencesResponseSchema,
				},
			},
		},
		500: {
			description: "サーバーエラー",
			content: {
				"application/json": {
					schema: ApiErrorResponseSchema,
				},
			},
		},
	},
});

const generator = new OpenApiGeneratorV3(registry.definitions);

export function generateOpenApiDocument() {
	return generator.generateDocument({
		openapi: "3.0.0",
		info: {
			title: "Sentence Database API",
			version: "1.0.0",
			description: "Sentence Database の API 仕様書",
		},
		servers: [{ url: "/" }],
	});
}
