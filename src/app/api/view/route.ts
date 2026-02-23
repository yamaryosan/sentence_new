import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
	try {
		const sentences = await prisma.sentence.findMany({
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
