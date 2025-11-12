import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { clearDb, getDb } from './services/database.js'; // Import clearDb

const app = express();
const PORT = process.env.PORT || 8080;

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    res
      .status(500)
      .json({ error: 'Failed to get sources', details: err.message });
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
    res
      .status(500)
      .json({ error: 'Failed to add source', details: err.message });
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
    res.status(500).json({ error: 'Failed to get source' });
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
    res.status(500).json({ error: 'Failed to update source' });
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
    res.status(500).json({ error: 'Failed to delete source' });
  }
});

// API route to get all account holders
app.get('/api/holders', async (req, res) => {
  try {
    const db = await getDb();
    const holders = await db.all(
      'SELECT * FROM account_holders ORDER BY username'
    );
    res.json(holders);
  } catch (err) {
    console.error('Failed to get account holders:', err);
    res
      .status(500)
      .json({ error: 'Failed to get account holders', details: err.message });
  }
});

// API route to add a new account holder
app.post('/api/holders', async (req, res) => {
  try {
    const db = await getDb();
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const result = await db.run(
      'INSERT INTO account_holders (username) VALUES (?)',
      username
    );

    const newHolder = await db.get(
      'SELECT * FROM account_holders WHERE id = ?',
      result.lastID
    );

    res.status(201).json(newHolder);
  } catch (err) {
    console.error('Failed to add account holder:', err);
    res
      .status(500)
      .json({ error: 'Failed to add account holder', details: err.message });
  }
});

// API route to delete an account holder
app.delete('/api/holders/:id', async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;

    const result = await db.run('DELETE FROM account_holders WHERE id = ?', id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Account holder not found' });
    }

    res.status(204).send();
  } catch (err) {
    console.error('Failed to delete account holder:', err);
    res.status(500).json({ error: 'Failed to delete account holder' });
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
      res
        .status(500)
        .json({ error: 'Failed to clear database', details: err.message });
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
