// api/watched-items.js
import { Router } from 'express';
import { getDb } from '../services/database.js';
import { getPriceV2 } from '../services/priceServiceV2.js';

/** @typedef {import('../public/js/types.js').WatchedItem} WatchedItem */

const router = Router();

// POST /api/watched-items/ideas
router.post('/ideas', async (req, res) => {
  try {
    const db = await getDb();
    /** @type {Partial<WatchedItem>} */
    const idea = req.body;
    const now = new Date().toISOString();

    const isPaperTrade = idea.is_paper_trade ? 1 : 0;
    const status = isPaperTrade ? 'EXECUTED' : 'WATCHING'; // If it's a paper trade, its status is EXECUTED

    const columns = [
      'is_paper_trade',
      'user_id',
      'source_id',
      'strategy_id',
      'ticker',
      'order_type',
      'buy_price_high',
      'buy_price_low',
      'take_profit_high',
      'take_profit_low',
      'escape_price',
      'status',
      'notes',
      'created_date',
      'updated_date',
    ];
    const values = [
      isPaperTrade,
      idea.user_id || 1,
      idea.source_id || null,
      idea.strategy_id || null,
      idea.ticker.toUpperCase(),
      idea.order_type || null,
      idea.buy_price_high || null,
      idea.buy_price_low || null,
      idea.take_profit_high || null,
      idea.take_profit_low || null,
      idea.escape_price || null,
      status, // Use the determined status
      idea.notes || null,
      now,
      now,
    ].map((v) => (v === '' ? null : v));
    const placeholders = columns.map(() => '?').join(',');
    const sql = `INSERT INTO watched_items (${columns.join(',')}) VALUES (${placeholders})`;
    const result = await db.run(sql, values);
    const newIdeaId = result.lastID;

    // If it's a paper trade, also create a transaction
    if (isPaperTrade) {
      // Assuming ideaData will contain quantity and price for a paper trade
      const { quantity, price, limit_low, limit_high, exchange, time } = idea;
      await db.run(
        `INSERT INTO transactions
           (is_paper_trade, user_id, source_id, watched_item_id, transaction_date, ticker, transaction_type, quantity, price, quantity_remaining, created_date, updated_date, limit_low, limit_high, exchange, time)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          1, // is_paper_trade
          idea.user_id,
          idea.source_id,
          newIdeaId, // Use the newly created watched_item_id
          now,
          idea.ticker,
          'BUY', // Assuming 'BUY' for initial paper trade creation
          quantity,
          price,
          quantity, // quantity_remaining
          now,
          now,
          limit_low || null,
          limit_high || null,
          exchange || null,
          time || null,
        ]
      );
    }

    const newIdea = await db.get(
      'SELECT * FROM watched_items WHERE id = ?',
      newIdeaId
    );
    res.status(201).json(newIdea);
  } catch (err) {
    console.error('Failed to add trade idea:', err);
    const message = err instanceof Error ? err.message : String(err);
    res
      .status(500)
      .json({ error: 'Failed to add trade idea', details: message });
  }
});

// GET /api/watched-items/ideas
router.get('/ideas', async (req, res) => {
  try {
    const db = await getDb();
    /** @type {WatchedItem[]} */
    const ideas = await db.all(
      'SELECT * FROM watched_items WHERE is_paper_trade = 0 AND status = ?',
      'WATCHING'
    );
    const tickers = [...new Set(ideas.map((idea) => idea.ticker))];
    const pricePromises = tickers.map((ticker) => getPriceV2(ticker));
    const prices = await Promise.all(pricePromises);
    /** @type {{[key: string]: number | null}} */
    const priceMap = {};
    tickers.forEach((ticker, index) => {
      priceMap[ticker] = prices[index];
    });
    const ideasWithPrices = ideas.map((idea) => ({
      ...idea,
      current_price: priceMap[idea.ticker] || null,
    }));
    res.json(ideasWithPrices);
  } catch (err) {
    console.error('Failed to get watched items (ideas):', err);
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Failed to get ideas', details: message });
  }
});

// GET /api/watched-items/:id
router.get('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    const item = await db.get('SELECT * FROM watched_items WHERE id = ?', id);
    if (!item) {
      return res.status(404).json({ error: 'Watched item not found' });
    }
    res.json(item);
  } catch (err) {
    console.error(`Failed to get watched item ${req.params.id}:`, err);
    const message = err instanceof Error ? err.message : String(err);
    res
      .status(500)
      .json({ error: 'Failed to get watched item', details: message });
  }
});

// DELETE /api/watched-items/:id
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    const result = await db.run('DELETE FROM watched_items WHERE id = ?', id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Watched item not found' });
    }
    res.status(204).send();
  } catch (err) {
    console.error(`Failed to delete watched item ${req.params.id}:`, err);
    const message = err instanceof Error ? err.message : String(err);
    res
      .status(500)
      .json({ error: 'Failed to delete watched item', details: message });
  }
});

// POST /api/watched-items/:id/to-paper
router.post('/:id/to-paper', async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params; // This is the ideaId
    const { quantity, price, limit_low, limit_high, exchange, time } =
      req.body;

    /** @type {WatchedItem | undefined} */
    const idea = await db.get('SELECT * FROM watched_items WHERE id = ?', id);
    if (!idea) {
      return res.status(404).json({ error: 'Trade Idea not found' });
    }

    const now = new Date().toISOString();
    const result = await db.run(
      `INSERT INTO transactions 
         (is_paper_trade, user_id, source_id, watched_item_id, transaction_date, ticker, transaction_type, quantity, price, quantity_remaining, created_date, updated_date, limit_low, limit_high, exchange, time) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        1, // is_paper_trade
        idea.user_id,
        idea.source_id,
        id,
        now,
        idea.ticker,
        'BUY',
        quantity,
        price,
        quantity, // quantity_remaining
        now,
        now,
        limit_low || null,
        limit_high || null,
        exchange || null,
        time || null,
      ]
    );

    await db.run('UPDATE watched_items SET status = ? WHERE id = ?', [
      'EXECUTED',
      id,
    ]);

    res.status(201).json({
      message: 'Paper trade created',
      newTransactionId: result.lastID,
      originalIdeaId: id,
    });
  } catch (err) {
    console.error(`Failed to move idea ${req.params.id} to paper:`, err);
    const message = err instanceof Error ? err.message : String(err);
    res
      .status(500)
      .json({ error: 'Failed to move idea to paper', details: message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    const idea = req.body;
    const result = await db.run(
      `UPDATE watched_items SET
        ticker = ?,
        buy_price_low = ?,
        buy_price_high = ?,
        take_profit_low = ?,
        take_profit_high = ?,
        escape_price = ?,
        notes = ?
      WHERE id = ?`,
      [
        idea.ticker,
        idea.buy_price_low,
        idea.buy_price_high,
        idea.take_profit_low,
        idea.take_profit_high,
        idea.escape_price,
        idea.notes,
        id,
      ]
    );
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Watched item not found' });
    }
    const updatedIdea = await db.get(
      'SELECT * FROM watched_items WHERE id = ?',
      id
    );
    res.json(updatedIdea);
  } catch (err) {
    console.error(`Failed to update watched item ${req.params.id}:`, err);
    const message = err instanceof Error ? err.message : String(err);
    res
      .status(500)
      .json({ error: 'Failed to update watched item', details: message });
  }
});

router.post('/:id/to-real', async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params; // This is the ideaId
    const { quantity, price, limit_low, limit_high, exchange, time } =
      req.body;

    /** @type {WatchedItem | undefined} */
    const idea = await db.get('SELECT * FROM watched_items WHERE id = ?', id);
    if (!idea) {
      return res.status(404).json({ error: 'Trade Idea not found' });
    }

    const now = new Date().toISOString();
    const result = await db.run(
      `INSERT INTO transactions 
         (is_paper_trade, user_id, source_id, watched_item_id, transaction_date, ticker, transaction_type, quantity, price, quantity_remaining, created_date, updated_date, limit_low, limit_high, exchange, time) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        0, // is_paper_trade
        idea.user_id,
        idea.source_id,
        id,
        now,
        idea.ticker,
        'BUY',
        quantity,
        price,
        quantity, // quantity_remaining
        now,
        now,
        limit_low || null,
        limit_high || null,
        exchange || null,
        time || null,
      ]
    );

    await db.run('UPDATE watched_items SET status = ? WHERE id = ?', [
      'EXECUTED',
      id,
    ]);

    res.status(201).json({
      message: 'Real trade created',
      newTransactionId: result.lastID,
      originalIdeaId: id,
    });
  } catch (err) {
    console.error(`Failed to move idea ${req.params.id} to real trade:`, err);
    const message = err instanceof Error ? err.message : String(err);
    res
      .status(500)
      .json({ error: 'Failed to move idea to real trade', details: message });
  }
});

export default router;
