import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MAX_QUERY_LENGTH = 200;

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const rawQuery = searchParams.get("q") ?? "";
	const query = rawQuery.trim();

	if (query.length === 0) {
		return NextResponse.json(
			{ error: "検索キーワードを入力してください。" },
			{ status: 400 },
		);
	}

	if (query.length > MAX_QUERY_LENGTH) {
		return NextResponse.json(
			{ error: `検索キーワードは${MAX_QUERY_LENGTH}文字以内で入力してください。` },
			{ status: 400 },
		);
	}

	try {
		const sentences = await prisma.sentence.findMany({
			where: {
				content: {
					contains: query,
					mode: "insensitive",
				},
			},
			orderBy: { id: "asc" },
		});

		return NextResponse.json({ sentences });
	} catch (error) {
		if (
			error instanceof Prisma.PrismaClientKnownRequestError &&
			error.code === "P2021"
		) {
			return NextResponse.json(
				{
					error:
						"Sentenceテーブルが存在しません。`npm run prisma:migrate` を実行してください。",
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
