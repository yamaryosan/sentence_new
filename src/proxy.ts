import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { isOpenApiPublicEnabled } from "@/lib/openapi-access";

const PUBLIC_PATHS = new Set(["/", "/login"]);
const PUBLIC_PREFIXES = ["/_next", "/api/auth/login", "/api/auth/logout"];

// 公開されているパスかどうかを判定
function isPublicPath(pathname: string) {
	if (PUBLIC_PATHS.has(pathname)) {
		return true;
	}

	if (pathname === "/favicon.ico") {
		return true;
	}

	if (
		isOpenApiPublicEnabled() &&
		(pathname === "/docs" || pathname.startsWith("/api/openapi"))
	) {
		return true;
	}

	return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export async function proxy(request: NextRequest) {
	const { pathname, search } = request.nextUrl;

	if (isPublicPath(pathname)) {
		return NextResponse.next();
	}

	const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

	// 認証トークンが存在し、かつ有効であればリクエストを続行
	if (token && (await verifySessionToken(token))) {
		return NextResponse.next();
	}

	// APIリクエストの場合はJSONエラーを返す
	if (pathname.startsWith("/api/")) {
		return NextResponse.json(
			{ error: "認証が必要です。" },
			{ status: 401 },
		);
	}

	// それ以外はログインページへリダイレクト
	const loginUrl = new URL("/login", request.url);
	loginUrl.searchParams.set("next", `${pathname}${search}`);
	return NextResponse.redirect(loginUrl);
}

export const config = {
	matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
