-- Master Schema for Strategy Lab
-- This file consolidates all table creations into a single migration.

-- =============================================================================
-- Core Application Tables
-- =============================================================================

CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value TEXT
);

CREATE TABLE IF NOT EXISTS account_holders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    holder_name TEXT UNIQUE NOT NULL,
    is_default INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS exchanges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
);

-- Default Exchanges
INSERT OR IGNORE INTO exchanges (name) VALUES ('Fidelity');
INSERT OR IGNORE INTO exchanges (name) VALUES ('E-trade');
INSERT OR IGNORE INTO exchanges (name) VALUES ('Robinhood');
INSERT OR IGNORE INTO exchanges (name) VALUES ('Miloer');
INSERT OR IGNORE INTO exchanges (name) VALUES ('Lexunex');
INSERT OR IGNORE INTO exchanges (name) VALUES ('coinbase');

CREATE TABLE IF NOT EXISTS web_apps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
);

-- =============================================================================
-- Advice and Strategy Tables
-- =============================================================================

CREATE TABLE IF NOT EXISTS advice_sources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    url TEXT,
    description TEXT,
    image_path TEXT,
    person_email TEXT,
    person_phone TEXT,
    person_app_type TEXT,
    person_app_handle TEXT,
    group_primary_contact TEXT,
    group_email TEXT,
    group_phone TEXT,
    group_app_type TEXT,
    group_app_handle TEXT,
    book_author TEXT,
    book_isbn TEXT,
    website_websites TEXT
);

CREATE TABLE IF NOT EXISTS strategies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_id INTEGER,
    title TEXT NOT NULL,
    ticker TEXT,
    chapter TEXT,
    page_number INTEGER,
    description TEXT,
    pdf_path TEXT,
    created_date TEXT NOT NULL,
    updated_date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    FOREIGN KEY (source_id) REFERENCES advice_sources(id)
);

-- =============================================================================
-- Trading and Watchlist Tables
-- =============================================================================

CREATE TABLE IF NOT EXISTS watched_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    is_paper_trade INTEGER NOT NULL DEFAULT 0,
    user_id INTEGER,
    source_id INTEGER,
    strategy_id INTEGER,
    ticker TEXT NOT NULL,
    order_type TEXT,
    buy_price_high REAL,
    buy_price_low REAL,
    take_profit_high REAL,
    take_profit_low REAL,
    escape_price REAL,
    status TEXT NOT NULL DEFAULT 'WATCHING',
    notes TEXT,
    created_date TEXT NOT NULL,
    updated_date TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES account_holders(id),
    FOREIGN KEY (source_id) REFERENCES advice_sources(id),
    FOREIGN KEY (strategy_id) REFERENCES strategies(id)
);

CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    is_paper_trade INTEGER NOT NULL DEFAULT 0,
    user_id INTEGER,
    source_id INTEGER,
    watched_item_id INTEGER,
    original_transaction_id INTEGER, -- For linking sells to buys
    transaction_date TEXT NOT NULL,
    ticker TEXT NOT NULL,
    transaction_type TEXT NOT NULL, -- 'BUY' or 'SELL'
    quantity REAL NOT NULL,
    price REAL NOT NULL,
    quantity_remaining REAL,
    status TEXT NOT NULL DEFAULT 'open', -- Added status column
    created_date TEXT NOT NULL,
    updated_date TEXT NOT NULL,
    limit_low REAL,
    limit_high REAL,
    exchange TEXT,
    time TEXT,
    FOREIGN KEY (user_id) REFERENCES account_holders(id),
    FOREIGN KEY (source_id) REFERENCES advice_sources(id),
    FOREIGN KEY (watched_item_id) REFERENCES watched_items(id),
    FOREIGN KEY (original_transaction_id) REFERENCES transactions(id)
);