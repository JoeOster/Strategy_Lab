# Strategy Lab V2: Service Guide

# Module H: API Data Feeding & Cron Jobs

This document is the "contract" for the **backend services** that power the
application. This module's code will live in the `strategy_lab/services/`
directory.

## H1: Price Service (`priceService.js`)

This file is responsible for all communication with external price APIs. It will
be based on the existing `priceService.js` blueprint.

| Service / Function   | Purpose (Human-Readable)                                    |
| :------------------- | :---------------------------------------------------------- |
| `getPrices(tickers)` | Fetches current prices for an array of tickers.             |
| (Internal)           | Must adhere to our API limit (60 calls/min/key, 120 total). |
| (Internal)           | Must use API key rotation.                                  |
| (Internal)           | Must include in-memory caching (`priceCache`).              |

## H2: Cron Job Service (`cronJobs.js`)

This file schedules all automated backend tasks, "untangled" from the old
`cronJobs.js` blueprint and following our new priority rules.

| Service / Function            | Purpose (Human-Readable)                                                                                                                              |
| :---------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `setupCronJobs()`             | The main function called by `server.js` to start all jobs.                                                                                            |
| `runHighPriorityWatcher()`    | **(Priority 1)** Runs **every 120 seconds**. This watcher _only_ checks "Watched Orders" (Module B) and "Watched Ideas" (Module E).                   |
| `runStaticDataPull()`         | **(Priority 2)** Runs **twice a day (06:00 and 15:00)**. Pulls "non-static information" for all _existing_ tickers.                                   |
| `runCompanyProfileBackfill()` | **(Priority 3)** Runs **nightly (e.g., 01:00)**. This is a low-priority job to "pull everything" (static company profile data) for any _new_ tickers. |
| `backupDatabase()`            | **(Priority 4)** Runs **nightly (e.g., 02:00)**. Schedules a database backup.                                                                         |

## H3: Decoupled Watcher Workflow

This is the "contract" for our new, "untangled" watchers.

1.  **`runHighPriorityWatcher()` (Priority 1)**
    - Gets targets from `pending_orders` and `journal_entries`.
    - Gets prices using `priceService.js` (this will be a high-priority call).
    - If a price is met, it sets the item's `status` to `ALERT` and sets the
      global `state.hasNewAlerts` flag to `true`.
2.  **`runStaticDataPull()` (Priority 2)**
    - Gets all unique tickers from the `transactions` and `journal_entries`
      tables.
    - Calls the appropriate `priceService.js` function to fetch non-static data
      (e.g., EOD prices, etc.).
    - Saves this data to the database (e.g., `historical_prices`).
3.  **`runCompanyProfileBackfill()` (Priority 3)**
    - Finds any ticker in the database that does _not_ have an entry in the
      `company_profile` table.
    - Uses a (low-priority) `priceService.js` call to fetch and save the static
      profile data for these new tickers.
