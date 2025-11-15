// api/utils.js
import { Router } from 'express';
import { clearDb } from '../services/database.js';
import { getPriceV2 } from '../services/priceServiceV2.js';

const router = Router();

// GET /api/priceV2/:ticker
router.get('/priceV2/:ticker', async (req, res) => {
  const { ticker } = req.params;
  try {
    const price = await getPriceV2(ticker);
    if (price !== null) {
      res.json({ ticker, price, timestamp: Date.now() });
    } else {
      res
        .status(404)
        .json({ error: `Price for ${ticker} not found or invalid.` });
    }
  } catch (err) {
    console.error(`Failed to get price for ${ticker} using V2 service:`, err);
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({
      error: `Failed to get price for ${ticker} using V2 service`,
      details: message,
    });
  }
});

// POST /api/clear-db (Test environment only)
if (process.env.TEST_ENV) {
  router.post('/clear-db', async (req, res) => {
    try {
      await clearDb();
      res.status(200).json({ message: 'Database cleared successfully.' });
    } catch (err) {
      console.error('Failed to clear database:', err);
      const message = err instanceof Error ? err.message : String(err);
      res
        .status(500)
        .json({ error: 'Failed to clear database', details: message });
    }
  });
}

export default router;
