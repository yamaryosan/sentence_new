import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MAX_TERM_LENGTH = 100;

function buildUnsafeTermsErrorResponse(
	error: unknown,
	fallbackMessage: string,
) {
	if (error instanceof Prisma.PrismaClientKnownRequestError) {
		if (error.code === "P2021" || error.code === "P2022") {
			return NextResponse.json(
				{
					error: "UnsafeTermテーブル定義が最新ではありません。`npm run prisma:migrate` を実行してください。",
				},
				{ status: 500 },
			);
		}
	}

	if (error instanceof Prisma.PrismaClientInitializationError) {
		return NextResponse.json(
			{
				error: "データベース接続に失敗しました。DATABASE_URL とDB状態を確認してください。",
			},
			{ status: 500 },
		);
	}

	console.error("[unsafe-terms] API error:", error);
	return NextResponse.json({ error: fallbackMessage }, { status: 500 });
}

export async function GET() {
	try {
		const terms = await prisma.unsafeTerm.findMany({
			orderBy: [{ createdAt: "desc" }, { id: "desc" }],
		});
		return NextResponse.json({ terms });
	} catch (error) {
		return buildUnsafeTermsErrorResponse(
			error,
			"アンセーフ用語一覧の取得に失敗しました。",
		);
	}
}

export async function POST(request: NextRequest) {
	const body = (await request.json()) as { term?: unknown };
	const term = typeof body.term === "string" ? body.term.trim() : "";

	if (term.length === 0) {
		return NextResponse.json(
			{ error: "用語を入力してください。" },
			{ status: 400 },
		);
	}

	if (term.length > MAX_TERM_LENGTH) {
		return NextResponse.json(
			{
				error: `用語は${MAX_TERM_LENGTH}文字以内で入力してください。`,
			},
			{ status: 400 },
		);
	}

	try {
		const created = await prisma.unsafeTerm.create({
			data: { term },
		});
		return NextResponse.json({ term: created }, { status: 201 });
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			if (error.code === "P2002") {
				return NextResponse.json(
					{ error: "同じ用語はすでに登録されています。" },
					{ status: 409 },
				);
			}
		}

		return buildUnsafeTermsErrorResponse(
			error,
			"アンセーフ用語の登録に失敗しました。",
		);
	}
}

export async function DELETE(request: NextRequest) {
	const idParam = request.nextUrl.searchParams.get("id");
	const id = Number(idParam);

	if (!Number.isInteger(id) || id <= 0) {
		return NextResponse.json(
			{ error: "削除対象のidが不正です。" },
			{ status: 400 },
		);
	}

	try {
		await prisma.unsafeTerm.delete({
			where: { id },
		});
		return NextResponse.json({ id });
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			if (error.code === "P2025") {
				return NextResponse.json(
					{ error: "指定した用語が見つかりません。" },
					{ status: 404 },
				);
			}
		}

		return buildUnsafeTermsErrorResponse(
			error,
			"アンセーフ用語の削除に失敗しました。",
		);
	}
}
