// api/sources.js
// --- START: FIX ---
import express from 'express';
import { getDb } from '../services/database.js'; // Added the missing import
import { getPriceV2 } from '../services/priceServiceV2.js';
const router = express.Router(); // Kept the correct router declaration
// --- END: FIX ---

// GET /api/sources (Get all sources)
router.get('/', async (req, res) => {
  try {
    // --- START: FIX ---
    const db = await getDb(); // Use getDb()
    const sources = await db.all('SELECT * FROM advice_sources');
    // --- END: FIX ---
    res.json(sources);
  } catch (error) {
    console.error('Failed to get sources:', error);
    res.status(500).json({ error: 'Failed to get sources' });
  }
});

// GET /api/sources/:id (Get a single source by ID)
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // --- START: FIX ---
    const db = await getDb(); // Use getDb()
    const source = await db.get('SELECT * FROM advice_sources WHERE id = ?', [
      id,
    ]);
    // --- END: FIX ---
    if (source) {
      res.json(source);
    } else {
      res.status(404).json({ error: 'Source not found' });
    }
  } catch (error) {
    console.error(`Failed to get source ${id}:`, error);
    res.status(500).json({ error: 'Failed to get source' });
  }
});

// POST /api/sources (Add a new source)
router.post('/', async (req, res) => {
  const sourceData = req.body;
  if (!sourceData.name || !sourceData.type) {
    return res.status(400).json({ error: 'Name and type are required' });
  }

  const columns = [
    'name',
    'type',
    'url',
    'description',
    'image_path',
    'person_email',
    'person_phone',
    'person_app_type',
    'person_app_handle',
    'group_primary_contact',
    'group_email',
    'group_phone',
    'group_app_type',
    'group_app_handle',
    'book_author',
    'book_isbn',
    'website_websites',
  ];

  const validKeys = Object.keys(sourceData).filter((key) =>
    columns.includes(key)
  );
  const placeholders = validKeys.map(() => '?').join(', ');
  const values = validKeys.map((key) => sourceData[key]);
  const sql = `INSERT INTO advice_sources (${validKeys.join(
    ', '
  )}) VALUES (${placeholders})`;

  try {
    // --- START: FIX ---
    const db = await getDb(); // Use getDb()
    const result = await db.run(sql, values);
    // --- END: FIX ---
    res.status(201).json({ id: result.lastID, ...sourceData });
  } catch (error) {
    console.error('Failed to add source:', error);
    res.status(500).json({ error: 'Failed to add source' });
  }
});

// PUT /api/sources/:id (Update an existing source)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const sourceData = req.body;

  const columns = [
    'name',
    'type',
    'url',
    'description',
    'image_path',
    'person_email',
    'person_phone',
    'person_app_type',
    'person_app_handle',
    'group_primary_contact',
    'group_email',
    'group_phone',
    'group_app_type',
    'group_app_handle',
    'book_author',
    'book_isbn',
    'website_websites',
  ];

  const validKeys = Object.keys(sourceData).filter((key) =>
    columns.includes(key)
  );
  const setClauses = validKeys.map((key) => `${key} = ?`).join(', ');
  const values = validKeys.map((key) => sourceData[key]);
  values.push(id);

  if (validKeys.length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  const sql = `UPDATE advice_sources SET ${setClauses} WHERE id = ?`;

  try {
    // --- START: FIX ---
    const db = await getDb(); // Use getDb()
    const result = await db.run(sql, values);
    // --- END: FIX ---
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Source not found' });
    }
    res.json({ id: id, ...sourceData });
  } catch (error) {
    console.error(`Failed to update source ${id}:`, error);
    res.status(500).json({ error: 'Failed to update source' });
  }
});

// DELETE /api/sources/:id (Delete a source)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // --- START: FIX ---
    const db = await getDb(); // Use getDb()
    const result = await db.run('DELETE FROM advice_sources WHERE id = ?', [
      id,
    ]);
    // --- END: FIX ---
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Source not found' });
    }
    res.status(200).json({ message: 'Source deleted successfully' });
  } catch (error) {
    console.error(`Failed to delete source ${id}:`, error);
    res.status(500).json({ error: 'Failed to delete source' });
  }
});

// --- Strategy Lab Specific ---

// GET /api/sources/:id/strategies
router.get('/:id/strategies', async (req, res) => {
  const { id } = req.params;
  try {
    // --- START: FIX ---
    const db = await getDb(); // Use getDb()
    const strategies = await db.all(
      "SELECT * FROM strategies WHERE source_id = ? AND status = 'active'",
      [id]
    );
    // --- END: FIX ---
    res.json(strategies);
  } catch (error) {
    console.error(`Failed to get strategies for source ${id}:`, error);
    res.status(500).json({ error: 'Failed to get strategies' });
  }
});

