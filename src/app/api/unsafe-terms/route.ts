import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import {
	CreateUnsafeTermRequestSchema,
	CreateUnsafeTermResponseSchema,
	DeleteUnsafeTermQuerySchema,
	DeleteUnsafeTermResponseSchema,
	UnsafeTermsListResponseSchema,
} from "@/lib/api-schemas/unsafe-terms";
import { jsonApiError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { readJsonObject } from "@/lib/request-json";

function serializeUnsafeTerm(term: {
	id: number;
	term: string;
	createdAt: Date;
}) {
	return {
		id: term.id,
		term: term.term,
		createdAt: term.createdAt.toISOString(),
	};
}

function buildUnsafeTermsErrorResponse(
	error: unknown,
	fallbackMessage: string,
) {
	if (error instanceof Prisma.PrismaClientKnownRequestError) {
		if (error.code === "P2021" || error.code === "P2022") {
			return jsonApiError(
				"UnsafeTermテーブル定義が最新ではありません。`npm run prisma:migrate` を実行してください。",
				500,
			);
		}
	}

	if (error instanceof Prisma.PrismaClientInitializationError) {
		return jsonApiError(
			"データベース接続に失敗しました。DATABASE_URL とDB状態を確認してください。",
			500,
		);
	}

	console.error("[unsafe-terms] API error:", error);
	return jsonApiError(fallbackMessage, 500);
}

export async function GET() {
	try {
		const terms = await prisma.unsafeTerm.findMany({
			orderBy: [{ createdAt: "desc" }, { id: "desc" }],
		});
		const serializedTerms = terms.map(serializeUnsafeTerm);
		return NextResponse.json(
			UnsafeTermsListResponseSchema.parse({ terms: serializedTerms }),
		);
	} catch (error) {
		return buildUnsafeTermsErrorResponse(
			error,
			"アンセーフ用語一覧の取得に失敗しました。",
		);
	}
}

export async function POST(request: NextRequest) {
	const body = await readJsonObject(request);
	if (body === null) {
		return jsonApiError("リクエスト形式が不正です。", 400);
	}

	const parsedBody = CreateUnsafeTermRequestSchema.safeParse({
		term: typeof body.term === "string" ? body.term.trim() : "",
	});
	if (!parsedBody.success) {
		return jsonApiError(
			parsedBody.error.issues[0]?.message ?? "リクエスト形式が不正です。",
			400,
		);
	}
	const { term } = parsedBody.data;

	try {
		const created = await prisma.unsafeTerm.create({
			data: { term },
		});
		const serializedCreated = serializeUnsafeTerm(created);
		return NextResponse.json(
			CreateUnsafeTermResponseSchema.parse({ term: serializedCreated }),
			{ status: 201 },
		);
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			if (error.code === "P2002") {
				return jsonApiError("同じ用語はすでに登録されています。", 409);
			}
		}

		return buildUnsafeTermsErrorResponse(
			error,
			"アンセーフ用語の登録に失敗しました。",
		);
	}
}

export async function DELETE(request: NextRequest) {
	const parsedQuery = DeleteUnsafeTermQuerySchema.safeParse({
		id: Number(request.nextUrl.searchParams.get("id")),
	});
	if (!parsedQuery.success) {
		return jsonApiError("削除対象のidが不正です。", 400);
	}
	const { id } = parsedQuery.data;

	try {
		await prisma.unsafeTerm.delete({
			where: { id },
		});
		return NextResponse.json(DeleteUnsafeTermResponseSchema.parse({ id }));
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			if (error.code === "P2025") {
				return jsonApiError("指定した用語が見つかりません。", 404);
			}
		}

		return buildUnsafeTermsErrorResponse(
			error,
			"アンセーフ用語の削除に失敗しました。",
		);
	}
}
