import path from "node:path";
import { fileURLToPath } from "node:url";
import { open } from "sqlite";
import sqlite3 from "sqlite3";

let db;

export async function initializeDatabase() {
	if (db) return db;
	try {
		db = await open({
			// Defer DB path resolution to avoid race conditions
			filename:
				process.env.DB_FILE ||
				path.resolve(
					path.dirname(fileURLToPath(import.meta.url)),
					"../db/strategy_lab.db",
				),
			driver: sqlite3.Database,
		});

		// Log migrations for debugging
		db.on("migrating", (data) => {
			console.log(`Applying migration: ${data.name}`);
		});

		await db.migrate({
			migrationsPath: path.resolve(
				path.dirname(fileURLToPath(import.meta.url)),
				"./migrations",
			),
			// REMOVED: force: "last"
			// We want standard behavior: run all pending migrations (001 then 002)
		});

		return db;
	} catch (error) {
		console.error("Failed to initialize database:", error);
		process.exit(1);
	}
}

export async function getDb() {
	if (db) return db;
	return initializeDatabase();
}
