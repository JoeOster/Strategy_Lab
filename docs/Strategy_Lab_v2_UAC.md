# Strategy Lab V2: User Acceptance Criteria (UAC)

This document contains the official test scripts for the V2 architecture. These
scripts will be the blueprint for E2E tests.

---

## UAC - Module I: Global Alert Icon

- [ ] 1. **Default State:** GIVEN the application loads, THEN the
     `#global-alert-icon-btn` is hidden.
- [ ] 2. **Alert Appears:** GIVEN a `watched_item` (with `is_paper_trade = 0`)
     has its status set to `ALERT`, THEN the `#global-alert-icon-btn` becomes
     visible.
- [ ] 3. **Click Action & Reset:** GIVEN the alert icon is visible, WHEN I click
     it, THEN I am navigated to the **Orders tab (Module B)**, AND the icon
     becomes hidden again.
- [ ] 4. **Alert Visibility:** GIVEN I am on the Orders tab, THEN the alerted
     order in the `#pending-orders-table` is highlighted and shows the
     "Confirm/Deny" buttons.

---

### UAC - Module A: Settings (Modal)

- [ ] 1. **Modal Lifecycle:** GIVEN I click the main settings button, THEN the
     `#settings-modal` appears. WHEN I click `#save-settings-button` or
     `.close-button`, THEN the modal is hidden.
- [ ] 2. **Main Tabs:** GIVEN the modal is open, WHEN I click a `.settings-tab`
     (e.g., "Data Management"), THEN the correct panel becomes active.
- [ ] 3. **Data Sub-Tabs:** GIVEN I am on the "Data Management" tab, WHEN I
     click `[data-sub-tab="exchanges-panel"]`, THEN the "Advice Sources" panel
     is hidden and the "Exchanges" panel is shown.
- [ ] 4. **Add Source (Dynamic Panels):** GIVEN I am on the "Advice Sources"
     sub-tab, WHEN I select "Book" from `#new-source-type`, THEN the
     `#new-source-panel-book` is visible and `#new-source-panel-person` is
     hidden.
- [ ] 5. **Add Source (Submit):** GIVEN I fill out and submit the
     `#add-new-source-form`, THEN the `#advice-source-list` refreshes with the
     new source.
- [ ] 6. **Add Exchange:** GIVEN I am on the "Exchanges" sub-tab, WHEN I submit
     the `#add-exchange-form`, THEN the `#exchange-list` refreshes with the new
     exchange.
- [ ] 7. **Add User:** GIVEN I am on the "User Management" > "Users" sub-tab,
     WHEN I submit `#add-holder-form`, THEN the `#account-holder-list` refreshes
     with the new user.
- [ ] 8. **Edit Source Modal:** GIVEN I click the "Edit" button for a source in
     `#advice-source-list`, THEN the _separate_ `#edit-source-modal` appears,
     pre-filled with that source's data.

---

### UAC - Module B: Orders

- [ ] 1. **Load:** GIVEN I am on the Orders tab, THEN the "Unified 'Log Order'
     Form" and the "Watched Orders Table" (`#pending-orders-table`) load
     correctly.
- [ ] 2. **Form Switch (Executed):** GIVEN I select "Buy (Executed)" from the
     `#transaction-type` dropdown, THEN the form shows fields for an executed
     trade (e.g., `price`, `quantity`) and hides irrelevant fields (e.g.,
     `expiration_date`).
- [ ] 3. **Form Switch (Watched):** GIVEN I select "Buy Limit (Watch)" from the
     `#transaction-type` dropdown, THEN the form shows fields for a "Real
     Watched Order" (e.g., `price`, `quantity`, `expiration_date`, take
     profit/stop loss checkboxes).
- [ ] 4. **Log Executed Trade:** GIVEN I submit a valid "Buy (Executed)" order,
     THEN the `transactions` table is updated (with `is_paper_trade = 0`), and a
     success notification appears.
- [ ] 5. **Log Watched Order:** GIVEN I submit a valid "Buy Limit (Watch)"
     order, THEN a new row appears in the "Watched Orders Table"
     (`#pending-orders-table`) on this page.
- [ ] 6. **Cancel Order:** GIVEN I click the "Cancel" button for an order in the
     `#pending-orders-table`, THEN I am prompted to confirm, and the order is
     removed from the table.
- [ ] 7. **Alert Workflow:** GIVEN an order's status is `ALERT`, WHEN the
     `#pending-orders-table` loads, THEN that order's row is highlighted and
     displays the "Confirm" (`.btn-confirm-trade`) and "Deny"
     (`.btn-deny-trade`) buttons.

---

### UAC - Module C: Ledger

- [ ] 1. **Load:** GIVEN I am on the Ledger tab, THEN the "Lifetime P&L Summary"
     (`#pl-summary-table`) and the main "Transaction Ledger" (`#ledger-table`)
     load with data.
- [ ] 2. **Data Check:** GIVEN the tables load, THEN they _only_ display "Real
     Executed Trades" (`transactions` with `is_paper_trade = 0`). "Paper Trades"
     must not appear on this page.
- [ ] 3. **Ranged P&L Filter:** GIVEN I select a date range using
     `#pl-start-date` and `#pl-end-date`, WHEN the `handlePlDateChange()` event
     fires, THEN the "Ranged P&L Summary" (`#pl-summary-ranged-table`) updates
     with the correct P&L for that period.
- [ ] 4. **Ledger Filter:** GIVEN I type "MSFT" into `#ledger-filter-ticker` AND
     select a date range, WHEN the `handleLedgerFilterChange()` event fires,
     THEN the main `#ledger-table` updates to show only "MSFT" transactions
     within that range.
