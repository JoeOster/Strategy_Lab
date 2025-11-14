// server.js

// --- START: JSDoc Type Imports (Our "Dictionary") ---
/** @typedef {import('./public/js/types.js').Source} Source */
/** @typedef {import('./public/js/types.js').Strategy} Strategy */
/** @typedef {import('./public/js/types.js').WatchedItem} WatchedItem */
/** @typedef {import('./public/js/types.js').Transaction} Transaction */
// --- END: JSDoc Type Imports ---

import fs from 'node:fs';
import dotenv from 'dotenv';
dotenv.config();
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { clearDb, getDb } from './services/database.js'; // Import clearDb
import { getPriceV2 } from './services/priceServiceV2.js';

const app = express();
const PORT = process.env.PORT || 8080;

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware to log requests
app.use((req, res, next) => {
  fs.appendFileSync(
    path.join(__dirname, '.gemini', 'tmp', 'request_log.txt'),
    `Request URL: ${req.url}\n`
  );
  next();
});

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// API route to get all sources
app.get('/api/sources', async (req, res) => {
  try {
    const db = await getDb();
    const sources = await db.all('SELECT * FROM advice_sources ORDER BY name');
    res.json(sources);
  } catch (err) {
    console.error('Failed to get sources:', err);
    // --- FIX: Handle 'unknown' type for err ---
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Failed to get sources', details: message });
    // --- END FIX ---
  }
});

// API route to add a new source
app.post('/api/sources', async (req, res) => {
  try {
    const db = await getDb();

    // The column names in the table
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

    // The values from the request body, ensuring undefined values are converted to null
    const values = columns.map((col) => {
      const value = req.body[col];
      return value !== undefined ? value : null;
    });

    const sql = `INSERT INTO advice_sources (${columns.join(
      ', '
    )}) VALUES (${columns.map(() => '?').join(', ')})`;

    const result = await db.run(sql, values);

    // Get the newly created source
    const newSource = await db.get(
      'SELECT * FROM advice_sources WHERE id = ?',
      result.lastID
    );

    res.status(201).json(newSource);
  } catch (err) {
    console.error('Failed to add source:', err);
    // --- FIX: Handle 'unknown' type for err ---
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Failed to add source', details: message });
    // --- END FIX ---
  }
});

// API route to get a single source by ID
app.get('/api/sources/:id', async (req, res) => {
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
    // --- FIX: Handle 'unknown' type for err ---
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Failed to get source', details: message });
    // --- END FIX ---
  }
});

// API route to get all strategies for a specific source
app.get('/api/sources/:sourceId/strategies', async (req, res) => {
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
    // --- FIX: Handle 'unknown' type for err ---
    const message = err instanceof Error ? err.message : String(err);
    res
      .status(500)
      .json({ error: 'Failed to get strategies', details: message });
    // --- END FIX ---
  }
});

