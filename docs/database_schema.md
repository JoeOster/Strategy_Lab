# Strategy Lab V2: Database Schema

This document is the "contract" for the database, based on our `docs/wiring/`
guides and `docs/service-guides/`. This is the primary "source of truth" GCA
(the Servant) will use to write all `api.js` files.

---

## 1. User & Settings Tables

(Based on `docs/wiring/settings.md`)

### `users`

(Manages Account Holders)

- `id` (INTEGER, PRIMARY KEY)
- `name` (TEXT, NOT NULL)
- `is_default` (BOOLEAN, DEFAULT 0)

### `app_settings`

(Manages app settings)

- `id` (INTEGER, PRIMARY KEY)
- `key` (TEXT, UNIQUE)
- `value` (TEXT)
- _(Examples: `family-name`, `default-take-profit-percent`, etc.)_

### `exchanges`

(Manages exchanges)

- `id` (INTEGER, PRIMARY KEY)
- `name` (TEXT, NOT NULL, UNIQUE)

---

## 2. Strategy Lab Tables

(Based on `docs/wiring/strategy-lab.md`)

### `advice_sources`

(Manages all "Sources")

- `id` (INTEGER, PRIMARY KEY)
- `name` (TEXT, NOT NULL)
- `type` (TEXT, NOT NULL) -- 'Person', 'Group', 'Book', 'Website'
- `url` (TEXT)
- `description` (TEXT)
- `image_path` (TEXT)
- `person_email` (TEXT)
- `person_phone` (TEXT)
- `person_app_type` (TEXT)
- `person_app_handle` (TEXT)
- `group_primary_contact` (TEXT)
- `book_author` (TEXT)
- `book_isbn` (TEXT)
- _...etc. for all dynamic fields_

### `user_subscriptions`

(Join table for Users and Sources)

- `id` (INTEGER, PRIMARY KEY)
- `user_id` (INTEGER, FOREIGN KEY to `users.id`)
- `source_id` (INTEGER, FOREIGN KEY to `advice_sources.id`)

### `strategies`

(Manages "Strategies" from Books/Websites)

- `id` (INTEGER, PRIMARY KEY)
- `source_id` (INTEGER, FOREIGN KEY to `advice_sources.id`)
- `title` (TEXT, NOT NULL)
- `chapter` (TEXT)
- `page_number` (INTEGER)

---

## 3. UNIFIED "Watched Items" Table

(Based on `docs/wiring/orders.md` and `docs/wiring/strategy-lab.md`)

This table **replaces** the "tangled" `pending_orders` and `journal_entries`
tables. It holds _all_ hypothetical trades.

### `watched_items`

- `id` (INTEGER, PRIMARY KEY)
- **`is_paper_trade` (BOOLEAN, NOT NULL, DEFAULT 0)** -- _This is our "yes/no
  toggle"._
  - `0` = "Real Watched Order" (from Module B: Orders)
  - `1` = "Trade Idea" (from Module E: Strategy Lab)
- `user_id` (INTEGER, FOREIGN KEY to `users.id`)
- `source_id` (INTEGER, FOREIGN KEY to `advice_sources.id`, NULLABLE)
- `strategy_id` (INTEGER, FOREIGN KEY to `strategies.id`, NULLABLE)
- `ticker` (TEXT, NOT NULL)
- `order_type` (TEXT, NOT NULL) -- 'Buy Limit', 'Sell Limit'
- **`quantity` (REAL, NULLABLE)** -- _(Added) For "Real Watched Orders"_
- `buy_price_high` (REAL)
- `buy_price_low` (REAL)
- `take_profit_high` (REAL)
- `take_profit_low` (REAL)
- `escape_price` (REAL) -- "Escape Point"
- **`take_profit_2_high` (REAL, NULLABLE)** -- _(Added) For "Real Watched
  Orders"_
- **`take_profit_2_low` (REAL, NULLABLE)** -- _(Added) For "Real Watched
  Orders"_
- `status` (TEXT, NOT NULL, DEFAULT 'WATCHING') -- 'WATCHING', 'ALERT',
  'EXECUTED', 'CANCELLED'
- `created_date` (TEXT)
- `expiration_date` (TEXT, NULLABLE)
- `notes` (TEXT)

---

## 4. UNIFIED "Transactions" Table

(Based on `docs/wiring/ledger.md`, `docs/wiring/dashboard.md`,
`docs/wiring/strategy-lab.md`)

This table holds _all_ executed trades (real and paper) in one "untangled"
location.

### `transactions`

- `id` (INTEGER, PRIMARY KEY)
- **`is_paper_trade` (BOOLEAN, NOT NULL, DEFAULT 0)** -- _This is our "yes/no
  toggle"._
  - `0` = "Real Money Transaction" (for Ledger & Dashboard)
  - `1` = "Paper Trade" (for Strategy Lab)
- `user_id` (INTEGER, FOREIGN KEY to `users.id`)
- `source_id` (INTEGER, FOREIGN KEY to `advice_sources.id`, NULLABLE)
- `watched_item_id` (INTEGER, FOREIGN KEY to `watched_items.id`, NULLABLE) --
  Links to the "Idea" that started it
- `transaction_date` (TEXT, NOT NULL)
- `ticker` (TEXT, NOT NULL)
- `exchange_id` (INTEGER, FOREIGN KEY to `exchanges.id`)
- `transaction_type` (TEXT, NOT NULL) -- 'BUY', 'SELL', 'DIVIDEND'
- `quantity` (REAL, NOT NULL)
- `price` (REAL, NOT NULL)
- `cost_basis` (REAL) -- Calculated at time of "BUY"
- `quantity_remaining` (REAL) -- For tracking open lots
- `linked_buy_id` (INTEGER) -- For "SELL" transactions, linking to the "BUY" lot

---

## 5. Market Data Tables

(Based on `docs/service-guides/module-h-api.md`)

### `company_profiles`

(Stores static "pull everything" data)

- `id` (INTEGER, PRIMARY KEY)
- `ticker` (TEXT, NOT NULL, UNIQUE)
- `company_name` (TEXT)
- `logo_url` (TEXT)
- `industry` (TEXT)
- _...etc._

### `historical_prices`

(Stores EOD prices)

- `id` (INTEGER, PRIMARY KEY)
- `ticker` (TEXT, NOT NULL)
- `date` (TEXT, NOT NULL)
- `close_price` (REAL, NOT NULL)
