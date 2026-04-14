import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { RandomSentencesResponseSchema } from "@/lib/api-schemas/random";
import { jsonApiError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

const RANDOM_LIMIT = 200;

export async function GET() {
	try {
		const totalCount = await prisma.sentence.count();
		const take = Math.min(RANDOM_LIMIT, totalCount);
		const sentences =
			take === 0
				? []
				: await prisma.$queryRaw<Array<{ id: number; content: string }>>`
						SELECT id, content
						FROM Sentence
						ORDER BY RAND()
						LIMIT ${take}
					`;

		const responseBody = RandomSentencesResponseSchema.parse({
			sentences,
			limit: RANDOM_LIMIT,
			count: sentences.length,
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
		return jsonApiError("ランダム取得中にエラーが発生しました。", 500);
	}
}
