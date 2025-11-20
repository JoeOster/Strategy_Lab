import { Router } from "express";
import { getDb } from "../services/database.js";
import * as marketData from "../services/marketData.js";

const router = Router();

// GET /api/watched-items
router.get("/", async (req, res) => {
	try {
		const items = await marketData.getEnrichedWatchedItems();

		const enrichedItems = items.map((item) => {
			let type = "Manual";
			if (item.is_paper_trade) {
				type = "Paper";
			} else if (item.status === "EXECUTED") {
				type = "Real";
			} else if (item.status === "WATCHING") {
				type = item.source_id ? "Idea" : "Manual";
			}
			return { ...item, type };
		});

		res.json(enrichedItems);
	} catch (err) {
		console.error("Failed to get watched items:", err);
		const message = err instanceof Error ? err.message : String(err);
		res
			.status(500)
			.json({ error: "Failed to get watched items", details: message });
	}
});

// POST /api/watched-items/ideas
router.post("/ideas", async (req, res) => {
	try {
		const db = await getDb();
		const idea = req.body;
		const now = new Date().toISOString();
		const isPaperTrade = idea.is_paper_trade ? 1 : 0;
		const status = isPaperTrade ? "EXECUTED" : "WATCHING";

		const columns = [
			"is_paper_trade",
			"user_id",
			"source_id",
			"strategy_id",
			"ticker",
			"order_type",
			"buy_price_high",
			"buy_price_low",
			"take_profit_high",
			"take_profit_low",
			"escape_price",
			"status",
			"notes",
			"created_date",
			"updated_date",
		];
		const values = [
			isPaperTrade,
			idea.user_id || 1,
			idea.source_id || null,
			idea.strategy_id || null,
			idea.ticker ? idea.ticker.toUpperCase() : null,
			idea.order_type || null,
			idea.buy_price_high || null,
			idea.buy_price_low || null,
			idea.take_profit_high || null,
			idea.take_profit_low || null,
			idea.escape_price || null,
			status,
			idea.notes || null,
			now,
			now,
		].map((v) => (v === "" ? null : v));
		const placeholders = columns.map(() => "?").join(",");

		const result = await db.run(
			`INSERT INTO watched_items (${columns.join(
				",",
			)}) VALUES (${placeholders})`,
			values,
		);
		const newIdeaId = result.lastID;

		if (isPaperTrade) {
			const { quantity, price, limit_low, limit_high, exchange, time } = idea;
			await db.run(
				"INSERT INTO transactions (is_paper_trade, user_id, source_id, watched_item_id, transaction_date, ticker, transaction_type, quantity, price, quantity_remaining, created_date, updated_date, limit_low, limit_high, exchange, time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
				[
					1,
					idea.user_id,
					idea.source_id,
					newIdeaId,
					now,
					idea.ticker,
					"BUY",
					quantity,
					price,
					quantity,
					now,
					now,
					limit_low || null,
					limit_high || null,
					exchange || null,
					time || null,
				],
			);
		}
		const newIdea = await db.get(
			"SELECT * FROM watched_items WHERE id = ?",
			newIdeaId,
		);
		res.status(201).json(newIdea);
	} catch (err) {
		res
			.status(500)
			.json({ error: "Failed to add trade idea", details: err.message });
	}
});

// GET /api/watched-items/:id
router.get("/:id", async (req, res) => {
	try {
		const db = await getDb();
		const item = await db.get(
			"SELECT * FROM watched_items WHERE id = ?",
			req.params.id,
		);
		if (!item) return res.status(404).json({ error: "Watched item not found" });
		res.json(item);
	} catch (err) {
		res.status(500).json({ error: "Failed to get watched item" });
	}
});

// DELETE /api/watched-items/:id
router.delete("/:id", async (req, res) => {
	try {
		const db = await getDb();
		const result = await db.run(
			"DELETE FROM watched_items WHERE id = ?",
			req.params.id,
		);
		if (result.changes === 0)
			return res.status(404).json({ error: "Watched item not found" });
		res.status(204).send();
	} catch (err) {
		res.status(500).json({ error: "Failed to delete watched item" });
	}
});

