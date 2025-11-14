import fsSync from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

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
      // Run migrations
      const migrationsPath = path.join(__dirname, 'migrations');
      const migrationFiles = await fs.readdir(migrationsPath);
      const sortedMigrations = migrationFiles
        .filter((file) => file.endsWith('.sql'))
        .sort();

      for (const file of sortedMigrations) {
        const filePath = path.join(migrationsPath, file);
        const sql = await fs.readFile(filePath, 'utf8');
        await db.exec(sql);
        console.log(`Applied migration: ${file}`);
      }
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
          console.warn(
            `Attempt ${retries + 1} to unlink database failed (EBUSY). Retrying...`
          );
          await new Promise((resolve) => setTimeout(resolve, 100)); // Wait 100ms
          retries++;
        } else {
          throw err; // Re-throw other errors
        }
      }
    }
    throw new Error(
      `Failed to unlink database after ${maxRetries} retries: ${dbPath}`
    );
  }
}

export async function addWebApp(name) {
  const db = await getDb();
  const result = await db.run('INSERT INTO web_apps (name) VALUES (?)', name);
  return result.lastID;
}

export async function getWebApps() {
  const db = await getDb();
  return db.all('SELECT * FROM web_apps');
}

export async function deleteWebApp(id) {
  const db = await getDb();
  await db.run('DELETE FROM web_apps WHERE id = ?', id);
}
