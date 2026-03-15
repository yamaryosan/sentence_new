import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

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

const adapter = new PrismaMariaDb(connectionString);

export const prisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		adapter,
		log:
			process.env.NODE_ENV === "development"
				? ["error", "warn"]
				: ["error"],
	});

if (process.env.NODE_ENV !== "production") {
	globalForPrisma.prisma = prisma;
}
