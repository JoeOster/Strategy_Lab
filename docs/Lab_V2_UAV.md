# Strategy Lab V2: User Acceptance Criteria (UAC)

This document contains the official test scripts for the V2 architecture. These scripts will be the blueprint for E2E tests.

---

## UAC - Module I: Global Alert Icon

- [ ] 1. **Default State:** GIVEN the application loads, THEN the `#global-alert-icon-btn` is hidden.
- [ ] 2. **Alert Appears:** GIVEN a `watched_item` (with `is_paper_trade = 0`) has its status set to `ALERT`, THEN the `#global-alert-icon-btn` becomes visible.
- [ ] 3. **Click Action & Reset:** GIVEN the alert icon is visible, WHEN I click it, THEN I am navigated to the **Orders tab (Module B)**, AND the icon becomes hidden again.
- [ ] 4. **Alert Visibility:** GIVEN I am on the Orders tab, THEN the alerted order in the `#pending-orders-table` is highlighted and shows the "Confirm/Deny" buttons.

---

### UAC - Module B: Orders

- [ ] 1. **Load:** GIVEN I am on the Orders tab, THEN the "Unified 'Log Order' Form" and the "Watched Orders Table" (`#pending-orders-table`) load correctly.
- [ ] 2. **Form Switch (Executed):** GIVEN I select "Buy (Executed)" from the `#transaction-type` dropdown, THEN the form shows fields for an executed trade (e.g., `price`, `quantity`) and hides irrelevant fields (e.g., `expiration_date`).
- [ ] 3. **Form Switch (Watched):** GIVEN I select "Buy Limit (Watch)" from the `#transaction-type` dropdown, THEN the form shows fields for a "Real Watched Order" (e.g., `price`, `quantity`, `expiration_date`, take profit/stop loss checkboxes).
- [ ] 4. **Log Executed Trade:** GIVEN I submit a valid "Buy (Executed)" order, THEN the `transactions` table is updated (with `is_paper_trade = 0`), and a success notification appears.
- [ ] 5. **Log Watched Order:** GIVEN I submit a valid "Buy Limit (Watch)" order, THEN a new row appears in the "Watched Orders Table" (`#pending-orders-table`) on this page.
- [ ] 6. **Cancel Order:** GIVEN I click the "Cancel" button for an order in the `#pending-orders-table`, THEN I am prompted to confirm, and the order is removed from the table.
- [ ] 7. **Alert Workflow:** GIVEN an order's status is `ALERT`, WHEN the `#pending-orders-table` loads, THEN that order's row is highlighted and displays the "Confirm" (`.btn-confirm-trade`) and "Deny" (`.btn-deny-trade`) buttons.

---

### UAC - Module E: Strategy Lab (Conductor)

- [ ] 1. **Load & Sub-Tabs:** GIVEN I am on the "Strategy Lab" tab, THEN I see three sub-tabs: "Sources", "Watched List", and "Paper Trades".
- [ ] 2. **Decoupling Check:** GIVEN I am on any "Strategy Lab" sub-tab, THEN I **do not** see any of my "Real Executed Trades" (from Dashboard) or "Real Watched Orders" (from Orders).

#### E.2: "Sources" Sub-Tab

- [ ] 1. **Load:** GIVEN I am on the "Sources" sub-tab, THEN the `#source-cards-grid` loads.
- [ ] 2. **Log Strategy:** GIVEN I am viewing a "Book" source, WHEN I click the "Add Strategy" button (`#source-strategy-btn`) and submit the `#log-strategy-form`, THEN the new strategy appears in the `#strategy-table` for that source.
- [ ] 3. **Log Watched Idea:** GIVEN I click a button to add an idea (e.g., `#source-add-idea-btn`), WHEN I submit the `#log-idea-form`, THEN a new "Watched Idea" is created (stored in `watched_items` with `is_paper_trade = 1`).

#### E.3: "Watched List" Sub-Tab

- [ ] 1. **Load Ideas:** GIVEN I am on the "Watched List" sub-tab, THEN the `#watched-list-table` loads with all "Watched Ideas" (`watched_items` with `is_paper_trade = 1`).
- [ ] 2. **Prefill "Buy" Order:** GIVEN I click the "Buy" button (`.idea-buy-btn`) on an idea, THEN I am navigated to the **Orders tab (Module B)** and the "Unified 'Log Order' Form" is pre-filled with the idea's data.
- [ ] 3. **Move to "Paper":** GIVEN I click the "Paper" button (`.idea-paper-btn`) on an idea, THEN the idea is removed from this list, AND a new "Paper Trade" appears in the "Paper Trades" sub-tab (i.e., a _new record_ is created in the `transactions` table with `is_paper_trade = 1`).

#### E.4: "Paper Trades" Sub-Tab

- [ ] 1. **Load:** GIVEN I am on the "Paper Trades" sub-tab, THEN the `#paper-trades-table` loads with all "Paper Trades" (`transactions` with `is_paper_trade = 1`).
- [ ] 2. **Data Check:** GIVEN this table loads, THEN it re-uses the same rendering logic as the Dashboard's "Open Positions" table (e.g., shows P/L, quantity, etc.).

---

### UAC - Module D: Dashboard

- [ ] 1. **Load:** GIVEN I am on the Dashboard tab, THEN the "Open Positions" data is fetched and rendered in _both_ the `#dashboard-card-view` and the `#dashboard-table-view`.
- [ ] 2. **Data Check:** GIVEN the data loads, THEN it _only_ displays "Real Executed Trades" (`transactions` with `is_paper_trade = 0`).
- [ ] 3. **View Toggler:** GIVEN I click the "Table View" sub-tab, THEN the `#dashboard-card-view` is hidden and the `#dashboard-table-view` is shown.
- [ ] 4. **Filters:** GIVEN I type "AAPL" into `#dashboard-ticker-filter`, THEN both the card and table views are filtered to show only "AAPL" positions.
- [ ] 5. **Sort:** GIVEN I select "Gain %" from `#dashboard-sort-select`, THEN both views are re-sorted by that metric.
- [ ] 6. **Action Buttons:** GIVEN I click an action button (e.g., "Sell") on a card or in a table row, THEN the correct `handle...ActionClick` function is called with the correct `positionId`.