// GET /api/sources/:id/open-ideas
router.get('/:id/open-ideas', async (req, res) => {
  const { id } = req.params;
  try {
    // --- START: FIX ---
    const db = await getDb(); // Use getDb()
    const items = await db.all(
      'SELECT * FROM watched_items WHERE source_id = ?',
      [id]
    );
    // --- END: FIX ---
    res.json(items);
  } catch (error) {
    console.error(`Failed to get open ideas for source ${id}:`, error);
    res.status(500).json({ error: 'Failed to get open ideas' });
  }
});

// GET /api/sources/:id/open-trades
router.get('/:id/open-trades', async (req, res) => {
  const { id } = req.params;
  try {
    // --- START: FIX ---
    const db = await getDb(); // Use getDb()
    // This query ensures ONLY real trades are returned.
    const trades = await db.all(
      'SELECT * FROM transactions WHERE source_id = ? AND is_paper_trade = 0 AND quantity_remaining > 0',
      id
    );

    // --- START: MODIFICATION ---
    // Fetch current prices for all unique tickers
    const tickers = [
      ...new Set(
        trades.map((/** @type {{ ticker: any; }} */ trade) => trade.ticker)
      ),
    ];
    const pricePromises = tickers.map((ticker) => getPriceV2(ticker));
    const prices = await Promise.all(pricePromises);
    /** @type {Object<string, any>} */
    const priceMap = tickers.reduce((acc, ticker, index) => {
      acc[ticker] = prices[index];
      return acc;
    }, {});

    const tradesWithPrices = trades.map(
      (/** @type {{ ticker: string | number; }} */ trade) => ({
        ...trade,
        current_price: priceMap[trade.ticker] || null,
      })
    );
    // --- END: FIX ---
    res.json(tradesWithPrices);
  } catch (error) {
    console.error(`Failed to get open trades for source ${id}:`, error);
    res.status(500).json({ error: 'Failed to get open trades' });
  }
});

// GET /api/sources/:id/paper-trades
router.get('/:id/paper-trades', async (req, res) => {
  const { id } = req.params;
  try {
    const db = await getDb();
    // This is the corrected query. It ensures ONLY paper trades are returned.
    const trades = await db.all(
      'SELECT * FROM transactions WHERE source_id = ? AND is_paper_trade = 1',
      id
    );

    // Fetch current prices for any trades that are not fully closed
    const openPaperTickers = [
      ...new Set(
        trades
          .filter((/** @type {{ exit_date: any; }} */ t) => !t.exit_date)
          .map((/** @type {{ ticker: any; }} */ trade) => trade.ticker)
      ),
    ];
    const pricePromises = openPaperTickers.map((ticker) => getPriceV2(ticker));
    const prices = await Promise.all(pricePromises);
    /** @type {Object<string, any>} */
    const priceMap = openPaperTickers.reduce((acc, ticker, index) => {
      acc[ticker] = prices[index];
      return acc;
    }, {});

    const tradesWithPrices = trades.map(
      (/** @type {{ ticker: string | number; }} */ trade) => ({
        ...trade,
        current_price: priceMap[trade.ticker] || null,
      })
    );
    res.json(tradesWithPrices);
  } catch (error) {
    console.error(`Failed to get paper trades for source ${id}:`, error);
    res.status(500).json({ error: 'Failed to get paper trades' });
  }
});

// GET /api/sources/:id/closed-trades
router.get('/:id/closed-trades', async (req, res) => {
  const { id } = req.params;
  try {
    const db = await getDb();
    // This query fetches all trades (paper and real) that have been closed.
    const trades = await db.all(
      `SELECT
        t_sell.id,
        t_sell.ticker,
        t_sell.quantity,
        t_buy.transaction_date as entry_date,
        t_buy.price as entry_price,
        t_sell.transaction_date as exit_date,
        t_sell.price as exit_price,
        (t_sell.price - t_buy.price) * t_sell.quantity as pnl
       FROM transactions t_sell
       LEFT JOIN transactions t_buy ON t_sell.original_transaction_id = t_buy.id
       WHERE t_sell.source_id = ? AND t_sell.transaction_type = 'SELL'`,
      id
    );
    res.json(trades);
  } catch (error) {
    console.error(`Failed to get closed trades for source ${id}:`, error);
    res.status(500).json({ error: 'Failed to get closed trades' });
  }
});
// --- START: FIX ---
export default router; // Changed to ES Module export
// --- END: FIX ---
