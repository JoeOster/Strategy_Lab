/**
 * @module types
 * This file contains shared JSDoc type definitions for the application,
 * based on the database schema and API responses.
 */

/**
 * Represents an Advice Source from the 'advice_sources' table.
 * @typedef {object} Source
 * @property {number} id
 * @property {string} name
 * @property {string} type - e.g., 'book', 'person', 'website'
 * @property {string | null} [url]
 * @property {string | null} [description]
 * @property {string | null} [image_path]
 * @property {string | null} [person_email]
 * @property {string | null} [person_phone]
 * @property {string | null} [person_app_type]
 * @property {string | null} [person_app_handle]
 * @property {string | null} [group_primary_contact]
 * @property {string | null} [book_author]
 * @property {string | null} [book_isbn]
 * @property {string | null} [book_websites]
 * @property {string | null} [book_pdfs]
 * @property {string | null} [website_websites]
 * @property {string | null} [website_pdfs]
 */

/**
 * Represents a Strategy from the 'strategies' table.
 * (Based on the schema and render.js implementation)
 * @typedef {object} Strategy
 * @property {number} id
 * @property {number} source_id
 * @property {string} title
 * @property {string | null} [chapter]
 * @property {number | null} [page_number]
 * @property {string | null} [description]
 * @property {string | null} [pdf_path]
 */

/**
 * Represents a Watched Item ("Trade Idea") from the 'watched_items' table.
 * @typedef {object} WatchedItem
 * @property {number} id
 * @property {number} is_paper_trade
 * @property {number | null} [user_id]
 * @property {number | null} [source_id]
 * @property {number | null} [strategy_id]
 * @property {string} ticker
 * @property {string | null} [order_type]
 * @property {number | null} [buy_price_high]
 * @property {number | null} [buy_price_low]
 * @property {number | null} [take_profit_high]
 * @property {number | null} [take_profit_low]
 * @property {number | null} [escape_price]
 * @property {string} status
 * @property {string | null} [notes]
 * @property {string} created_date
 * @property {string} updated_date
 * @property {number | null} [current_price] - (Added by the API)
 */

/**
 * Represents a Transaction ("Paper Trade" or "Real Trade") from the 'transactions' table.
 * @typedef {object} Transaction
 * @property {number} id
 * @property {number} is_paper_trade
 * @property {number | null} [user_id]
 * @property {number | null} [source_id]
 * @property {number | null} [watched_item_id]
 * @property {string} transaction_date
 * @property {string} ticker
 * @property {string} transaction_type
 * @property {number} quantity
 * @property {number} price
 * @property {number | null} [quantity_remaining]
 * @property {string} created_date
 * @property {string} updated_date
 */

/**
 * Represents a Paper Trade from the mock API.
 * @typedef {object} PaperTrade
 * @property {number} id
 * @property {string} symbol
 * @property {number} entryPrice
 * @property {number} exitPrice
 * @property {number} quantity
 * @property {number} profit
 * @property {string} date
 */

// This export is necessary to make this file a module that can be imported
// by JSDoc/TypeScript.
export {};
