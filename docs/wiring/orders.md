# Strategy Lab V2: UI Wiring Guide

# Module B: Orders (Tab)

This document is the "contract" for all UI interactions for **Module B:
Orders**, as defined in our `Strategy_Lab_V2_Plan.md`. It assumes the two forms
from the original `_orders.html` blueprint have been **merged into a single,
unified "Log Order" form**.

This module is responsible for logging both executed trades and creating new
"watched" orders.

## B1: Module Loader

Handles the initialization of the entire page.

| Element ID / Selector    | Purpose (Human-Readable)              | Handler Function (for GCA)         |
| :----------------------- | :------------------------------------ | :--------------------------------- |
| `#orders-page-container` | The main page container.              | `loadOrdersPage()`                 |
| `.account-holder-select` | (Class) All account holder dropdowns. | `populateAccountHolderDropdowns()` |
| `.advice-source-select`  | (Class) All advice source dropdowns.  | `populateAdviceSourceDropdowns()`  |
| `(Module Load)`          | Pre-fill form from "Sources" module.  | `checkAndPrefillForm()`            |

---

## B2: Unified "Log Order" Form

This single "smart form" handles all order entry.

| Element ID / Selector          | Purpose (Human-Readable)                                                                                                   | Handler Function (for GCA)           |
| :----------------------------- | :------------------------------------------------------------------------------------------------------------------------- | :----------------------------------- |
| `#add-transaction-form`        | The main form for all order types.                                                                                         | `handleOrderSubmit(event)`           |
| `#transaction-type`            | **(Smart Switch)** Input: Selects order type (e.g., "Buy (Executed)", "Buy Limit (Watch)", "Sell (Executed)", "DIVIDEND"). | `handleOrderTypeChange(event)`       |
| `#add-tx-linked-journal-id`    | Hidden Input: Stores ID from "Sources" prefill.                                                                            | (Populated by `checkAndPrefillForm`) |
| `#add-tx-account-holder`       | Input: Account Holder                                                                                                      | (Managed by form submit)             |
| `#transaction-date`            | Input: Date of trade/order creation                                                                                        | (Managed by form submit)             |
| `#ticker`                      | Input: Ticker symbol                                                                                                       | (Managed by form submit)             |
| `#exchange`                    | Input: Exchange                                                                                                            | (Managed by form submit)             |
| `#quantity`                    | Input: Quantity                                                                                                            | (Managed by form submit)             |
| `#price`                       | Input: Price Per Share (or Limit Price)                                                                                    | (Managed by form submit)             |
| `(Expiration Fields)`          | (Dynamic) Show/hide expiration date for limit orders.                                                                      | (Managed by `handleOrderTypeChange`) |
| `(Notes Field)`                | (Dynamic) Show/hide notes field for limit orders.                                                                          | (Managed by `handleOrderTypeChange`) |
| `#add-tx-advice-source`        | Input: Link to Advice Source                                                                                               | (Managed by form submit)             |
| `#set-profit-limit-checkbox`   | Checkbox: Enable Take Profit 1                                                                                             | `toggleLimitOrderGroup(event)`       |
| `#add-limit-price-up`          | Input: Take Profit 1 Price                                                                                                 | (Managed by form submit)             |
| `#add-limit-up-expiration`     | Input: Take Profit 1 Expiration                                                                                            | (Managed by form submit)             |
| `#set-loss-limit-checkbox`     | Checkbox: Enable Stop Loss                                                                                                 | `toggleLimitOrderGroup(event)`       |
| `#add-limit-price-down`        | Input: Stop Loss Price                                                                                                     | (Managed by form submit)             |
| `#add-limit-down-expiration`   | Input: Stop Loss Expiration                                                                                                | (Managed by form submit)             |
| `#set-profit-limit-2-checkbox` | Checkbox: Enable Take Profit 2                                                                                             | `toggleLimitOrderGroup(event)`       |
| `#add-limit-price-up-2`        | Input: Take Profit 2 Price                                                                                                 | (Managed by form submit)             |
| `#add-limit-up-expiration-2`   | Input: Take Profit 2 Expiration                                                                                            | (Managed by form submit)             |

---

## B3: Watched Orders Table

This table displays all "Buy Limit (Watch)" and "Sell Limit (Watch)" orders that
are being monitored by the system.

| Element ID / Selector                | Purpose (Human-Readable)                           | Handler Function (for GCA)               |
| :----------------------------------- | :------------------------------------------------- | :--------------------------------------- |
| `#pending-orders-table`              | The main table for all watched orders.             | `loadWatchedOrdersTable()`               |
| `#pending-orders-table > thead > th` | Column headers with `data-sort` attributes.        | `handleSortWatchedOrders(event)`         |
| `(tbody row button)`                 | (Dynamic) Button to edit a watched order.          | `handleEditWatchedOrderClick(orderId)`   |
| `(tbody row button)`                 | (Dynamic) Button to cancel/delete a watched order. | `handleDeleteWatchedOrderClick(orderId)` |

---

## B4: Alert Workflow (New)

This new workflow is triggered by the "Watcher" service. When an order's state
changes to "Alert," these buttons will appear in its row in the "Watched Orders
Table."

| Element ID / Selector | Purpose (Human-Readable)                               | Handler Function (for GCA)    |
| :-------------------- | :----------------------------------------------------- | :---------------------------- |
| `.btn-confirm-trade`  | (Dynamic) "Confirm" button on an alerted order.        | `handleConfirmTrade(orderId)` |
| `.btn-deny-trade`     | (Dynamic) "Deny" button on an alerted order.           | `handleDenyTrade(orderId)`    |
| `.btn-review-trade`   | (Dynamic) "Pending Review" button on an alerted order. | `handleReviewTrade(orderId)`  |