// POST /api/watched-items/:id/to-paper
router.post("/:id/to-paper", async (req, res) => {
	try {
		const db = await getDb();
		const { id } = req.params;
		const { quantity, price, limit_low, limit_high, exchange, time } = req.body;
		if (!exchange)
			return res.status(400).json({ error: "Exchange is required." });
		const idea = await db.get("SELECT * FROM watched_items WHERE id = ?", id);
		if (!idea) return res.status(404).json({ error: "Trade Idea not found" });
		const now = new Date().toISOString();
		const result = await db.run(
			"INSERT INTO transactions (is_paper_trade, user_id, source_id, watched_item_id, transaction_date, ticker, transaction_type, quantity, price, quantity_remaining, created_date, updated_date, limit_low, limit_high, exchange, time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
			[
				1,
				idea.user_id,
				idea.source_id,
				id,
				now,
				idea.ticker,
				"BUY",
				Number(quantity) || 0,
				Number(price) || 0,
				Number(quantity) || 0,
				now,
				now,
				limit_low || null,
				limit_high || null,
				exchange || null,
				time || null,
			],
		);
		await db.run("UPDATE watched_items SET status = ? WHERE id = ?", [
			"EXECUTED",
			id,
		]);
		res.status(201).json({
			message: "Paper trade created",
			newTransactionId: result.lastID,
		});
	} catch (err) {
		res.status(500).json({ error: "Failed to move idea to paper" });
	}
});

// POST /api/watched-items/:id/to-real
router.post("/:id/to-real", async (req, res) => {
	try {
		const db = await getDb();
		const { id } = req.params;
		const { quantity, price, limit_low, limit_high, exchange, time } = req.body;
		if (!exchange)
			return res.status(400).json({ error: "Exchange is required." });
		const idea = await db.get("SELECT * FROM watched_items WHERE id = ?", id);
		if (!idea) return res.status(404).json({ error: "Trade Idea not found" });
		const now = new Date().toISOString();
		const result = await db.run(
			"INSERT INTO transactions (is_paper_trade, user_id, source_id, watched_item_id, transaction_date, ticker, transaction_type, quantity, price, quantity_remaining, created_date, updated_date, limit_low, limit_high, exchange, time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
			[
				0,
				idea.user_id,
				idea.source_id,
				id,
				now,
				idea.ticker,
				"BUY",
				Number(quantity) || 0,
				Number(price) || 0,
				Number(quantity) || 0,
				now,
				now,
				limit_low || null,
				limit_high || null,
				exchange || null,
				time || null,
			],
		);
		await db.run("UPDATE watched_items SET status = ? WHERE id = ?", [
			"EXECUTED",
			id,
		]);
		res
			.status(201)
			.json({ message: "Real trade created", newTransactionId: result.lastID });
	} catch (err) {
		res.status(500).json({ error: "Failed to move idea to real trade" });
	}
});

router.put("/:id", async (req, res) => {
	try {
		const db = await getDb();
		const idea = req.body;
		const result = await db.run(
			"UPDATE watched_items SET ticker=?, buy_price_low=?, buy_price_high=?, take_profit_low=?, take_profit_high=?, escape_price=?, notes=? WHERE id=?",
			[
				idea.ticker,
				idea.buy_price_low,
				idea.buy_price_high,
				idea.take_profit_low,
				idea.take_profit_high,
				idea.escape_price,
				idea.notes,
				req.params.id,
			],
		);
		if (result.changes === 0)
			return res.status(404).json({ error: "Watched item not found" });
		const updatedIdea = await db.get(
			"SELECT * FROM watched_items WHERE id = ?",
			req.params.id,
		);
		res.json(updatedIdea);
	} catch (err) {
		res.status(500).json({ error: "Failed to update watched item" });
	}
});

export default router;
