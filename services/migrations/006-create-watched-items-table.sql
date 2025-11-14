CREATE TABLE IF NOT EXISTS watched_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  is_paper_trade INTEGER NOT NULL DEFAULT 0,
  user_id INTEGER,
  source_id INTEGER,
  strategy_id INTEGER, -- Nullable, as strategies table might not exist yet or be optional
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
  FOREIGN KEY (source_id) REFERENCES advice_sources(id)
  -- FOREIGN KEY (strategy_id) REFERENCES strategies(id) -- Add this when strategies table is defined
);