import express from "express";
import { getDb } from "../services/database.js";

const router = express.Router();

/** @type {Object<string, any>} */
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

	try {
		// OPEN TRADES (REAL)
		statements.getOpenTrades = await db.prepare(
			`
    SELECT
        t_buy.*,
        SUM(CASE WHEN t_sell.transaction_type = 'sell' THEN ABS(t_sell.quantity) ELSE 0 END) AS sold_quantity
    FROM transactions t_buy
    LEFT JOIN transactions t_sell ON t_buy.id = t_sell.original_transaction_id
    WHERE t_buy.source_id = ?
      AND UPPER(t_buy.transaction_type) = 'BUY'
      AND t_buy.status = 'open'
      AND t_buy.is_paper_trade = 0 -- Filter for Real Open Trades
    GROUP BY t_buy.id
    HAVING (t_buy.quantity - SUM(CASE WHEN t_sell.transaction_type = 'sell' THEN ABS(t_sell.quantity) ELSE 0 END)) > 0
    ORDER BY t_buy.transaction_date DESC;
    `,
		);

		// OPEN PAPER TRADES
		statements.getPaperTrades = await db.prepare(
			`
    SELECT
        t_buy.*,
        SUM(CASE WHEN t_sell.transaction_type = 'sell' THEN ABS(t_sell.quantity) ELSE 0 END) AS sold_quantity
    FROM transactions t_buy
    LEFT JOIN transactions t_sell ON t_buy.id = t_sell.original_transaction_id
    WHERE t_buy.is_paper_trade = 1
      AND UPPER(t_buy.transaction_type) = 'BUY'
      AND t_buy.status = 'open'
    GROUP BY t_buy.id
    HAVING (t_buy.quantity - SUM(CASE WHEN t_sell.transaction_type = 'sell' THEN ABS(t_sell.quantity) ELSE 0 END)) > 0
    ORDER BY t_buy.transaction_date DESC;
    `,
		);

		// ALL PAPER TRADES (for the new sub-tab)
		statements.getAllPaperTrades = await db.prepare(
			`
    SELECT *
    FROM transactions
    WHERE is_paper_trade = 1
    ORDER BY transaction_date DESC;
    `,
		);

		// CLOSED PAPER TRADES: Uses robust subquery to check for full closure regardless of 'status' field.
		statements.getClosedPaperTrades = await db.prepare(
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
        ABS(t_sell.quantity) AS sell_quantity, -- Ensure positive quantity for display
        t_sell.price AS sell_price,
        (t_sell.price - t_buy.price) * ABS(t_sell.quantity) AS profit_loss
    FROM transactions t_sell
    JOIN transactions t_buy ON t_sell.original_transaction_id = t_buy.id
    WHERE t_sell.transaction_type = 'sell'
      AND t_sell.is_paper_trade = 1 -- Filter for Paper Closed Trades
      -- ROBUST CHECK: Is the original position fully sold?
      AND t_buy.quantity <= (
        SELECT SUM(ABS(quantity))
        FROM transactions t_sub
        WHERE t_sub.original_transaction_id = t_buy.id AND t_sub.transaction_type = 'sell'
      )
    ORDER BY t_sell.transaction_date DESC;
    `,
		);
	} catch (error) {
		console.error("Error preparing database statements:", error);
		// Re-throw the error to be caught by the route handler's try-catch
		throw error;
	}
};

/**
 * GET /api/transactions/open-trades/:sourceId
 * Retrieves all open trades for a given source ID (Real Money).
 */
router.get("/open-trades/:sourceId", async (req, res) => {
	try {
		await initializeStatements();
		const { sourceId } = req.params;
		const positions = await statements.getOpenTrades.all(sourceId);
		res.json(positions);
	} catch (error) {
		console.error(
			`Failed to get open trades for source ${req.params.sourceId}:`,
			error,
		);
		res.status(500).json({ error: "Failed to retrieve open trades" });
	}
});

/**
 * GET /api/transactions/paper-trades
 * Retrieves all transactions that are marked as paper trades (OPEN ONLY).
 */
router.get("/paper-trades", async (req, res) => {
	try {
		await initializeStatements();
		const paperTrades = await statements.getPaperTrades.all();
		res.json(paperTrades);
	} catch (error) {
		console.error("Failed to get paper trades:", error);
		res.status(500).json({ error: "Failed to retrieve paper trades" });
	}
});

/**
 * GET /api/transactions/closed-paper-trades
 * Retrieves all transactions that are marked as paper trades (CLOSED ONLY).
 */
router.get("/closed-paper-trades", async (req, res) => {
	try {
		await initializeStatements();
		const closedPaperTrades = await statements.getClosedPaperTrades.all();
		res.json(closedPaperTrades);
	} catch (error) {
		console.error("Failed to get closed paper trades:", error);
		res.status(500).json({ error: "Failed to retrieve closed paper trades" });
	}
});

/**
 * GET /api/transactions/paper-trades/all
 * Retrieves all paper trades (both open and closed).
 */
router.get("/paper-trades/all", async (req, res) => {
	try {
		await initializeStatements();
		const allPaperTrades = await statements.getAllPaperTrades.all();
		res.json(allPaperTrades);
	} catch (error) {
		console.error("Failed to get all paper trades:", error);
		res.status(500).json({ error: "Failed to retrieve all paper trades" });
	}
});

/**
 * GET /api/transactions/single/:transactionId
 * Retrieves a single transaction by its ID.
 */
router.get("/single/:transactionId", async (req, res) => {
	try {
		const { transactionId } = req.params;
		const db = await getDb();
		const transaction = await db.get(
			"SELECT * FROM transactions WHERE id = ?",
			transactionId,
		);
		if (transaction) {
			res.json(transaction);
		} else {
			res.status(404).json({ error: "Transaction not found" });
		}
	} catch (error) {
		console.error(
			`Failed to get transaction ${req.params.transactionId}:`,
			error,
		);
		res.status(500).json({ error: "Failed to retrieve transaction" });
	}
});

/**
 * GET /api/transactions/:sourceId
 * Retrieves all transactions for a given source ID.
 */
router.get("/:sourceId", async (req, res) => {
	try {
		const { sourceId } = req.params;
		const db = await getDb();
		const transactions = await db.all(
			"SELECT * FROM transactions WHERE source_id = ? ORDER BY transaction_date DESC",
			sourceId,
		);
		res.json(transactions);
	} catch (error) {
		console.error(
			`Failed to get transactions for source ${req.params.sourceId}:`,
			error,
		);
		res.status(500).json({ error: "Failed to retrieve transactions" });
	}
});

/**
 * POST /api/transactions/sell
 * Marks an open transaction as sold and creates a new 'sell' transaction.
 */
router.post("/sell", async (req, res) => {
	console.log("Received POST request to /api/transactions/sell");
	const db = await getDb();
	await db.run("BEGIN TRANSACTION"); // Start transaction
	let transactionId; // Declare transactionId here
	try {
		const { id, quantity, price } = req.body; // id is the transactionId
		transactionId = id; // Assign value here

		if (!transactionId || !quantity || !price) {
			await db.run("ROLLBACK"); // Rollback on validation error
			return res
				.status(400)
				.json({ error: "Transaction ID, quantity, and price are required." });
		}

		// 1. Get the original 'buy' transaction
		const originalTransaction = await db.get(
			'SELECT * FROM transactions WHERE id = ? AND UPPER(transaction_type) = "BUY"',
			transactionId,
		);

		if (!originalTransaction) {
			await db.run("ROLLBACK"); // Rollback if original transaction not found
			return res
				.status(404)
				.json({ error: "Original buy transaction not found." });
		}

		// Calculate remaining quantity after this sell
		const currentSoldQuantity =
			(
				await db.get(
					'SELECT SUM(ABS(quantity)) as sold_qty FROM transactions WHERE original_transaction_id = ? AND transaction_type = "sell"',
					transactionId,
				)
			)?.sold_qty || 0;

		const availableQuantity =
			originalTransaction.quantity - currentSoldQuantity;

		if (quantity > availableQuantity) {
			await db.run("ROLLBACK"); // Rollback on over-selling attempt
			return res
				.status(400)
				.json({ error: "Selling more than available quantity." });
		}

		// 2. Create a new 'sell' transaction
		const sellResult = await db.run(
			`INSERT INTO transactions (
        source_id, ticker, quantity, price, transaction_date, transaction_type,
        original_transaction_id, is_paper_trade, created_date, updated_date, user_id, exchange
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			originalTransaction.source_id,
			originalTransaction.ticker,
			-quantity, // FIX: Store as NEGATIVE quantity for a sell transaction
			price, // Use the price from the request body
			new Date().toISOString(), // Use current date for sell transaction
			"sell", // transaction_type
			originalTransaction.id,
			originalTransaction.is_paper_trade === null
				? 0
				: originalTransaction.is_paper_trade,
			new Date().toISOString(), // created_date
			new Date().toISOString(), // updated_date
			originalTransaction.user_id,
			originalTransaction.exchange, // Inherit exchange from original transaction
		);

		// 3. Update the original buy transaction if fully sold
		const newTotalSoldQuantity = currentSoldQuantity + quantity;
		if (newTotalSoldQuantity === originalTransaction.quantity) {
			await db.run(
				'UPDATE transactions SET status = "closed", updated_date = ? WHERE id = ?',
				new Date().toISOString(),
				originalTransaction.id,
			);
		} else {
			// For now, we'll just ensure the status is 'open' if not fully closed.
			await db.run(
				'UPDATE transactions SET status = "open", updated_date = ? WHERE id = ?',
				new Date().toISOString(),
				originalTransaction.id,
			);
		}

		await db.run("COMMIT"); // Commit transaction
		res.status(200).json({
			message: "Trade sold successfully",
			sellTransactionId: sellResult.lastID,
			sourceId: originalTransaction.source_id, // Return sourceId for client-side refresh
		});
	} catch (error) {
		await db.run("ROLLBACK"); // Rollback on any error
		const logId = transactionId || req.body.id || "unknown"; // Safely get transaction ID for logging
		console.error(`Failed to sell transaction ${logId}:`, error);
		res.status(500).json({ error: "Failed to sell trade" });
	}
});

