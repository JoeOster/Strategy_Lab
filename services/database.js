import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

let db;

export async function getDb() {
  if (!db) {
    try {
      db = await open({
        filename: './db/strategy_lab.db',
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
        INSERT OR IGNORE INTO advice_sources (id, name, type, description) VALUES (1, 'Dummy Source', 'person', 'This is a dummy source for testing purposes.');
      `);
    } catch (err) {
      console.error('Error connecting to the database:', err);
      throw err;
    }
  }
  return db;
}
