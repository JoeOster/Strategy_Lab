import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// server.js
import dotenv from 'dotenv';
import express from 'express';
dotenv.config();
// --- START: NEW API ROUTER IMPORT ---
import apiRouter from './api/index.js';
import { getDb } from './services/database.js';
// --- END: NEW API ROUTER IMPORT ---

const app = express();
const PORT = process.env.PORT || 8080;

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware to log requests
app.use((req, res, next) => {
  // Check for .gemini/tmp directory and create it if it doesn't exist
  const logDir = path.join(__dirname, '.gemini', 'tmp');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  fs.appendFileSync(
    path.join(logDir, 'request_log.txt'),
    `Request URL: ${req.url}\n`
  );
  next();
});

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// --- START: MOUNT API ROUTER ---
// All API routes are now handled by the apiRouter
app.use('/api', apiRouter);
// --- END: MOUNT API ROUTER ---

// --- ALL app.get('/api...'), app.post('/api...') routes are now REMOVED ---

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
