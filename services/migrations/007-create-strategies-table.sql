CREATE TABLE IF NOT EXISTS strategies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  chapter TEXT,
  page_number TEXT,
  description TEXT,
  pdf_path TEXT,
  created_date TEXT NOT NULL,
  updated_date TEXT NOT NULL,
  FOREIGN KEY (source_id) REFERENCES advice_sources(id)
);