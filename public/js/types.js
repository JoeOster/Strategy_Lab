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
 * Represents a Watched Item from the mock API.
 * @typedef {object} WatchedItem
 * @property {number} id
 * @property {string} symbol
 * @property {number} entryPrice
 * @property {number} targetPrice
 * @property {string} notes
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
