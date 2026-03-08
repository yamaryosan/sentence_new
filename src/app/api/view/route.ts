import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
	try {
		const sort = request.nextUrl.searchParams.get("sort");
		const sentences = await prisma.sentence.findMany({
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
