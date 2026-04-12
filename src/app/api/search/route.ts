import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import {
	SearchQuerySchema,
	SearchSentencesResponseSchema,
} from "@/lib/api-schemas/search";
import { jsonApiError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
	const parsedQuery = SearchQuerySchema.safeParse({
		q: (request.nextUrl.searchParams.get("q") ?? "").trim(),
		sort: request.nextUrl.searchParams.get("sort") ?? undefined,
		unsafeMode: request.nextUrl.searchParams.get("unsafeMode") ?? undefined,
	});
	if (!parsedQuery.success) {
		return jsonApiError(
			parsedQuery.error.issues[0]?.message ??
				"リクエスト形式が不正です。",
			400,
		);
	}
	const { q: query, sort, unsafeMode } = parsedQuery.data;
	const isUnsafeSearchModeEnabled = unsafeMode === "true";

	try {
		const unsafeTerms = await prisma.unsafeTerm.findMany({
			select: { term: true },
		});
		const baseWhere: Prisma.SentenceWhereInput = {
			content: {
				contains: query,
			},
		};
		const unsafeTermFilters = unsafeTerms.map(({ term }) => ({
			content: { contains: term },
		}));
		const where: Prisma.SentenceWhereInput = isUnsafeSearchModeEnabled
			? baseWhere
			: {
					AND:
						unsafeTermFilters.length > 0
							? [baseWhere, { NOT: { OR: unsafeTermFilters } }]
							: [baseWhere],
				};

		const sentences = await prisma.sentence.findMany({
			where,
			orderBy:
				sort === "content-asc"
					? [{ content: "asc" }, { id: "asc" }]
					: [{ id: "asc" }],
		});

		return NextResponse.json(
			SearchSentencesResponseSchema.parse({ sentences }),
		);
	} catch (error) {
		if (
			error instanceof Prisma.PrismaClientKnownRequestError &&
			error.code === "P2021"
		) {
			return jsonApiError(
				"必要なテーブルが存在しません。`npm run prisma:migrate` を実行してください。",
				500,
			);
		}

		return jsonApiError("データ取得中にエラーが発生しました。", 500);
	}
}
