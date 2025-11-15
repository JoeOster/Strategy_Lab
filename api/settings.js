// api/settings.js
import { Router } from 'express';
import { getDb } from '../services/database.js';

const router = Router();

// GET /api/settings
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    /** @type {{key: string, value: string}[]} */
    const settings = await db.all('SELECT * FROM app_settings');
    const settingsObj = settings.reduce(
      (
        /** @type {{[key: string]: string}} */ acc,
        /** @type {{ key: string, value: string }} */ setting
      ) => {
        acc[setting.key] = setting.value;
        return acc;
      },
      {}
    );

    // Provide default values for settings if they are not present
    settingsObj['family-name'] = settingsObj['family-name'] || '';
    settingsObj['take-profit-percent'] =
      settingsObj['take-profit-percent'] || '0.00'; // Default to 0.00
    settingsObj['stop-loss-percent'] =
      settingsObj['stop-loss-percent'] || '0.00'; // Default to 0.00
    settingsObj['notification-cooldown'] =
      settingsObj['notification-cooldown'] || '5'; // Default to 5 minutes
    settingsObj.theme = settingsObj.theme || 'light'; // Default theme
    settingsObj.font = settingsObj.font || 'system'; // Default font

    res.json(settingsObj);
  } catch (err) {
    console.error('Failed to get settings:', err);
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Failed to get settings', details: message });
  }
});

// PUT /api/settings
router.put('/', async (req, res) => {
  try {
    const db = await getDb();
    const settings = req.body;
    const promises = Object.entries(settings).map(([key, value]) => {
      return db.run(
        'INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)',
        [key, value]
      );
    });
    await Promise.all(promises);
    res.json({ message: 'Settings updated successfully' });
  } catch (err) {
    console.error('Failed to update settings:', err);
    const message = err instanceof Error ? err.message : String(err);
    res
      .status(500)
      .json({ error: 'Failed to update settings', details: message });
  }
});

export default router;
