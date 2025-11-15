// api/sources.js
import { Router } from 'express';
import { getDb } from '../services/database.js';

/** @typedef {import('../public/js/types.js').Source} Source */

const router = Router();

// GET /api/sources
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const sources = await db.all('SELECT * FROM advice_sources ORDER BY name');
    res.json(sources);
  } catch (err) {
    console.error('Failed to get sources:', err);
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Failed to get sources', details: message });
  }
});

// POST /api/sources
router.post('/', async (req, res) => {
  try {
    const db = await getDb();
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
      'book_websites',
      'book_pdfs',
      'website_websites',
      'website_pdfs',
    ];
    const values = columns.map((col) => {
      const value = req.body[col];
      return value !== undefined ? value : null;
    });
    const sql = `INSERT INTO advice_sources (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`;
    const result = await db.run(sql, values);
    const newSource = await db.get(
      'SELECT * FROM advice_sources WHERE id = ?',
      result.lastID
    );
    res.status(201).json(newSource);
  } catch (err) {
    console.error('Failed to add source:', err);
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Failed to add source', details: message });
  }
});

// GET /api/sources/:id
router.get('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    const source = await db.get(
      'SELECT * FROM advice_sources WHERE id = ?',
      id
    );
    if (!source) {
      return res.status(404).json({ error: 'Source not found' });
    }
    res.json(source);
  } catch (err) {
    console.error(`Failed to get source with ID ${req.params.id}:`, err);
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Failed to get source', details: message });
  }
});

// PUT /api/sources/:id
router.put('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
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
      'book_websites',
      'book_pdfs',
      'website_websites',
      'website_pdfs',
    ];
    const values = columns.map((col) => req.body[col]);
    values.push(id); // Add ID for the WHERE clause
    const setClauses = columns.map((col) => `${col} = ?`).join(', ');
    const sql = `UPDATE advice_sources SET ${setClauses} WHERE id = ?`;
    const result = await db.run(sql, values);
    if (result.changes === 0) {
      return res
        .status(404)
        .json({ error: 'Source not found or no changes made' });
    }
    const updatedSource = await db.get(
      'SELECT * FROM advice_sources WHERE id = ?',
      id
    );
    res.json(updatedSource);
  } catch (err) {
    console.error(`Failed to update source with ID ${req.params.id}:`, err);
    const message = err instanceof Error ? err.message : String(err);
    res
      .status(500)
      .json({ error: 'Failed to update source', details: message });
  }
});

// DELETE /api/sources/:id
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    const result = await db.run('DELETE FROM advice_sources WHERE id = ?', id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Source not found' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('Failed to delete source:', err);
    const message = err instanceof Error ? err.message : String(err);
    res
      .status(500)
      .json({ error: 'Failed to delete source', details: message });
  }
});

// GET /api/sources/:sourceId/strategies
router.get('/:sourceId/strategies', async (req, res) => {
  try {
    const db = await getDb();
    const { sourceId } = req.params;
    const strategies = await db.all(
      'SELECT * FROM strategies WHERE source_id = ? ORDER BY title',
      sourceId
    );
    res.json(strategies);
  } catch (err) {
    console.error(
      `Failed to get strategies for source ID ${req.params.sourceId}:`,
      err
    );
    const message = err instanceof Error ? err.message : String(err);
    res
      .status(500)
      .json({ error: 'Failed to get strategies', details: message });
  }
});

// GET /api/sources/:sourceId/ideas
router.get('/:sourceId/ideas', async (req, res) => {
  try {
    const db = await getDb();
    const { sourceId } = req.params;
    const ideas = await db.all(
      `SELECT * FROM watched_items 
       WHERE source_id = ? AND is_paper_trade = 0 AND status = ?`,
      [sourceId, 'WATCHING']
    );
    res.json(ideas);
  } catch (err) {
    console.error('Failed to get source ideas:', err);
    const message = err instanceof Error ? err.message : String(err);
    res
      .status(500)
      .json({ error: 'Failed to get source ideas', details: message });
  }
});

// GET /api/sources/:sourceId/open-trades
router.get('/:sourceId/open-trades', async (req, res) => {
  try {
    const db = await getDb();
    const { sourceId } = req.params;
    const trades = await db.all(
      `SELECT * FROM transactions 
       WHERE source_id = ? AND is_paper_trade = 0 
       ORDER BY transaction_date DESC`,
      [sourceId]
    );
    res.json(trades);
  } catch (err) {
    console.error('Failed to get source open trades:', err);
    const message = err instanceof Error ? err.message : String(err);
    res
      .status(500)
      .json({ error: 'Failed to get source open trades', details: message });
  }
});

// GET /api/sources/:sourceId/paper-trades
router.get('/:sourceId/paper-trades', async (req, res) => {
  try {
    const db = await getDb();
    const { sourceId } = req.params;
    const trades = await db.all(
      `SELECT * FROM transactions 
       WHERE source_id = ? AND is_paper_trade = 1 
       ORDER BY transaction_date DESC`,
      [sourceId]
    );
    res.json(trades);
  } catch (err) {
    console.error('Failed to get source paper trades:', err);
    const message = err instanceof Error ? err.message : String(err);
    res
      .status(500)
      .json({ error: 'Failed to get source paper trades', details: message });
  }
});

export default router;