// API route to add a new strategy
app.post('/api/strategies', async (req, res) => {
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

    // --- START: FIX ---
    // Add created_date and updated_date to match the 007 migration schema
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
    // --- END: FIX ---

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

// API route to add a new "Trade Idea" (a watched_item)
app.post('/api/watched-items/ideas', async (req, res) => {
  try {
    const db = await getDb();
    // --- FIX: Add type hint for req.body ---
    /** @type {Partial<WatchedItem>} */
    const idea = req.body;
    // --- END FIX ---

    // Define the columns based on the form and schema
    const columns = [
      'is_paper_trade',
      'user_id',
      'source_id',
      'strategy_id',
      'ticker',
      'order_type',
      'buy_price_high',
      'buy_price_low',
      'take_profit_high',
      'take_profit_low',
      'escape_price',
      'status',
      'notes',
      'created_date',
      'updated_date', // <-- ADDED THIS
    ];

    // Map values from the request body, providing defaults
    const now = new Date().toISOString(); // <-- GET CURRENT TIME
    const values = [
      1, // is_paper_trade
      idea.user_id || 1, // user_id (default to 1 for now)
      idea.source_id || null,
      idea.strategy_id || null,
      idea.ticker,
      idea.order_type || 'Buy Limit',
      idea.buy_price_high || null,
      idea.buy_price_low || null,
      idea.take_profit_high || null,
      idea.take_profit_low || null,
      idea.escape_price || null,
      'WATCHING', // status
      idea.notes || null,
      now, // created_date <-- USE 'now'
      now, // updated_date <-- USE 'now'
    ];

    const placeholders = columns.map(() => '?').join(',');
    const sql = `INSERT INTO watched_items (${columns.join(
      ','
    )}) VALUES (${placeholders})`;

    const result = await db.run(sql, values);

    const newIdea = await db.get(
      'SELECT * FROM watched_items WHERE id = ?',
      result.lastID
    );
    res.status(201).json(newIdea);
  } catch (err) {
    console.error('Failed to add trade idea:', err);
    // --- FIX: Handle 'unknown' type for err ---
    const message = err instanceof Error ? err.message : String(err);
    res
      .status(500)
      .json({ error: 'Failed to add trade idea', details: message });
    // --- END FIX ---
  }
});

// API route to get all watched "Ideas" (is_paper_trade = 1)
app.get('/api/watched-items/ideas', async (req, res) => {
  try {
    const db = await getDb();
    // 1. Get all "Ideas" from the database
    // --- FIX: Add type hint for ideas ---
    /** @type {WatchedItem[]} */
    const ideas = await db.all(
      'SELECT * FROM watched_items WHERE is_paper_trade = 1 AND status = ?',
      'WATCHING'
    );
    // --- END FIX ---

    // 2. Get unique tickers
    // (FIX: 'idea' is now correctly typed as WatchedItem)
    const tickers = [...new Set(ideas.map((idea) => idea.ticker))];

    // 3. Fetch all prices in parallel
    const pricePromises = tickers.map((ticker) => getPriceV2(ticker));
    const prices = await Promise.all(pricePromises);

    // 4. Create a map of tickers to their prices
    // --- FIX: Add type hint for priceMap ---
    /** @type {{[key: string]: number | null}} */
    const priceMap = {};
    // --- END FIX ---
    tickers.forEach((ticker, index) => {
      priceMap[ticker] = prices[index]; // (FIX: This is now type-safe)
    });

    // 5. Combine prices with idea data
    // (FIX: 'idea' is now correctly typed as WatchedItem)
    const ideasWithPrices = ideas.map((idea) => ({
      ...idea,
      current_price: priceMap[idea.ticker] || null, // Add the live price
    }));

    res.json(ideasWithPrices);
  } catch (err) {
    console.error('Failed to get watched items (ideas):', err);
    // --- FIX: Handle 'unknown' type for err ---
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Failed to get ideas', details: message });
    // --- END FIX ---
  }
});

// API route to get a single watched item (for pre-fill)
app.get('/api/watched-items/:id', async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    const item = await db.get('SELECT * FROM watched_items WHERE id = ?', id);
    if (!item) {
      return res.status(404).json({ error: 'Watched item not found' });
    }
    res.json(item);
  } catch (err) {
    console.error(`Failed to get watched item ${req.params.id}:`, err);
    // --- FIX: Handle 'unknown' type for err ---
    const message = err instanceof Error ? err.message : String(err);
    res
      .status(500)
      .json({ error: 'Failed to get watched item', details: message });
    // --- END FIX ---
  }
});

// API route to delete a watched item
app.delete('/api/watched-items/:id', async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    const result = await db.run('DELETE FROM watched_items WHERE id = ?', id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Watched item not found' });
    }
    res.status(204).send();
  } catch (err) {
    console.error(`Failed to delete watched item ${req.params.id}:`, err);
    // --- FIX: Handle 'unknown' type for err ---
    const message = err instanceof Error ? err.message : String(err);
    res
      .status(500)
      .json({ error: 'Failed to delete watched item', details: message });
    // --- END FIX ---
  }
});

