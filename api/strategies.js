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
    const { source_id, title, chapter, page_number, description, pdf_path } =
      req.body;

    if (!source_id || !title) {
      return res
        .status(400)
        .json({ error: 'Source ID and title are required for a strategy.' });
    }

    const now = new Date().toISOString();
    const columns = [
      'source_id',
      'title',
      'chapter',
      'page_number',
      'description',
      'pdf_path',
      'created_date',
      'updated_date',
    ];
    const values = [
      source_id,
      title,
      chapter || null,
      page_number || null,
      description || null,
      pdf_path || null,
      now, // created_date
      now, // updated_date
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

export default router;
