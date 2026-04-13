import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	experimental: {
		// proxy.ts を通るリクエストボディ上限（既定 10MB）を引き上げる
		// .txt 本文 50MB + multipart オーバーヘッドを考慮して 60MB に設定
		proxyClientMaxBodySize: "60mb",
	},
	turbopack: {
		root: process.cwd(),
	},
};

export default nextConfig;
