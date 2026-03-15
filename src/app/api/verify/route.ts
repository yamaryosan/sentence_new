import { NextResponse } from "next/server";

const VERIFY_PASSWORD = "test";
const VERIFY_COOKIE_NAME = "upload_verified";

export async function POST(request: Request) {
	let password = "";

	try {
		const body = (await request.json()) as { password?: unknown };
		password = typeof body.password === "string" ? body.password : "";
	} catch {
		return NextResponse.json(
			{ error: "パスワードを送信してください。" },
			{ status: 400 },
		);
	}

	if (password !== VERIFY_PASSWORD) {
		return NextResponse.json(
			{ error: "パスワードが正しくありません。" },
			{ status: 401 },
		);
	}

	const response = NextResponse.json({ ok: true });
	response.cookies.set({
		name: VERIFY_COOKIE_NAME,
		value: "true",
		httpOnly: true,
		sameSite: "lax",
		path: "/",
	});
	return response;
}
