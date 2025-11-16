// api/webapps.js
// --- START: FIX ---
import express from 'express';
import { getDb } from '../services/database.js'; // Added the missing import
const router = express.Router();
// --- END: FIX ---

// GET /api/webapps
router.get('/', async (req, res) => {
  try {
    // --- START: FIX ---
    const db = await getDb(); // Use getDb()
    const webapps = await db.all('SELECT * FROM web_apps');
    // --- END: FIX ---
    res.json(webapps);
  } catch (error) {
    console.error('Failed to get web apps:', error);
    res.status(500).json({ error: 'Failed to get web apps' });
  }
});

// POST /api/webapps
router.post('/', async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Web app name is required' });
  }
  try {
    // --- START: FIX ---
    const db = await getDb(); // Use getDb()
    const result = await db.run('INSERT INTO web_apps (name) VALUES (?)', [
      name,
    ]);
    // --- END: FIX ---
    res.status(201).json({ id: result.lastID, name });
  } catch (error) {
    console.error('Failed to add web app:', error);
    res.status(500).json({ error: 'Failed to add web app' });
  }
});

// DELETE /api/webapps/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // --- START: FIX ---
    const db = await getDb(); // Use getDb()
    await db.run('DELETE FROM web_apps WHERE id = ?', [id]);
    // --- END: FIX ---
    res.status(200).json({ message: 'Web app deleted successfully' });
  } catch (error) {
    console.error('Failed to delete web app:', error);
    res.status(500).json({ error: 'Failed to delete web app' });
  }
});

// --- START: FIX ---
export default router; // Changed to ES Module export
// --- END: FIX ---
