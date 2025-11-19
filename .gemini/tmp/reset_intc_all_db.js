import path from 'path';
import { fileURLToPath } from 'url';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function resetIntcAllTransactions() {
  let db;
  try {
    db = await open({
      filename: path.resolve(__dirname, '../../db/strategy_lab.db'),
      driver: sqlite3.Database,
    });

    // Delete all sell transactions for original_transaction_id = 3 (INTC buy)
    const deleteResult = await db.run(
      'DELETE FROM transactions WHERE original_transaction_id = 3'
    );
    console.log(`Deleted ${deleteResult.changes} sell transactions for INTC.`);

    // Update the original INTC buy transaction (id = 3)
    const updateResult = await db.run(
      "UPDATE transactions SET status = 'open', quantity_remaining = 77, updated_date = ? WHERE id = 3",
      new Date().toISOString()
    );
    console.log(`Updated ${updateResult.changes} INTC buy transaction.`);
  } catch (error) {
    console.error('Error resetting INTC transactions:', error);
  } finally {
    if (db) {
      await db.close();
    }
  }
}

resetIntcAllTransactions();
