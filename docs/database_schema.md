# Database Schema

This document outlines the database schema for the Strategy Lab application. The
database is SQLite, and tables are created and managed via migration scripts in
`services/migrations/`.

---

## Table: `app_settings`

Stores application-wide settings as key-value pairs.

```sql
CREATE TABLE app_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE,
  value TEXT
);
```

---

## Table: `advice_sources`

Stores information about various sources of trading advice (e.g., books, people,
websites).

```sql
CREATE TABLE advice_sources (
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
  book_websites TEXT,
  book_pdfs TEXT,
  website_websites TEXT,
  website_pdfs TEXT
);
```

---

## Table: `account_holders`

Stores information about the users or account holders within the application.

```sql
CREATE TABLE account_holders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE
);
```

---

## Table: `web_apps`

Stores information about integrated web applications.

```sql
CREATE TABLE web_apps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);
```

---

## Table: `exchanges`

Stores information about financial exchanges.

```sql
CREATE TABLE exchanges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  url TEXT,
  description TEXT,
  cs_contact TEXT
);
```

---

## Table: `strategies`

Stores detailed information about trading strategies derived from
`advice_sources`.

```sql
CREATE TABLE strategies (
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
```

---

## Table: `watched_items`

Stores "trade ideas" or items being watched, potentially for paper trading or
real trades.

```sql
CREATE TABLE watched_items (
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
```

---

## Table: `transactions`

Stores records of executed trades, including paper trades.

```sql
CREATE TABLE transactions (
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
```
