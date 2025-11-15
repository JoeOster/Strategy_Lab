// api/exchanges.js
import { Router } from 'express';
import { getDb } from '../services/database.js';

const router = Router();

// GET /api/exchanges
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const exchanges = await db.all('SELECT * FROM exchanges ORDER BY name');
    res.json(exchanges);
  } catch (err) {
    console.error('Failed to get exchanges:', err);
    const message = err instanceof Error ? err.message : String(err);
    res
      .status(500)
      .json({ error: 'Failed to get exchanges', details: message });
  }
});

// POST /api/exchanges
router.post('/', async (req, res) => {
  try {
    const db = await getDb();
    const { name } = req.body;
    if (!name) {
      return res.status(400).send('Exchange name is required');
    }
    const result = await db.run(
      'INSERT INTO exchanges (name) VALUES (?)',
      name
    );
    const newExchange = await db.get(
      'SELECT * FROM exchanges WHERE id = ?',
      result.lastID
    );
    res.status(201).json(newExchange);
  } catch (err) {
    console.error('Failed to add exchange:', err);
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Failed to add exchange', details: message });
  }
});

// DELETE /api/exchanges/:id
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    const result = await db.run('DELETE FROM exchanges WHERE id = ?', id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Exchange not found' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('Failed to delete exchange:', err);
    const message = err instanceof Error ? err.message : String(err);
    res
      .status(500)
      .json({ error: 'Failed to delete exchange', details: message });
  }
});

export default router;
