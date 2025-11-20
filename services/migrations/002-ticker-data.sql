CREATE TABLE IF NOT EXISTS ticker_data (
  ticker TEXT PRIMARY KEY,
  -- Volatile Data (Price) - Refreshed frequently (e.g., 5 mins)
  current_price REAL,
  change_amount REAL,
  change_percent REAL,
  day_high REAL,
  day_low REAL,
  open_price REAL,
  prev_close REAL,
  price_updated_at TEXT,
  -- Static Data (Profile) - Refreshed rarely (e.g., 30 days)
  company_name TEXT,
  industry TEXT,
  sector TEXT,
  description TEXT,
  website TEXT,
  logo_url TEXT,
  market_cap REAL,
  profile_updated_at TEXT
);