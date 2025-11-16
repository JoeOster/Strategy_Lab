// api/index.js
import express from 'express';
const router = express.Router();

// Import API route modules
import settingsApi from './settings.js';
import sourcesApi from './sources.js';
import exchangesApi from './exchanges.js';
import webappsApi from './webapps.js';
import strategiesApi from './strategies.js';
import watchedItemsApi from './watched-items.js';
import transactionsApi from './transactions.js';
import usersApi from './users.js';
// --- START: ADD THIS ---
import bookLookupApi from './book-lookup.js';
// --- END: ADD THIS ---

// Mount API routes
router.use('/settings', settingsApi);
router.use('/sources', sourcesApi);
router.use('/exchanges', exchangesApi);
router.use('/webapps', webappsApi);
router.use('/strategies', strategiesApi);
router.use('/watched-items', watchedItemsApi);
router.use('/transactions', transactionsApi);
router.use('/holders', usersApi);
// --- START: ADD THIS ---
router.use('/book-lookup', bookLookupApi);
// --- END: ADD THIS ---

export default router;