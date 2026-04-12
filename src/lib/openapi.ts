import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import {
	ApiErrorResponseSchema,
	LoginRequestSchema,
	LoginSuccessResponseSchema,
} from "@/lib/api-schemas/auth";

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
