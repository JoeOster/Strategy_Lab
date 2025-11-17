import express from 'express';
import { getDb } from '../services/database.js';

const router = express.Router();

const statements = {};

/**
 * @async
 * @description Initializes prepared statements for transaction operations.
 * This function is designed to be called on-demand to ensure the database is ready.
 * @returns {Promise<void>}
 */
const initializeStatements = async () => {
  // If statements are already prepared, do nothing.
  if (Object.keys(statements).length > 0) {
    return;
  }

  const db = await getDb();
  statements.getClosedTrades = await db.prepare(
    `
    SELECT
        t_buy.id AS buy_id,
        t_buy.source_id,
        t_buy.transaction_date AS buy_date,
        t_buy.ticker AS symbol,
        t_buy.quantity AS buy_quantity,
        t_buy.price AS buy_price,
        t_sell.id AS sell_id,
        t_sell.transaction_date AS sell_date,
        t_sell.quantity AS sell_quantity,
        t_sell.price AS sell_price,
        (t_sell.price - t_buy.price) * t_sell.quantity AS profit_loss
    FROM transactions t_sell
    JOIN transactions t_buy ON t_sell.original_transaction_id = t_buy.id
    WHERE t_sell.type = 'sell'
      AND t_sell.source_id = ?
    ORDER BY t_sell.transaction_date DESC;
    `
  );
  statements.getOpenPositions = await db.prepare(
    `
    SELECT
        ticker as symbol,
        SUM(CASE WHEN type = 'buy' THEN quantity ELSE -quantity END) as open_quantity,
        SUM(CASE WHEN type = 'buy' THEN quantity * price ELSE 0 END) / SUM(CASE WHEN type = 'buy' THEN quantity ELSE 0 END) as avg_buy_price
    FROM transactions
    WHERE source_id = ?
    GROUP BY ticker
    HAVING SUM(CASE WHEN type = 'buy' THEN quantity ELSE -quantity END) > 0;
    `
  );
  statements.getPaperTrades = await db.prepare(
    `
    SELECT *
    FROM transactions
    WHERE is_paper_trade = 1
    ORDER BY transaction_date DESC;
    `
  );
};

/**
 * GET /api/transactions/closed-trades/:sourceId
 * Retrieves all closed trades for a given source ID.
 */
router.get('/closed-trades/:sourceId', async (req, res) => {
  try {
    // Ensure statements are initialized before use.
    await initializeStatements();
    const { sourceId } = req.params;
    const trades = await statements.getClosedTrades.all(sourceId);
    res.json(trades);
  } catch (error) {
    console.error(
      `Failed to get closed trades for source ${req.params.sourceId}:`,
      error
    );
    res.status(500).json({ error: 'Failed to retrieve closed trades' });
  }
});

/**
 * GET /api/transactions/open-positions/:sourceId
 * Retrieves all open positions for a given source ID.
 */
router.get('/open-positions/:sourceId', async (req, res) => {
  try {
    await initializeStatements();
    const { sourceId } = req.params;
    const positions = await statements.getOpenPositions.all(sourceId);
    res.json(positions);
  } catch (error) {
    console.error(
      `Failed to get open positions for source ${req.params.sourceId}:`,
      error
    );
    res.status(500).json({ error: 'Failed to retrieve open positions' });
  }
});

/**
 * GET /api/transactions/paper-trades
 * Retrieves all transactions that are marked as paper trades.
 */
router.get('/paper-trades', async (req, res) => {
  try {
    await initializeStatements();
    const paperTrades = await statements.getPaperTrades.all();
    res.json(paperTrades);
  } catch (error) {
    console.error('Failed to get paper trades:', error);
    res.status(500).json({ error: 'Failed to retrieve paper trades' });
  }
});

/**
 * GET /api/transactions/:sourceId
 * Retrieves all transactions for a given source ID.
 */
router.get('/:sourceId', async (req, res) => {
  try {
    const { sourceId } = req.params;
    const db = await getDb();
    const transactions = await db.all(
      'SELECT * FROM transactions WHERE source_id = ? ORDER BY transaction_date DESC',
      sourceId
    );
    res.json(transactions);
  } catch (error) {
    console.error(
      `Failed to get transactions for source ${req.params.sourceId}:`,
      error
    );
    res.status(500).json({ error: 'Failed to retrieve transactions' });
  }
});

export default router;
