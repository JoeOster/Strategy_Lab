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
 * GET /api/transactions/single/:transactionId
 * Retrieves a single transaction by its ID.
 */
router.get('/single/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;
    const db = await getDb();
    const transaction = await db.get(
      'SELECT * FROM transactions WHERE id = ?',
      transactionId
    );
    if (transaction) {
      res.json(transaction);
    } else {
      res.status(404).json({ error: 'Transaction not found' });
    }
  } catch (error) {
    console.error(
      `Failed to get transaction ${req.params.transactionId}:`,
      error
    );
    res.status(500).json({ error: 'Failed to retrieve transaction' });
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

/**
 * POST /api/transactions/:transactionId/sell
 * Marks an open transaction as sold and creates a new 'sell' transaction.
 */
router.post('/:transactionId/sell', async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { sellPrice, sellQuantity, sellDate } = req.body; // Assuming these are sent from the client

    const db = await getDb();

    // 1. Get the original 'buy' transaction
    const originalTransaction = await db.get(
      'SELECT * FROM transactions WHERE id = ? AND type = "buy"',
      transactionId
    );

    if (!originalTransaction) {
      return res
        .status(404)
        .json({ error: 'Original buy transaction not found.' });
    }

    // 2. Calculate profit/loss
    const profitLoss = (sellPrice - originalTransaction.price) * sellQuantity;

    // 3. Create a new 'sell' transaction
    const sellResult = await db.run(
      `INSERT INTO transactions (
        source_id, ticker, quantity, price, transaction_date, transaction_type,
        original_transaction_id, is_paper_trade, created_date, updated_date, user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      originalTransaction.source_id,
      originalTransaction.ticker,
      sellQuantity,
      sellPrice,
      sellDate || new Date().toISOString(),
      'sell', // transaction_type
      originalTransaction.id,
      originalTransaction.is_paper_trade === null ? 0 : originalTransaction.is_paper_trade, // Handle NULL for is_paper_trade
      new Date().toISOString(), // created_date
      new Date().toISOString(), // updated_date
      originalTransaction.user_id // user_id (can be NULL)
    );

    // 4. Update the original 'buy' transaction (e.g., mark as closed or adjust quantity if partial sell)
    // For simplicity, let's assume a full sell for now.
    // In a real app, you might update the original transaction's remaining quantity or status.
    // For now, we'll just return success.

    res.status(200).json({
      message: 'Trade sold successfully',
      sellTransactionId: sellResult.lastID,
      sourceId: originalTransaction.source_id, // Return sourceId for client-side refresh
    });
  } catch (error) {
    console.error(
      `Failed to sell transaction ${req.params.transactionId}:`,
      error
    );
    res.status(500).json({ error: 'Failed to sell trade' });
  }
});

export default router;
