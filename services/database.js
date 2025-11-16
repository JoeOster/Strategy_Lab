import path from 'node:path';
import { fileURLToPath } from 'node:url'; // Import this
import { open } from 'sqlite';
// services/database.js
// --- START: FIX ---
import sqlite3 from 'sqlite3';
// --- END: FIX ---

// --- START: FIX ---
let db;

// --- START: FIX ---
export async function initializeDatabase() {
  // --- END: FIX ---
  if (db) return db;
  try {
    db = await open({
      // --- FIX: Defer DB path resolution to avoid race conditions with environment variables ---
      // The path is now resolved inside this function, ensuring process.env.DB_FILE is set.
      filename:
        process.env.DB_FILE ||
        path.resolve(
          path.dirname(fileURLToPath(import.meta.url)),
          '../db/strategy_lab.db'
        ),
      // --- END: FIX ---
      driver: sqlite3.Database,
    });

    // --- IMPROVEMENT: Add verbose logging for migrations ---
    // Listen for the 'migrating' event to log which script is being applied.
    db.on('migrating', (data) => {
      console.log(`Applying migration: ${data.name}`);
    });
    // --- END IMPROVEMENT ---

    await db.migrate({
      migrationsPath: path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        './migrations'
      ),
      // --- IMPROVEMENT: Use 'force' for a master schema approach ---
      // This tells the migrator to apply only the LATEST migration file.
      // Perfect for a single, consolidated schema file.
      force: 'last',
    });

    return db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

// --- START: FIX ---
export async function getDb() {
  // --- END: FIX ---
  if (db) return db;
  return initializeDatabase();
}

// --- START: REMOVED ---
// module.exports = {
//   initializeDatabase,
//   getDb,
// };
// --- END: REMOVED ---
