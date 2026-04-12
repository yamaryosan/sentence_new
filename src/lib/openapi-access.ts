export function isOpenApiPublicEnabled() {
	return process.env.NODE_ENV !== "production";
}