/**
 * DELETE /api/transactions/paper-trades/:tradeId
 * Deletes a paper trade (both buy and associated sell transactions).
 */
router.delete("/paper-trades/:tradeId", async (req, res) => {
	const { tradeId } = req.params;
	const db = await getDb();
	await db.run("BEGIN TRANSACTION");
	try {
		// Delete the initial BUY transaction
		await db.run(
			"DELETE FROM transactions WHERE id = ? AND is_paper_trade = 1",
			tradeId,
		);
		// Delete any associated SELL transactions
		await db.run(
			"DELETE FROM transactions WHERE original_transaction_id = ? AND is_paper_trade = 1",
			tradeId,
		);

		await db.run("COMMIT");
		res.status(200).json({
			message: "Paper trade and associated transactions deleted successfully.",
		});
	} catch (error) {
		await db.run("ROLLBACK");
		console.error(`Failed to delete paper trade ${tradeId}:`, error);
		res.status(500).json({ error: "Failed to delete paper trade." });
	}
});

/**
 * GET /api/transactions/sold-quantity/:transactionId
 * Retrieves the sum of sold quantities for a given original transaction ID.
 */
router.get("/sold-quantity/:transactionId", async (req, res) => {
	try {
		const { transactionId } = req.params;
		const db = await getDb();
		// Use ABS(quantity) for robustness, handling both positive and negative stored sell quantities
		const result = await db.get(
			'SELECT SUM(ABS(quantity)) as sold_qty FROM transactions WHERE original_transaction_id = ? AND transaction_type = "sell"',
			transactionId,
		);
		res.json({ sold_quantity: result?.sold_qty || 0 });
	} catch (error) {
		console.error(
			`Failed to get sold quantity for transaction ${req.params.transactionId}:`,
			error,
		);
		res.status(500).json({ error: "Failed to retrieve sold quantity" });
	}
});

/**
 * POST /api/transactions
 * Creates a new transaction.
 */
router.post("/", async (req, res) => {
	const db = await getDb();
	await db.run("BEGIN TRANSACTION");
	try {
		const { ticker, quantity, price, source_id, is_paper_trade } = req.body;

		if (!ticker || !quantity || !price) {
			await db.run("ROLLBACK");
			return res
				.status(400)
				.json({ error: "Ticker, quantity, and price are required." });
		}

		const now = new Date().toISOString();
		const result = await db.run(
			`INSERT INTO transactions (
                source_id, ticker, quantity, price, transaction_date, transaction_type,
                is_paper_trade, created_date, updated_date, user_id, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			source_id || "manual",
			ticker,
			quantity,
			price,
			now,
			"BUY",
			is_paper_trade ? 1 : 0,
			now,
			now,
			1, // Assuming user_id 1 for now
			"open",
		);

		await db.run("COMMIT");
		res.status(201).json({
			message: "Trade created successfully",
			transactionId: result.lastID,
		});
	} catch (error) {
		await db.run("ROLLBACK");
		console.error("Failed to create transaction:", error);
		res.status(500).json({ error: "Failed to create transaction" });
	}
});

export default router;
