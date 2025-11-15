// api/index.js
import { Router } from 'express';
import exchangesRouter from './exchanges.js';
import settingsRouter from './settings.js';
import sourcesRouter from './sources.js';
import strategiesRouter from './strategies.js';
import transactionsRouter from './transactions.js';
import utilsRouter from './utils.js';
import watchedItemsRouter from './watched-items.js';
import webappsRouter from './webapps.js';

const router = Router();

// Mount all the individual routers
router.use('/sources', sourcesRouter);
router.use('/strategies', strategiesRouter);
router.use('/watched-items', watchedItemsRouter);
router.use('/transactions', transactionsRouter);
router.use('/settings', settingsRouter);
router.use('/exchanges', exchangesRouter);
router.use('/webapps', webappsRouter);
router.use(utilsRouter); // Mount utility routes (like /priceV2, /clear-db)

export default router;
