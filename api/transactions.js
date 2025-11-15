// api/transactions.js
import { Router } from 'express';
import { getDb } from '../services/database.js';

const router = Router();

// GET /api/transactions/paper-trades
router.get('/paper-trades', async (req, res) => {
  try {
    const db = await getDb();
    const paperTrades = await db.all(
      'SELECT * FROM transactions WHERE is_paper_trade = 1 ORDER BY transaction_date DESC'
    );
    res.json(paperTrades);
  } catch (err) {
    console.error('Failed to get paper trades:', err);
    const message = err instanceof Error ? err.message : String(err);
    res
      .status(500)
      .json({ error: 'Failed to get paper trades', details: message });
  }
});

// DELETE /api/transactions/:id
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    const result = await db.run('DELETE FROM transactions WHERE id = ?', id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.status(204).send();
  } catch (err) {
    console.error(`Failed to delete transaction ${req.params.id}:`, err);
    const message = err instanceof Error ? err.message : String(err);
    res
      .status(500)
      .json({ error: 'Failed to delete transaction', details: message });
  }
});

export default router;
