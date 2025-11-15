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

router.get('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    const transaction = await db.get(
      'SELECT * FROM transactions WHERE id = ?',
      id
    );
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json(transaction);
  } catch (err) {
    console.error(`Failed to get transaction ${req.params.id}:`, err);
    const message = err instanceof Error ? err.message : String(err);
    res
      .status(500)
      .json({ error: 'Failed to get transaction', details: message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    const { ticker, quantity, price } = req.body;
    const result = await db.run(
      'UPDATE transactions SET ticker = ?, quantity = ?, price = ? WHERE id = ?',
      [ticker, quantity, price, id]
    );
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    const updatedTransaction = await db.get(
      'SELECT * FROM transactions WHERE id = ?',
      id
    );
    res.json(updatedTransaction);
  } catch (err) {
    console.error(`Failed to update transaction ${req.params.id}:`, err);
    const message = err instanceof Error ? err.message : String(err);
    res
      .status(500)
      .json({ error: 'Failed to update transaction', details: message });
  }
});

router.post('/:id/sell', async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    const originalTx = await db.get(
      'SELECT * FROM transactions WHERE id = ?',
      id
    );

    if (!originalTx) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const now = new Date().toISOString();
    const sellPrice = await getPriceV2(originalTx.ticker);
    if (!sellPrice) {
      return res
        .status(500)
        .json({ error: 'Could not fetch current price to sell trade' });
    }

    const result = await db.run(
      `INSERT INTO transactions 
         (is_paper_trade, user_id, source_id, watched_item_id, transaction_date, ticker, transaction_type, quantity, price, quantity_remaining, created_date, updated_date) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        originalTx.is_paper_trade,
        originalTx.user_id,
        originalTx.source_id,
        originalTx.watched_item_id,
        now,
        originalTx.ticker,
        'SELL',
        originalTx.quantity,
        sellPrice,
        0,
        now,
        now,
      ]
    );

    await db.run(
      'UPDATE transactions SET quantity_remaining = 0, updated_date = ? WHERE id = ?',
      [now, id]
    );

    res.status(201).json({
      message: 'Trade sold successfully',
      newTransactionId: result.lastID,
      originalTransactionId: id,
    });
  } catch (err) {
    console.error(`Failed to sell transaction ${req.params.id}:`, err);
    const message = err instanceof Error ? err.message : String(err);
    res
      .status(500)
      .json({ error: 'Failed to sell transaction', details: message });
  }
});

export default router;
