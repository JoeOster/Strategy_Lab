// api/webapps.js
import { Router } from 'express';
import { getDb } from '../services/database.js';

const router = Router();

// GET /api/webapps
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const webApps = await db.all('SELECT * FROM web_apps ORDER BY name');
    res.json(webApps);
  } catch (err) {
    console.error('Failed to get web apps:', err);
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Failed to get web apps', details: message });
  }
});

// POST /api/webapps
router.post('/', async (req, res) => {
  try {
    const db = await getDb();
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Web app name is required' });
    }
    const result = await db.run('INSERT INTO web_apps (name) VALUES (?)', name);
    const newWebApp = await db.get(
      'SELECT * FROM web_apps WHERE id = ?',
      result.lastID
    );
    res.status(201).json(newWebApp);
  } catch (err) {
    console.error('Failed to add web app:', err);
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Failed to add web app', details: message });
  }
});

// DELETE /api/webapps/:id
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    const result = await db.run('DELETE FROM web_apps WHERE id = ?', id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Web app not found' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('Failed to delete web app:', err);
    const message = err instanceof Error ? err.message : String(err);
    res
      .status(500)
      .json({ error: 'Failed to delete web app', details: message });
  }
});

export default router;
