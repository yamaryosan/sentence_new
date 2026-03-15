import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const RANDOM_LIMIT = 200;

type RandomSentenceRow = {
	id: number;
	content: string;
};

export async function GET() {
	try {
		const sentences = await prisma.$queryRaw<RandomSentenceRow[]>`
			SELECT id, content
			FROM "Sentence"
			ORDER BY RANDOM()
			LIMIT ${RANDOM_LIMIT}
		`;

		return NextResponse.json({
			sentences,
			limit: RANDOM_LIMIT,
			count: sentences.length,
		});
	} catch (error) {
		if (
			error instanceof Prisma.PrismaClientKnownRequestError &&
			error.code === "P2021"
		) {
			return NextResponse.json(
				{
					error: "Sentenceテーブルが存在しません。`npm run prisma:migrate` を実行してください。",
				},
				{ status: 500 },
			);
		}

		return NextResponse.json(
			{ error: "ランダム取得中にエラーが発生しました。" },
			{ status: 500 },
		);
	}
}
