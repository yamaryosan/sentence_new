import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const RANDOM_LIMIT = 200;

export async function GET() {
	try {
		const totalCount = await prisma.sentence.count();
		const take = Math.min(RANDOM_LIMIT, totalCount);
		const maxSkip = Math.max(0, totalCount - take);
		const skip = maxSkip === 0 ? 0 : Math.floor(Math.random() * (maxSkip + 1));
		const sentences =
			take === 0
				? []
				: await prisma.sentence.findMany({
						orderBy: { id: "asc" },
						skip,
						take,
				  });

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
