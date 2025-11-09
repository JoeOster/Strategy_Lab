# Strategy Lab V2: UI Wiring Guide

# Module C: Ledger (Tab)

This document is the "contract" for all UI interactions for **Module C: Ledger**, as defined in our `Strategy_Lab_V2_Plan.md`. The HTML blueprint for this module is `_ledger.html`.

This module is **read-only** (it has no data _entry_ forms). Its purpose is to display, filter, and summarize all executed transactions from the database.

## C1: Module Loader

Handles the initialization of the entire page and loads all initial data.

| Element ID / Selector    | Purpose (Human-Readable)                  | Handler Function (for GCA)     |
| :----------------------- | :---------------------------------------- | :----------------------------- |
| `#ledger-page-container` | The main page container.                  | `loadLedgerPage()`             |
| `#pl-summary-table`      | Container: Lifetime P&L Summary.          | `loadPlSummary()`              |
| `#pl-summary-tbody`      | Content: List of P&L by exchange.         | (Populated by `loadPlSummary`) |
| `#pl-summary-total`      | Content: Total lifetime P&L.              | (Populated by `loadPlSummary`) |
| `#ledger-table`          | Container: Main transaction ledger table. | `loadLedgerTable()`            |

---

## C2: Ranged P&L Summary

This panel is interactive and fetches P&L data based on the user's selected date range.

| Element ID / Selector      | Purpose (Human-Readable)                 | Handler Function (for GCA)          |
| :------------------------- | :--------------------------------------- | :---------------------------------- |
| `#pl-start-date`           | Input: P&L filter start date.            | `handlePlDateChange()`              |
| `#pl-end-date`             | Input: P&L filter end date.              | `handlePlDateChange()`              |
| `#pl-summary-ranged-table` | Container: Ranged P&L Summary.           | (Populated by `handlePlDateChange`) |
| `#pl-summary-ranged-tbody` | Content: List of ranged P&L by exchange. | (Populated by `handlePlDateChange`) |
| `#pl-summary-ranged-total` | Content: Total ranged P&L.               | (Populated by `handlePlDateChange`) |

---

## C3: Main Ledger Filters & Table

This section controls the filtering and sorting of the main transaction ledger.

| Element ID / Selector        | Purpose (Human-Readable)                    | Handler Function (for GCA)                    |
| :--------------------------- | :------------------------------------------ | :-------------------------------------------- |
| `#ledger-filter-ticker`      | Input: Filter by Ticker.                    | `handleLedgerFilterChange()`                  |
| `#ledger-filter-start`       | Input: Filter by Start Date.                | `handleLedgerFilterChange()`                  |
| `#ledger-filter-end`         | Input: Filter by End Date.                  | `handleLedgerFilterChange()`                  |
| `#ledger-clear-filters-btn`  | Button: Clears all ledger filters.          | `handleClearLedgerFilters()`                  |
| `#ledger-table > thead > th` | Column headers with `data-sort` attributes. | `handleSortLedgerTable(event)`                |
| `(tbody row button)`         | (Dynamic) Button to edit a transaction.     | `handleEditTransactionClick(transactionId)`   |
| `(tbody row button)`         | (Dynamic) Button to delete a transaction.   | `handleDeleteTransactionClick(transactionId)` |
