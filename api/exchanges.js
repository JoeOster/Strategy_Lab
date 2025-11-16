// api/exchanges.js
// --- START: FIX ---
import express from 'express';
import { getDb } from '../services/database.js'; // Added the missing import
const router = express.Router();
// --- END: FIX ---

// GET /api/exchanges
router.get('/', async (req, res) => {
  try {
    // --- START: FIX ---
    const db = await getDb(); // Use getDb()
    const exchanges = await db.all('SELECT * FROM exchanges');
    // --- END: FIX ---
    res.json(exchanges);
  } catch (error) {
    console.error('Failed to get exchanges:', error);
    res.status(500).json({ error: 'Failed to get exchanges' });
  }
});

// POST /api/exchanges
router.post('/', async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Exchange name is required' });
  }
  try {
    // --- START: FIX ---
    const db = await getDb(); // Use getDb()
    const result = await db.run('INSERT INTO exchanges (name) VALUES (?)', [
      name,
    ]);
    // --- END: FIX ---
    res.status(201).json({ id: result.lastID, name });
  } catch (error) {
    console.error('Failed to add exchange:', error);
    res.status(500).json({ error: 'Failed to add exchange' });
  }
});

// DELETE /api/exchanges/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // --- START: FIX ---
    const db = await getDb(); // Use getDb()
    await db.run('DELETE FROM exchanges WHERE id = ?', [id]);
    // --- END: FIX ---
    res.status(200).json({ message: 'Exchange deleted successfully' });
  } catch (error) {
    console.error('Failed to delete exchange:', error);
    res.status(500).json({ error: 'Failed to delete exchange' });
  }
});

// GET /api/exchanges/:id/transactions
router.get('/:id/transactions', async (req, res) => {
  const { id } = req.params;
  try {
    // --- START: FIX ---
    const db = await getDb(); // Use getDb()
    const transactions = await db.all(
      'SELECT * FROM transactions WHERE exchange_id = ?',
      [id]
    );
    // --- END: FIX ---
    res.json(transactions);
  } catch (error) {
    console.error('Failed to get transactions for exchange:', error);
    res.status(500).json({ error: 'Failed to get transactions for exchange' });
  }
});

// --- START: FIX ---
export default router; // Changed to ES Module export
// --- END: FIX ---
