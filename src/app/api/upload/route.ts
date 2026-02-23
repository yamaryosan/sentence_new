import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
	const formData = await request.formData();
	const file = formData.get("file");

	if (!(file instanceof File)) {
		return NextResponse.json(
			{ error: "ファイルが見つかりません。" },
			{ status: 400 },
		);
	}

	const isTxtFile =
		file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt");

	if (!isTxtFile) {
		return NextResponse.json(
			{ error: ".txtファイルのみアップロードできます。" },
			{ status: 400 },
		);
	}

	const text = await file.text();
	const contents = text
		.replace(/\r\n/g, "\n")
		.split("\n\n")
		.map((chunk) => chunk.trim())
		.filter((chunk) => chunk.length > 0);

	if (contents.length === 0) {
		return NextResponse.json(
			{ error: "保存対象のテキストが見つかりませんでした。" },
			{ status: 400 },
		);
	}

	try {
		const result = await prisma.sentence.createMany({
			data: contents.map((content) => ({ content })),
		});

		return NextResponse.json({ count: result.count });
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
			{ error: "データ保存中にエラーが発生しました。" },
			{ status: 500 },
		);
	}
}
