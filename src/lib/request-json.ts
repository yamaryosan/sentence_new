function isJsonObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function readJsonObject(
	request: Request,
): Promise<Record<string, unknown> | null> {
	try {
		const body: unknown = await request.json();
		return isJsonObject(body) ? body : null;
	} catch {
		return null;
	}
}
