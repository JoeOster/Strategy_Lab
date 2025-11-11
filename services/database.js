import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import fs from 'node:fs/promises';
import fsSync from 'node:fs';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', 'db', 'strategy_lab.db');

let db;

export async function getDb() {
  if (!db) {
    try {
      const filename = process.env.TEST_ENV ? ':memory:' : dbPath;

      db = await open({
        filename,
        driver: sqlite3.Database,
      });

      // Run migrations or initial setup
      await db.exec(`

        CREATE TABLE IF NOT EXISTS advice_sources (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          url TEXT,
          description TEXT,
          image_path TEXT,
          person_email TEXT,
          person_phone TEXT,
          person_app_type TEXT,
          person_app_handle TEXT,
          group_primary_contact TEXT,
          group_email TEXT,
          group_phone TEXT,
          group_app_type TEXT,
          group_app_handle TEXT,
          book_author TEXT,
          book_isbn TEXT,
          book_websites TEXT,
          book_pdfs TEXT,
          website_websites TEXT,
          website_pdfs TEXT
        );
        -- INSERT OR IGNORE INTO advice_sources (id, name, type, description) VALUES (1, 'Dummy Source', 'person', 'This is a dummy source for testing purposes.');
      `);
    } catch (err) {
      console.error('Error connecting to the database:', err);
      throw err;
    }
  }
  return db;
}

export async function clearDb() {
  if (db) {
    await db.close();
    db = null;
  }

  if (process.env.TEST_ENV) {
    // If in-memory database, no file to unlink.
    // The database is effectively cleared by closing and re-opening (which getDb will do).
    console.log('In-memory database cleared (connection closed).');
    return;
  }

  if (fsSync.existsSync(dbPath)) {
    // Retry mechanism for Windows EBUSY error
    const maxRetries = 5;
    let retries = 0;
    while (retries < maxRetries) {
      try {
        await fs.unlink(dbPath);
        console.log(`Successfully unlinked database: ${dbPath}`);
        return; // Success, exit function
      } catch (err) {
        if (err.code === 'EBUSY' && process.platform === 'win32') {
          console.warn(`Attempt ${retries + 1} to unlink database failed (EBUSY). Retrying...`);
          await new Promise(resolve => setTimeout(resolve, 100)); // Wait 100ms
          retries++;
        } else {
          throw err; // Re-throw other errors
        }
      }
    }
    throw new Error(`Failed to unlink database after ${maxRetries} retries: ${dbPath}`);
  }
}
