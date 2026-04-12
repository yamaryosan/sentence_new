import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { jsonApiError } from "@/lib/api-response";
import { ViewSentencesResponseSchema } from "@/lib/api-schemas/view";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 200;

export async function GET(request: NextRequest) {
	try {
		const sort = request.nextUrl.searchParams.get("sort");
		const pageParam = request.nextUrl.searchParams.get("page");
		const parsedPage = Number(pageParam);
		const requestedPage =
			Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
		const orderBy: Prisma.SentenceOrderByWithRelationInput[] =
			sort === "content-asc"
				? [{ content: "asc" }, { id: "asc" }]
				: [{ id: "asc" }];
		const totalCount = await prisma.sentence.count();
		const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
		const currentPage = Math.min(requestedPage, totalPages);
		const sentences = await prisma.sentence.findMany({
			orderBy,
			skip: (currentPage - 1) * PAGE_SIZE,
			take: PAGE_SIZE,
		});

		const responseBody = ViewSentencesResponseSchema.parse({
			sentences,
			page: currentPage,
			pageSize: PAGE_SIZE,
			totalCount,
			totalPages,
		});
		return NextResponse.json(responseBody);
	} catch (error) {
		if (
			error instanceof Prisma.PrismaClientKnownRequestError &&
			error.code === "P2021"
		) {
			return jsonApiError(
				"Sentenceテーブルが存在しません。`npm run prisma:migrate` を実行してください。",
				500,
			);
		}

		return jsonApiError("データ取得中にエラーが発生しました。", 500);
	}
}
