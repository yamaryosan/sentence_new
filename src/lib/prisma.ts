import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";
import { PrismaTiDBCloud } from "@tidbcloud/prisma-adapter";
import type { PoolConfig } from "mariadb";

const globalForPrisma = globalThis as unknown as {
	prisma?: PrismaClient;
};

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
	throw new Error("DATABASE_URL is not set.");
}

const databaseUrl = new URL(connectionString);

if (databaseUrl.protocol !== "mysql:") {
	throw new Error(
		`DATABASE_URL must use the mysql:// protocol. Received: ${databaseUrl.protocol}`,
	);
}

const sslAccept = databaseUrl.searchParams.get("sslaccept");
const isTiDBCloud = databaseUrl.hostname.endsWith(".tidbcloud.com");

function createMariaDbAdapter() {
	const adapterConfig: PoolConfig = {
		host: databaseUrl.hostname,
		port: databaseUrl.port ? Number.parseInt(databaseUrl.port, 10) : 3306,
		user: decodeURIComponent(databaseUrl.username),
		password: decodeURIComponent(databaseUrl.password),
		database: databaseUrl.pathname.replace(/^\//, ""),
	};

	if (sslAccept === "strict") {
		adapterConfig.ssl = {
			rejectUnauthorized: true,
		};
	} else if (sslAccept) {
		adapterConfig.ssl = {
			rejectUnauthorized: false,
		};
	}

	return new PrismaMariaDb(adapterConfig);
}

const adapter = isTiDBCloud
	? new PrismaTiDBCloud({
			url: connectionString,
	  })
	: createMariaDbAdapter();

function createPrismaClient() {
	return new PrismaClient({
		adapter,
		log:
			process.env.NODE_ENV === "development"
				? ["error", "warn"]
				: ["error"],
	});
}

function hasRequiredDelegates(client: PrismaClient) {
	const candidate = client as unknown as Record<string, unknown>;
	return "sentence" in candidate && "unsafeTerm" in candidate;
}

const cachedPrisma = globalForPrisma.prisma;

export const prisma =
	cachedPrisma && hasRequiredDelegates(cachedPrisma)
		? cachedPrisma
		: createPrismaClient();

if (process.env.NODE_ENV !== "production") {
	globalForPrisma.prisma = prisma;
}