// API route to move an "Idea" to a "Paper Trade"
app.post('/api/watched-items/:id/to-paper', async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;

    // 1. Get the idea
    // --- FIX: Add type hint for idea ---
    /** @type {WatchedItem | undefined} */
    const idea = await db.get(
      'SELECT * FROM watched_items WHERE id = ? AND is_paper_trade = 1',
      id
    );
    // --- END FIX ---
    if (!idea) {
      return res.status(404).json({ error: 'Trade Idea not found' });
    }

    // 2. Get the current price to use as the "entry price"
    const entryPrice = await getPriceV2(idea.ticker);
    if (!entryPrice) {
      return res
        .status(500)
        .json({ error: 'Could not fetch current price to create paper trade' });
    }

    // --- START: FIX ---
    // 3. Create a new "Paper Trade" transaction, including date fields
    const now = new Date().toISOString();
    const result = await db.run(
      `INSERT INTO transactions 
         (is_paper_trade, user_id, source_id, watched_item_id, transaction_date, ticker, transaction_type, quantity, price, quantity_remaining, created_date, updated_date) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        1, // is_paper_trade = 1
        idea.user_id,
        idea.source_id,
        id, // Link to the original idea
        now, // transaction_date
        idea.ticker,
        'BUY',
        1, // Default quantity to 1 for now
        entryPrice,
        1, // quantity_remaining
        now, // created_date
        now, // updated_date
      ]
    );
    // --- END: FIX ---

    // 4. Mark the original idea as 'EXECUTED'
    await db.run(
      'UPDATE watched_items SET status = ?, updated_date = ? WHERE id = ?',
      [
        'EXECUTED',
        now, // Update the timestamp
        id,
      ]
    );

    res.status(201).json({
      message: 'Paper trade created',
      newTransactionId: result.lastID,
      originalIdeaId: id,
    });
  } catch (err) {
    console.error(`Failed to move idea ${req.params.id} to paper:`, err);
    // --- FIX: Handle 'unknown' type for err ---
    const message = err instanceof Error ? err.message : String(err);
    res
      .status(500)
      .json({ error: 'Failed to move idea to paper', details: message });
    // --- END FIX ---
  }
});

// API route to update a source
app.put('/api/sources/:id', async (req, res) => {
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
    // --- FIX: Handle 'unknown' type for err ---
    const message = err instanceof Error ? err.message : String(err);
    res
      .status(500)
      .json({ error: 'Failed to update source', details: message });
    // --- END FIX ---
  }
});

// API route to delete a source
app.delete('/api/sources/:id', async (req, res) => {
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
    // --- FIX: Handle 'unknown' type for err ---
    const message = err instanceof Error ? err.message : String(err);
    res
      .status(500)
      .json({ error: 'Failed to delete source', details: message });
    // --- END FIX ---
  }
});

// API route to get all "Paper Trades" (transactions where is_paper_trade = 1)
app.get('/api/transactions/paper-trades', async (req, res) => {
  try {
    const db = await getDb();
    // Fetch all transactions that are marked as paper trades
    const paperTrades = await db.all(
      'SELECT * FROM transactions WHERE is_paper_trade = 1 ORDER BY transaction_date DESC'
    );

    // TODO: We will eventually need to join this with price data
    // and calculate P/L, just like the Dashboard.
    // For now, just returning the raw data.

    res.json(paperTrades);
  } catch (err) {
    console.error('Failed to get paper trades:', err);
    // --- FIX: Handle 'unknown' type for err ---
    const message = err instanceof Error ? err.message : String(err);
    res
      .status(500)
      .json({ error: 'Failed to get paper trades', details: message });
    // --- END FIX ---
  }
});

// API route to get price for a ticker using V2 service
app.get('/api/priceV2/:ticker', async (req, res) => {
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
    // --- FIX: Handle 'unknown' type for err ---
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({
      error: `Failed to get price for ${ticker} using V2 service`,
      details: message,
    });
    // --- END FIX ---
  }
});

// API route to get all account holders
// API route to get all account holders
// app.get('/api/holders', async (req, res) => {
//   try {
//     const db = await getDb();
//     const holders = await db.all(
//       'SELECT * FROM account_holders ORDER BY username'
//     );
//     res.json(holders);
//   } catch (err) {
//     console.error('Failed to get account holders:', err);
//     // --- FIX: Handle 'unknown' type for err ---
//     const message = err instanceof Error ? err.message : String(err);
//     res
//       .status(500)
//       .json({ error: 'Failed to get account holders', details: message });
//     // --- END FIX ---
//   }
// });

// API route to add a new account holder
// API route to add a new account holder
// app.post('/api/holders', async (req, res) => {
//   try {
//     const db = await getDb();
//     const { username } = req.body;

//     if (!username) {
//       return res.status(400).json({ error: 'Username is required' });
//     }

//     const result = await db.run(
//       'INSERT INTO account_holders (username) VALUES (?)',
//       username
//     );

//     const newHolder = await db.get(
//       'SELECT * FROM account_holders WHERE id = ?',
//       result.lastID
//     );

//     res.status(201).json(newHolder);
//   } catch (err) {
//     console.error('Failed to add account holder:', err);
//     // --- FIX: Handle 'unknown' type for err ---
//     const message = err instanceof Error ? err.message : String(err);
//     res
//       .status(500)
//       .json({ error: 'Failed to add account holder', details: message });
//     // --- END FIX ---
//   }
// });

// API route to delete an account holder
// API route to delete an account holder
// app.delete('/api/holders/:id', async (req, res) => {
//   try {
//     const db = await getDb();
//     const { id } = req.params;

//     const result = await db.run('DELETE FROM account_holders WHERE id = ?', id);

//     if (result.changes === 0) {
//       return res.status(404).json({ error: 'Account holder not found' });
//     }

//     res.status(204).send();
//   } catch (err) {
//     console.error('Failed to delete account holder:', err);
//     // --- FIX: Handle 'unknown' type for err ---
//     const message = err instanceof Error ? err.message : String(err);
//     res
//       .status(500)
//       .json({ error: 'Failed to delete account holder', details: message });
//     // --- END FIX ---
//   }
// });

// API route to get all settings
app.get('/api/settings', async (req, res) => {
  try {
    const db = await getDb();
    // --- FIX: Add type hint for settings ---
    /** @type {{key: string, value: string}[]} */
    const settings = await db.all('SELECT * FROM app_settings');
    // --- END FIX ---

    // --- FIX: Add type hints for reduce ---
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
    // --- END FIX ---
    res.json(settingsObj);
  } catch (err) {
    console.error('Failed to get settings:', err);
    // --- FIX: Handle 'unknown' type for err ---
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Failed to get settings', details: message });
    // --- END FIX ---
  }
});

// API route to update settings
app.put('/api/settings', async (req, res) => {
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
    // --- FIX: Handle 'unknown' type for err ---
    const message = err instanceof Error ? err.message : String(err);
    res
      .status(500)
      .json({ error: 'Failed to update settings', details: message });
    // --- END FIX ---
  }
});

// API routes for Exchanges
app.get('/api/exchanges', async (req, res) => {
  try {
    const db = await getDb();
    const exchanges = await db.all('SELECT * FROM exchanges ORDER BY name');
    res.json(exchanges);
  } catch (err) {
    console.error('Failed to get exchanges:', err);
    // --- FIX: Handle 'unknown' type for err ---
    const message = err instanceof Error ? err.message : String(err);
    res
      .status(500)
      .json({ error: 'Failed to get exchanges', details: message });
    // --- END FIX ---
  }
});

app.post('/api/exchanges', async (req, res) => {
  console.log('POST /api/exchanges hit');
  console.log('Request body:', req.body);
  try {
    const db = await getDb();
    const { name } = req.body;
    if (!name) {
      console.log('Validation error: Exchange name is required');
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
    console.log('New exchange added:', newExchange);
    res.status(201).json(newExchange);
  } catch (err) {
    console.error('Failed to add exchange:', err);
    // --- FIX: Handle 'unknown' type for err ---
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Failed to add exchange', details: message });
    // --- END FIX ---
  }
});

app.delete('/api/exchanges/:id', async (req, res) => {
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
    // --- FIX: Handle 'unknown' type for err ---
    const message = err instanceof Error ? err.message : String(err);
    res
      .status(500)
      .json({ error: 'Failed to delete exchange', details: message });
    // --- END FIX ---
  }
});

// API routes for Web Apps
app.get('/api/webapps', async (req, res) => {
  try {
    const db = await getDb();
    const webApps = await db.all('SELECT * FROM web_apps ORDER BY name');
    res.json(webApps);
  } catch (err) {
    console.error('Failed to get web apps:', err);
    // --- FIX: Handle 'unknown' type for err ---
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Failed to get web apps', details: message });
    // --- END FIX ---
  }
});

app.post('/api/webapps', async (req, res) => {
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
    // --- FIX: Handle 'unknown' type for err ---
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Failed to add web app', details: message });
    // --- END FIX ---
  }
});

app.delete('/api/webapps/:id', async (req, res) => {
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
    // --- FIX: Handle 'unknown' type for err ---
    const message = err instanceof Error ? err.message : String(err);
    res
      .status(500)
      .json({ error: 'Failed to delete web app', details: message });
    // --- END FIX ---
  }
});

// API route to clear the database (for testing purposes)
if (process.env.TEST_ENV) {
  app.post('/api/clear-db', async (req, res) => {
    try {
      await clearDb();
      res.status(200).json({ message: 'Database cleared successfully.' });
    } catch (err) {
      console.error('Failed to clear database:', err);
      // --- FIX: Handle 'unknown' type for err ---
      const message = err instanceof Error ? err.message : String(err);
      res
        .status(500)
        .json({ error: 'Failed to clear database', details: message });
      // --- END FIX ---
    }
  });
}

// Catch-all for HTML5 pushState routing
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  // Ensure the database connection is closed when the server shuts down
  process.on('SIGINT', async () => {
    const db = await getDb();
    if (db) {
      await db.close();
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
  process.on('SIGTERM', async () => {
    const db = await getDb();
    if (db) {
      await db.close();
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});
