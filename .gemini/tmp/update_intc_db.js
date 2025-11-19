import path from 'path';
import { fileURLToPath } from 'url';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function updateIntcTransaction() {
  let db;
  try {
    db = await open({
      filename: path.resolve(__dirname, '../../db/strategy_lab.db'),
      driver: sqlite3.Database,
    });

    const result = await db.run(
      'UPDATE transactions SET quantity = -77 WHERE id = 4'
    );
    console.log(`Rows updated: ${result.changes}`);
  } catch (error) {
    console.error('Error updating database:', error);
  } finally {
    if (db) {
      await db.close();
    }
  }
}

updateIntcTransaction();
