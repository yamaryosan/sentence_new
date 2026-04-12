import { NextResponse } from "next/server";
import { ApiErrorResponseSchema } from "@/lib/api-schemas/common";

export function jsonApiError(message: string, status: number) {
	return NextResponse.json(ApiErrorResponseSchema.parse({ error: message }), {
		status,
	});
}
