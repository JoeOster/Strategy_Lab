import path from 'path';
import { fileURLToPath } from 'url';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function queryIntcTransactions() {
  let db;
  try {
    db = await open({
      filename: path.resolve(__dirname, '../../db/strategy_lab.db'),
      driver: sqlite3.Database,
    });

    const intcTransactions = await db.all(
      "SELECT * FROM transactions WHERE ticker = 'INTC'"
    );
    console.log(JSON.stringify(intcTransactions, null, 2));
  } catch (error) {
    console.error('Error querying database:', error);
  } finally {
    if (db) {
      await db.close();
    }
  }
}

queryIntcTransactions();
