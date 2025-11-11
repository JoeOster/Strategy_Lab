# Strategy Lab V2: UI Wiring Guide

# Module D: Dashboard (Tab)

This document is the "contract" for all UI interactions for **Module D:
Dashboard**, as defined in our `Strategy_Lab_V2_Plan.md`. The HTML blueprint for
this module is `_dashboard.html`.

This module is **read-only** and provides two views for the same "Open
Positions" data: a visual "Card View" and a dense "Table View".

## D1: Module Loader

Handles the initialization of the entire page and loads the "Open Positions"
data.

| Element ID / Selector        | Purpose (Human-Readable)                 | Handler Function (for GCA)                                     |
| :--------------------------- | :--------------------------------------- | :------------------------------------------------------------- |
| `#dashboard-page-container`  | The main page container.                 | `loadDashboardPage()`                                          |
| `(Module Load)`              | Fetches "Open Positions" data.           | `fetchOpenPositions()`                                         |
| `(Data Load)`                | Renders _both_ the card and table views. | `renderPositionsCards(data)` <br> `renderPositionsTable(data)` |
| `#dashboard-exchange-filter` | Populates the exchange filter dropdown.  | `populateExchangeDropdown()`                                   |

---

## D2: View Toggler & Filters

Handles switching between the Card and Table views, as well as filtering and
sorting the data.

| Element ID / Selector            | Purpose (Human-Readable)                   | Handler Function (for GCA)          |
| :------------------------------- | :----------------------------------------- | :---------------------------------- |
| `.dashboard-sub-tabs > .sub-tab` | Buttons: "Card View" / "Table View"        | `handleDashboardSubTabClick(event)` |
| `#dashboard-ticker-filter`       | Input: Filter by Ticker.                   | `handleDashboardFilterChange()`     |
| `#dashboard-exchange-filter`     | Input: Filter by Exchange.                 | `handleDashboardFilterChange()`     |
| `#dashboard-sort-select`         | Input: Sorts the data (A-Z, Gain %, etc.). | `handleDashboardSort()`             |
| `#dashboard-refresh-prices-btn`  | Button: Manually refresh live prices.      | `handleRefreshPrices()`             |

---

## D3: Card View

This is the visual grid of all open positions.

| Element ID / Selector   | Purpose (Human-Readable)                           | Handler Function (for GCA)                |
| :---------------------- | :------------------------------------------------- | :---------------------------------------- |
| `#dashboard-card-view`  | Container: The card view panel.                    | (Toggled by `handleDashboardSubTabClick`) |
| `#positions-cards-grid` | Container: The grid where cards are rendered.      | (Populated by `renderPositionsCards`)     |
| `(dynamic card button)` | (Dynamic) Action buttons on a card (e.g., "Sell"). | `handleCardActionClick(positionId)`       |

---

## D4: Table View

This is the dense table of all open positions. It uses our **reusable table
utility**.

| Element ID / Selector             | Purpose (Human-Readable)                          | Handler Function (for GCA)                |
| :-------------------------------- | :------------------------------------------------ | :---------------------------------------- |
| `#dashboard-table-view`           | Container: The table view panel.                  | (Toggled by `handleDashboardSubTabClick`) |
| `#open-positions-table`           | The main table for open positions.                | (Populated by `renderPositionsTable`)     |
| `#open-positions-tbody`           | Container: The table body.                        | (Populated by `renderPositionsTable`)     |
| `#dashboard-total-value`          | Content: Sum of all current position values.      | (Populated by `renderPositionsTable`)     |
| `#dashboard-unrealized-pl-total`  | Content: Sum of all unrealized P/L.               | (Populated by `renderPositionsTable`)     |
| `.reconciliation-checkbox-header` | Checkbox: "Select All" for reconciliation.        | `handleToggleAllReconciliation()`         |
| `(dynamic row checkbox)`          | (Dynamic) Checkbox for a single row.              | `handleReconciliationCheck(positionId)`   |
| `(dynamic row button)`            | (Dynamic) Action buttons in a row (e.g., "Sell"). | `handleTableActionClick(positionId)`      |
