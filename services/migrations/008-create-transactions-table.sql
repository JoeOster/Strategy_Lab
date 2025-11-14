CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  is_paper_trade INTEGER NOT NULL DEFAULT 0,
  user_id INTEGER,
  source_id INTEGER,
  watched_item_id INTEGER,
  transaction_date TEXT NOT NULL,
  ticker TEXT NOT NULL,
  transaction_type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price REAL NOT NULL,
  quantity_remaining INTEGER,
  created_date TEXT NOT NULL,
  updated_date TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES account_holders(id),
  FOREIGN KEY (source_id) REFERENCES advice_sources(id),
  FOREIGN KEY (watched_item_id) REFERENCES watched_items(id)
);