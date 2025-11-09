# Strategy Lab V2: UI Wiring Guide

# Module G: Daily Report (Tab)

This document is the "contract" for all UI interactions for **Module G: Daily Report**, as defined in our `Strategy_Lab_V2_Plan.md`. The HTML blueprint for this module is `_dailyReport.html`.

This module is **read-only** and provides a daily snapshot of transactions and open positions. It is a heavy user of our global, reusable rendering utilities.

## G1: Module Loader

Handles the initialization of the entire page and loads all data for the current day.

| Element ID / Selector        | Purpose (Human-Readable)                        | Handler Function (for GCA)           |
| :--------------------------- | :---------------------------------------------- | :----------------------------------- |
| `#daily-report-container`    | The main page container.                        | `loadDailyReportPage()`              |
| `#table-title`               | Content: The title (e.g., "Report for [Date]"). | (Populated by `loadDailyReportPage`) |
| `#daily-performance-summary` | Container: The top summary box.                 | `loadDailySummary()`                 |
| `#refresh-prices-btn`        | Button: Manually refresh live prices.           | `handleRefreshPrices()`              |

---

## G2: Daily Transaction Log Table

This table displays all transactions (BUY/SELL) that occurred on the report's date.

| Element ID / Selector | Purpose (Human-Readable)                                                                            | Handler Function (for GCA)           |
| :-------------------- | :-------------------------------------------------------------------------------------------------- | :----------------------------------- |
| `#log-body`           | Container: The table body for daily transactions.                                                   | `loadDailyTransactions()`            |
| `(Table Content)`     | (Dynamic) This table will be built using the **global table renderer** (a variation of the Ledger). | (Managed by `loadDailyTransactions`) |
| `(Table Headers)`     | (Dynamic) Column headers with `data-sort`.                                                          | `handleSortDailyLog(event)`          |

---

## G3: Open Lots Table

This table displays all open positions as of the report's date.

| Element ID / Selector      | Purpose (Human-Readable)                                                                                     | Handler Function (for GCA)         |
| :------------------------- | :----------------------------------------------------------------------------------------------------------- | :--------------------------------- |
| `#positions-summary-title` | Content: The title for the Open Lots table.                                                                  | (Managed by `loadDailyReportPage`) |
| `#positions-summary-body`  | Container: The table body for open positions.                                                                | `loadOpenLots()`                   |
| `(Table Content)`          | (Dynamic) This table will be built using the **global table renderer** (the same one used by the Dashboard). | (Managed by `loadOpenLots`)        |
| `(Table Headers)`          | (Dynamic) Column headers with `data-sort`.                                                                   | `handleSortOpenLots(event)`        |
| `#unrealized-pl-total`     | Content: The sum of all unrealized P/L.                                                                      | (Populated by `loadOpenLots`)      |
