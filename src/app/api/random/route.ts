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
		const prismaErrorCode =
			error &&
			typeof error === "object" &&
			"code" in error &&
			typeof (error as { code?: unknown }).code === "string"
				? (error as { code: string }).code
				: undefined;

		console.error("[api/random] failed to fetch sentences", {
			name: error instanceof Error ? error.name : typeof error,
			message: error instanceof Error ? error.message : String(error),
			code: prismaErrorCode,
		});

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

		if (
			error instanceof Prisma.PrismaClientInitializationError ||
			(error instanceof Prisma.PrismaClientKnownRequestError &&
				error.code === "P1001")
		) {
			return NextResponse.json(
				{
					error:
						"データベース接続に失敗しました。TiDBのIP許可リストとDATABASE_URLを確認してください。",
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
