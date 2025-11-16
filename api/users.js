// api/users.js
import express from 'express';
// --- START: FIX ---
import { getDb } from '../services/database.js'; // Added the missing import
// --- END: FIX ---
const router = express.Router();

// GET /api/holders
router.get('/', async (req, res) => {
  try {
    // --- START: FIX ---
    const db = await getDb(); // Use getDb() instead of req.db
    const users = await db.all('SELECT * FROM account_holders');
    // --- END: FIX ---
    res.json(users);
  } catch (error) {
    console.error('Error fetching account holders:', error);
    res.status(500).json({ error: 'Failed to fetch account holders' });
  }
});

// POST /api/holders
router.post('/', async (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }
  const db = await getDb();
  try {
    // Check if user already exists
    const existingUser = await db.get(
      'SELECT * FROM account_holders WHERE holder_name = ?',
      [username]
    );
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }
    const result = await db.run(
      'INSERT INTO account_holders (holder_name) VALUES (?)',
      [username]
    );
    res
      .status(201)
      .json({ id: result.lastID, holder_name: username, is_default: 0 });
  } catch (error) {
    console.error('Error adding account holder:', error);
    res.status(500).json({ error: 'Failed to add account holder' });
  }
});

// DELETE /api/holders/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // --- START: FIX ---
    const db = await getDb(); // Use getDb() instead of req.db
    await db.run('DELETE FROM account_holders WHERE id = ?', [id]);
    // --- END: FIX ---
    res.status(200).json({ message: 'Holder deleted successfully' });
  } catch (error) {
    console.error('Error deleting account holder:', error);
    res.status(500).json({ error: 'Failed to delete account holder' });
  }
});

// POST /api/holders/set-default
router.post('/set-default', async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: 'Holder ID is required' });
  }
  try {
    // --- START: FIX ---
    const db = await getDb(); // Use getDb() instead of req.db
    await db.run('UPDATE account_holders SET is_default = 0');
    await db.run('UPDATE account_holders SET is_default = 1 WHERE id = ?', [
      id,
    ]);
    // --- END: FIX ---
    res.status(200).json({ message: 'Default holder updated successfully' });
  } catch (error) {
    console.error('Error setting default holder:', error);
    res.status(500).json({ error: 'Failed to set default holder' });
  }
});

export default router;
