// api/strategies.js
import { Router } from 'express';
import { getDb } from '../services/database.js';

/** @typedef {import('../public/js/types.js').Strategy} Strategy */

const router = Router();

// POST /api/strategies
router.post('/', async (req, res) => {
  try {
    const db = await getDb();
    /** @type {Partial<Strategy>} */
    const {
      source_id,
      title,
      ticker,
      chapter,
      page_number,
      description,
      pdf_path,
    } = req.body;

    if (!source_id || !title) {
      return res
        .status(400)
        .json({ error: 'Source ID and title are required for a strategy.' });
    }

    const now = new Date().toISOString();
    const columns = [
      'source_id',
      'title',
      'ticker',
      'chapter',
      'page_number',
      'description',
      'pdf_path',
      'created_date',
      'updated_date',
      'status',
    ];
    const values = [
      source_id,
      title,
      ticker || null,
      chapter || null,
      page_number || null,
      description || null,
      pdf_path || null,
      now, // created_date
      now, // updated_date
      'active',
    ];

    const placeholders = columns.map(() => '?').join(',');
    const result = await db.run(
      `INSERT INTO strategies (${columns.join(',')}) VALUES (${placeholders})`,
      values
    );

    const newStrategy = await db.get(
      'SELECT * FROM strategies WHERE id = ?',
      result.lastID
    );
    res.status(201).json(newStrategy);
  } catch (err) {
    console.error('Failed to add strategy:', err);
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Failed to add strategy', details: message });
  }
});

// GET /api/strategies/:id
router.get('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    const strategy = await db.get('SELECT * FROM strategies WHERE id = ?', id);
    if (!strategy) {
      return res.status(404).json({ error: 'Strategy not found' });
    }
    res.json(strategy);
  } catch (err) {
    console.error(`Failed to get strategy ${req.params.id}:`, err);
    const message = err instanceof Error ? err.message : String(err);
    res
      .status(500)
      .json({ error: 'Failed to get strategy', details: message });
  }
});

// PUT /api/strategies/:id
router.put('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    /** @type {Partial<Strategy>} */
    const { title, ticker, chapter, page_number, description, pdf_path } =
      req.body;

    const now = new Date().toISOString();
    const result = await db.run(
      `UPDATE strategies SET
        title = ?,
        ticker = ?,
        chapter = ?,
        page_number = ?,
        description = ?,
        pdf_path = ?,
        updated_date = ?
      WHERE id = ?`,
      [title, ticker, chapter, page_number, description, pdf_path, now, id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Strategy not found' });
    }

    const updatedStrategy = await db.get(
      'SELECT * FROM strategies WHERE id = ?',
      id
    );
    res.json(updatedStrategy);
  } catch (err) {
    console.error(`Failed to update strategy ${req.params.id}:`, err);
    const message = err instanceof Error ? err.message : String(err);
    res
      .status(500)
      .json({ error: 'Failed to update strategy', details: message });
  }
});

// DELETE /api/strategies/:id
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    const result = await db.run(
      `UPDATE strategies SET status = 'inactive' WHERE id = ?`,
      id
    );
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Strategy not found' });
    }
    res.status(200).json({ message: 'Strategy marked as inactive' });
  } catch (err) {
    console.error(`Failed to delete strategy ${req.params.id}:`, err);
    const message = err instanceof Error ? err.message : String(err);
    res
      .status(500)
      .json({ error: 'Failed to delete strategy', details: message });
  }
});

export default router;