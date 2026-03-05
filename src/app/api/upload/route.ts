import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;
const INSERT_BATCH_SIZE = 500;

async function* parseParagraphs(file: File): AsyncGenerator<string> {
	const reader = file.stream().getReader();
	const decoder = new TextDecoder();
	let buffer = "";

	try {
		while (true) {
			const { value, done } = await reader.read();
			if (done) {
				break;
			}

			buffer += decoder.decode(value, { stream: true });
			buffer = buffer.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

			while (true) {
				const separatorIndex = buffer.indexOf("\n\n");
				if (separatorIndex === -1) {
					break;
				}

				const chunk = buffer.slice(0, separatorIndex).trim();
				if (chunk.length > 0) {
					yield chunk;
				}

				buffer = buffer.slice(separatorIndex + 2);
			}
		}

		buffer += decoder.decode();
		buffer = buffer.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
		const remaining = buffer.trim();
		if (remaining.length > 0) {
			yield remaining;
		}
	} finally {
		reader.releaseLock();
	}
}

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

	if (file.size > MAX_FILE_SIZE_BYTES) {
		return NextResponse.json(
			{
				error: `ファイルサイズは${Math.floor(
					MAX_FILE_SIZE_BYTES / (1024 * 1024),
				)}MB以下にしてください。`,
			},
			{ status: 400 },
		);
	}

	try {
		let totalCount = 0;
		let hasContent = false;
		let batch: { content: string }[] = [];

		for await (const paragraph of parseParagraphs(file)) {
			hasContent = true;
			batch.push({ content: paragraph });

			if (batch.length >= INSERT_BATCH_SIZE) {
				const result = await prisma.sentence.createMany({
					data: batch,
				});
				totalCount += result.count;
				batch = [];
			}
		}

		if (batch.length > 0) {
			const result = await prisma.sentence.createMany({ data: batch });
			totalCount += result.count;
		}

		if (!hasContent) {
			return NextResponse.json(
				{ error: "保存対象のテキストが見つかりませんでした。" },
				{ status: 400 },
			);
		}

		return NextResponse.json({ count: totalCount });
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
			{ error: "データ保存中にエラーが発生しました。" },
			{ status: 500 },
		);
	}
}
