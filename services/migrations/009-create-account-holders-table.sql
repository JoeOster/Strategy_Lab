CREATE TABLE IF NOT EXISTS account_holders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  holder_name TEXT NOT NULL UNIQUE,
  is_default INTEGER DEFAULT 0
);

-- Insert a default account holder
INSERT INTO account_holders (holder_name, is_default) VALUES ('Default Holder', 1);