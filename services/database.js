import path from 'node:path';
import { fileURLToPath } from 'node:url'; // Import this
import { open } from 'sqlite';
// services/database.js
// --- START: FIX ---
import sqlite3 from 'sqlite3';
// --- END: FIX ---

// --- START: FIX ---
// Recreate __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// --- END: FIX ---

let db;

// --- START: FIX ---
export async function initializeDatabase() {
  // --- END: FIX ---
  if (db) return db;
  try {
    db = await open({
      filename: path.resolve(__dirname, '../db/strategy_lab.db'),
      driver: sqlite3.Database,
    });
    await db.migrate({
      migrationsPath: path.resolve(__dirname, './migrations'),
    });
    console.log('Database connection and migrations successful.');
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
