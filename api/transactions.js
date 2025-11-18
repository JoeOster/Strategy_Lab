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

  // FIX: Changed 't_sell.type' to 't_sell.transaction_type' to match DB schema
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
    WHERE t_sell.transaction_type = 'sell'
      AND t_sell.source_id = ?
    ORDER BY t_sell.transaction_date DESC;
    `
  );

  statements.getOpenTrades = await db.prepare(
    `
    SELECT *
    FROM transactions
    WHERE source_id = ?
      AND UPPER(transaction_type) = 'BUY'
      AND status = 'open'
    ORDER BY transaction_date DESC;
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
 * GET /api/transactions/open-trades/:sourceId
 * Retrieves all open trades for a given source ID.
 */
router.get('/open-trades/:sourceId', async (req, res) => {
  try {
    await initializeStatements();
    const { sourceId } = req.params;
    const positions = await statements.getOpenTrades.all(sourceId);
    res.json(positions);
  } catch (error) {
    console.error(
      `Failed to get open trades for source ${req.params.sourceId}:`,
      error
    );
    res.status(500).json({ error: 'Failed to retrieve open trades' });
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
 * POST /api/transactions/sell
 * Marks an open transaction as sold and creates a new 'sell' transaction.
 */
router.post('/sell', async (req, res) => {
  console.log('Received POST request to /api/transactions/sell');
  try {
    const { id, quantity, price } = req.body; // id is the transactionId
    const transactionId = id;

    if (!transactionId || !quantity || !price) {
      return res
        .status(400)
        .json({ error: 'Transaction ID, quantity, and price are required.' });
    }

    const db = await getDb();

    // 1. Get the original 'buy' transaction
    const originalTransaction = await db.get(
      'SELECT * FROM transactions WHERE id = ? AND UPPER(transaction_type) = "BUY"',
      transactionId
    );

    if (!originalTransaction) {
      return res
        .status(404)
        .json({ error: 'Original buy transaction not found.' });
    }

    // Calculate remaining quantity after this sell
    const currentSoldQuantity =
      (
        await db.get(
          'SELECT SUM(quantity) as sold_qty FROM transactions WHERE original_transaction_id = ? AND transaction_type = "sell"',
          transactionId
        )
      )?.sold_qty || 0;

    const availableQuantity =
      originalTransaction.quantity - currentSoldQuantity;

    if (quantity > availableQuantity) {
      return res
        .status(400)
        .json({ error: 'Selling more than available quantity.' });
    }

    // 2. Create a new 'sell' transaction
    const sellResult = await db.run(
      `INSERT INTO transactions (
        source_id, ticker, quantity, price, transaction_date, transaction_type,
        original_transaction_id, is_paper_trade, created_date, updated_date, user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      originalTransaction.source_id,
      originalTransaction.ticker,
      quantity, // Use the quantity from the request body
      price, // Use the price from the request body
      new Date().toISOString(), // Use current date for sell transaction
      'sell', // transaction_type
      originalTransaction.id,
      originalTransaction.is_paper_trade === null
        ? 0
        : originalTransaction.is_paper_trade,
      new Date().toISOString(), // created_date
      new Date().toISOString(), // updated_date
      originalTransaction.user_id
    );

    // 3. Update the original buy transaction if fully sold
    const newTotalSoldQuantity = currentSoldQuantity + quantity;
    if (newTotalSoldQuantity === originalTransaction.quantity) {
      await db.run(
        'UPDATE transactions SET status = "closed", updated_date = ? WHERE id = ?',
        new Date().toISOString(),
        originalTransaction.id
      );
    } else {
      // Optionally, you might want to update a 'quantity_remaining' field here
      // or rely on the sum of sell transactions to determine remaining quantity.
      // For now, we'll just ensure the status is 'open' if not fully closed.
      await db.run(
        'UPDATE transactions SET status = "open", updated_date = ? WHERE id = ?',
        new Date().toISOString(),
        originalTransaction.id
      );
    }

    res.status(200).json({
      message: 'Trade sold successfully',
      sellTransactionId: sellResult.lastID,
      sourceId: originalTransaction.source_id, // Return sourceId for client-side refresh
    });
  } catch (error) {
    console.error(`Failed to sell transaction ${transactionId}:`, error);
    res.status(500).json({ error: 'Failed to sell trade' });
  }
});

export default router;
