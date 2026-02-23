import { NextResponse } from "next/server";

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
	const preview = text.slice(0, 100);

	return NextResponse.json({ preview });
}