- [ ] 5. **Action Buttons:** GIVEN I click the "Edit" or "Delete" button on a
     transaction row, THEN the correct
     `handleEditTransactionClick(transactionId)` or
     `handleDeleteTransactionClick(transactionId)` function is called.

---

### UAC - Module D: Dashboard

- [ ] 1. **Load:** GIVEN I am on the Dashboard tab, THEN the "Open Positions"
     data is fetched and rendered in _both_ the `#dashboard-card-view` and the
     `#dashboard-table-view`.
- [ ] 2. **Data Check:** GIVEN the data loads, THEN it _only_ displays "Real
     Executed Trades" (`transactions` with `is_paper_trade = 0`).
- [ ] 3. **View Toggler:** GIVEN I click the "Table View" sub-tab, THEN the
     `#dashboard-card-view` is hidden and the `#dashboard-table-view` is shown.
- [ ] 4. **Filters:** GIVEN I type "AAPL" into `#dashboard-ticker-filter`, THEN
     both the card and table views are filtered to show only "AAPL" positions.
- [ ] 5. **Sort:** GIVEN I select "Gain %" from `#dashboard-sort-select`, THEN
     both views are re-sorted by that metric.
- [ ] 6. **Action Buttons:** GIVEN I click an action button (e.g., "Sell") on a
     card or in a table row, THEN the correct `handle...ActionClick` function is
     called with the correct `positionId`.

---

### UAC - Module E: Strategy Lab (Conductor)

- [ ] 1. **Load & Sub-Tabs:** GIVEN I am on the "Strategy Lab" tab, THEN I see
     three sub-tabs: "Sources", "Watched List", and "Paper Trades".
- [ ] 2. **Decoupling Check:** GIVEN I am on any "Strategy Lab" sub-tab, THEN I
     **do not** see any of my "Real Executed Trades" (from Dashboard) or "Real
     Watched Orders" (from Orders).

#### E.2: "Sources" Sub-Tab

- [ ] 1. **Load:** GIVEN I am on the "Sources" sub-tab, THEN the
     `#source-cards-grid` loads.
- [ ] 2. **Log Strategy:** GIVEN I am viewing a "Book" source, WHEN I click the
     "Add Strategy" button (`#source-strategy-btn`) and submit the
     `#log-strategy-form`, THEN the new strategy appears in the
     `#strategy-table` for that source.
- [ ] 3. **Log Watched Idea:** GIVEN I click a button to add an idea (e.g.,
     `#source-add-idea-btn`), WHEN I submit the `#log-idea-form`, THEN a new
     "Watched Idea" is created (stored in `watched_items` with
     `is_paper_trade = 1`).

#### E.3: "Watched List" Sub-Tab

- [ ] 1. **Load Ideas:** GIVEN I am on the "Watched List" sub-tab, THEN the
     `#watched-list-table` loads with all "Watched Ideas" (`watched_items` with
     `is_paper_trade = 1`).
- [ ] 2. **Prefill "Buy" Order:** GIVEN I click the "Buy" button
     (`.idea-buy-btn`) on an idea, THEN I am navigated to the **Orders tab
     (Module B)** and the "Unified 'Log Order' Form" is pre-filled with the
     idea's data.
- [ ] 3. **Move to "Paper":** GIVEN I click the "Paper" button
     (`.idea-paper-btn`) on an idea, THEN the idea is removed from this list,
     AND a new "Paper Trade" appears in the "Paper Trades" sub-tab (i.e., a _new
     record_ is created in the `transactions` table with `is_paper_trade = 1`).

#### E.4: "Paper Trades" Sub-Tab

- [ ] 1. **Load:** GIVEN I am on the "Paper Trades" sub-tab, THEN the
     `#paper-trades-table` loads with all "Paper Trades" (`transactions` with
     `is_paper_trade = 1`).
- [ ] 2. **Data Check:** GIVEN this table loads, THEN it re-uses the same
     rendering logic as the Dashboard's "Open Positions" table (e.g., shows P/L,
     quantity, etc.).

---

### UAC - Module F: Imports

- [ ] 1. **Load:** GIVEN I am on the Imports tab, THEN the
     `#import-account-holder` dropdown is populated with my accounts.
- [ ] 2. **Step 1 -> Step 2:** GIVEN I select an account, a template, and a CSV
     file, WHEN I click "Review & Reconcile" (`#import-csv-btn`), THEN the "Step
     2" `#reconciliation-section` becomes visible.
- [ ] 3. **Step 2 Data:** GIVEN the `#reconciliation-section` is visible, THEN
     the `#new-transactions-table` and `#conflicts-table` are populated with
     data from the CSV file.
- [ ] 4. **Cancel:** GIVEN the `#reconciliation-section` is visible, WHEN I
     click `#cancel-import-btn`, THEN the `#reconciliation-section` is hidden.
- [ ] 5. **Commit:** GIVEN I have resolved all conflicts, WHEN I click
     `#commit-import-btn`, THEN the new data is saved, and a success
     notification appears.

---

### UAC - Module G: Daily Report

- [ ] 1. **Load:** GIVEN I am on the Daily Report tab, THEN the page title
     (`#table-title`) and summary (`#daily-performance-summary`) load with the
     current date.
- [ ] 2. **Data Check:** GIVEN the tables load, THEN they _only_ display "Real
     Executed Trades" (`transactions` with `is_paper_trade = 0`).
- [ ] 3. **Daily Log:** GIVEN the `#log-body` (Daily Transaction Log) loads,
     THEN it is populated with _only_ transactions that occurred on the report's
     date.
- [ ] 4. **Open Lots:** GIVEN the `#positions-summary-body` (Open Lots) loads,
     THEN it is populated with all open positions _as of_ the report's date, and
     the `#unrealized-pl-total` is correct.
