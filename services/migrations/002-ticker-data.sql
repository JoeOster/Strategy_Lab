CREATE TABLE IF NOT EXISTS ticker_data (
  ticker TEXT PRIMARY KEY,
  -- Volatile Data
  current_price REAL,
  price_history TEXT, -- Stores JSON array of last 6 prices e.g., "[100.1, 100.5, ...]"
  change_amount REAL,
  change_percent REAL,
  day_high REAL,
  day_low REAL,
  open_price REAL,
  prev_close REAL,
  price_updated_at TEXT,
  -- Static Data
  company_name TEXT,
  industry TEXT,
  sector TEXT,
  description TEXT,
  website TEXT,
  logo_url TEXT,
  market_cap REAL,
  profile_updated_at TEXT
);