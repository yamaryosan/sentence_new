import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MAX_QUERY_LENGTH = 40;

export async function GET(request: NextRequest) {
	const rawQuery = request.nextUrl.searchParams.get("q") ?? "";
	const query = rawQuery.trim();
	const sort = request.nextUrl.searchParams.get("sort");
	const isUnsafeSearchModeEnabled =
		request.nextUrl.searchParams.get("unsafeMode") === "true";

	if (query.length === 0) {
		return NextResponse.json(
			{ error: "検索キーワードを入力してください。" },
			{ status: 400 },
		);
	}

	if (query.length > MAX_QUERY_LENGTH) {
		return NextResponse.json(
			{
				error: `検索キーワードは${MAX_QUERY_LENGTH}文字以内で入力してください。`,
			},
			{ status: 400 },
		);
	}

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

		return NextResponse.json({ sentences });
	} catch (error) {
		if (
			error instanceof Prisma.PrismaClientKnownRequestError &&
			error.code === "P2021"
		) {
			return NextResponse.json(
				{
					error: "必要なテーブルが存在しません。`npm run prisma:migrate` を実行してください。",
				},
				{ status: 500 },
			);
		}

		return NextResponse.json(
			{ error: "データ取得中にエラーが発生しました。" },
			{ status: 500 },
		);
	}
}
