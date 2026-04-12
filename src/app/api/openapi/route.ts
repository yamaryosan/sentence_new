import { NextResponse } from "next/server";
import { isOpenApiPublicEnabled } from "@/lib/openapi-access";
import { generateOpenApiDocument } from "@/lib/openapi";

export function GET() {
	if (!isOpenApiPublicEnabled()) {
		return NextResponse.json({ error: "Not Found" }, { status: 404 });
	}

	return NextResponse.json(generateOpenApiDocument());
}
