# Strategy Lab V2: UI Wiring Guide

# Module E: Strategy Lab (Tab)

This document is the "contract" for all UI interactions for **Module E: Strategy
Lab**, as defined in our `Strategy_Lab_V2_Plan.md`. This module is a "conductor"
module that manages several sub-tabs: **Sources**, **Watched List**, and **Paper
Trades**.

## E1: Main Conductor

Handles the initialization of the page and controls the main sub-tabs.

| (Invented) Element ID / Selector      | Purpose (Human-Readable)             | Handler Function (for GCA) |
| :------------------------------------ | :----------------------------------- | :------------------------- |
| `#strategy-lab-page-container`        | The main page container.             | `loadStrategyLabPage()`    |
| `[data-sub-tab="sources-panel"]`      | Sub-tab: "Sources"                   | `handleSubTabClick(event)` |
| `[data-sub-tab="watched-list-panel"]` | Sub-tab: "Watched List" (was Alerts) | `handleSubTabClick(event)` |
| `[data-sub-tab="paper-trades-panel"]` | Sub-tab: "Paper Trades"              | `handleSubTabClick(event)` |

---

## E2: "Sources" Sub-Tab

This is the "Strategy & Advice Journal". It manages "Strategies" (from
Books/Websites) and "Ideas" (from all sources).

| (Invented) Element ID / Selector | Purpose (Human-Readable)                     | Handler Function (for GCA)                  |
| :------------------------------- | :------------------------------------------- | :------------------------------------------ |
| `#sources-panel`                 | Container: The "Sources" sub-tab content.    | `loadSourcesSubTab()`                       |
| `#source-cards-grid`             | Container: The grid of "Source" cards.       | (Populated by `renderSourceCards`)          |
| `.source-card`                   | (Dynamic) A clickable card for one Source.   | `handleSourceCardClick(sourceId)`           |
| `#source-detail-container`       | Container: The "Source Profile" view/modal.  | (Populated by `loadSourceDetail(sourceId)`) |
| `#source-strategy-btn`           | Button: "Add Strategy" (Book/Website only)   | `handleShowStrategyForm(sourceId)`          |
| `#source-add-idea-btn`           | Button: "Add Trade Idea" (Person/Group only) | `handleShowIdeaForm(sourceId)`              |

#### E2.1: "Strategies" Table (Book/Website Only)

| (Invented) Element ID / Selector | Purpose (Human-Readable)                               | Handler Function (for GCA)                         |
| :------------------------------- | :----------------------------------------------------- | :------------------------------------------------- |
| `#strategy-table`                | Table of logged strategies (chapter, page, etc).       | (Populated by `loadStrategiesForSource(sourceId)`) |
| `.strategy-add-idea-btn`         | (Dynamic) Button: "Add Idea" (linked to this strategy) | `handleShowIdeaForm(sourceId, strategyId)`         |

#### E2.2: "Log Strategy" Form (Modal)

| (Invented) Element ID / Selector | Purpose (Human-Readable)          | Handler Function (for GCA)       |
| :------------------------------- | :-------------------------------- | :------------------------------- |
| `#log-strategy-form`             | Form: For logging a new strategy. | `handleLogStrategySubmit(event)` |
| `#strategy-chapter`              | Input: Chapter                    | (Managed by form submit)         |
| `#strategy-page`                 | Input: Page Number                | (Managed by form submit)         |
| `#strategy-title`                | Input: Strategy Title/Name        | (Managed by form submit)         |

#### E2.3: "Log Idea" Form (Modal)

| (Invented) Element ID / Selector | Purpose (Human-Readable)              | Handler Function (for GCA)   |
| :------------------------------- | :------------------------------------ | :--------------------------- |
| `#log-idea-form`                 | Form: For logging a new "Trade Idea". | `handleLogIdeaSubmit(event)` |
| `#idea-ticker`                   | Input: Ticker                         | (Managed by form submit)     |
| `#idea-buy-high`                 | Input: Buy Price (High)               | (Managed by form submit)     |
| `#idea-buy-low`                  | Input: Buy Price (Low)                | (Managed by form submit)     |
| `#idea-tp-high`                  | Input: Take Profit (High)             | (Managed by form submit)     |
| `#idea-tp-low`                   | Input: Take Profit (Low)              | (Managed by form submit)     |
| `#idea-escape`                   | Input: Escape Point (Stop Loss)       | (Managed by form submit)     |

---

## E3: "Watched List" Sub-Tab (was Alerts)

This tab lists all "Ideas" (tickers) that have been generated from the "Sources"
tab. This is the new "Alerts" page.

| (Invented) Element ID / Selector | Purpose (Human-Readable)                                                                   | Handler Function (for GCA)         |
| :------------------------------- | :----------------------------------------------------------------------------------------- | :--------------------------------- |
| `#watched-list-panel`            | Container: The "Watched List" sub-tab content.                                             | `loadWatchedListSubTab()`          |
| `#watched-list-table`            | The table of all logged "Ideas".                                                           | (Populated by `renderWatchedList`) |
| `.idea-edit-btn`                 | (Dynamic) Button: Edit an Idea's prices.                                                   | `handleShowIdeaForm(ideaId)`       |
| `.idea-buy-btn`                  | (Dynamic) Button: "Buy" (pre-fills Module B: Orders)                                       | `handleBuyFromIdea(ideaId)`        |
| `.idea-paper-btn`                | (Dynamic) Button: "Paper" (moves to Paper Trades)                                          | `handlePaperTradeFromIdea(ideaId)` |
| `.idea-delete-btn`               | (Dynamic) Button: Delete an Idea.                                                          | `handleDeleteIdea(ideaId)`         |
| `.idea-open-orders-table`        | (Dynamic) A nested table showing "real money" open orders for this ticker (from Module B). | `renderOpenOrdersForIdea(ideaId)`  |
| `.idea-paper-trades-table`       | (Dynamic) A nested table showing "paper trades" for this ticker.                           | `renderPaperTradesForIdea(ideaId)` |

---

## E4: "Paper Trades" Sub-Tab

This tab shows all "theoretical trades" that were initiated from the Watched
List.

| (Invented) Element ID / Selector | Purpose (Human-Readable)                                                                                                          | Handler Function (for GCA)            |
| :------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------ |
| `#paper-trades-panel`            | Container: The "Paper Trades" sub-tab content.                                                                                    | `loadPaperTradesSubTab()`             |
| `#paper-trades-table`            | The main table of all paper trades.                                                                                               | `renderPaperTradesTable()`            |
| `(Table Content)`                | (Dynamic) This table is a "non-cash" version of the Dashboard's `open-positions-table` and will re-use the global table renderer. | (Managed by `renderPaperTradesTable`) |

---

## E5: Styling Considerations

This section details the key CSS classes used within the Strategy Lab module to
control the appearance and behavior of its sub-navigation and sub-tab content.
These styles are defined in `public/css/main.css` and leverage CSS variables
from `public/css/themes.css` for theming.

### Sub-Navigation Buttons

- **`.sub-nav`**:
  - **Purpose:** Container for the Level 1 sub-navigation buttons (Sources,
    Watched List, Paper Trades).
  - **Styling:** Uses `display: flex` for horizontal layout, `margin-bottom` for
    spacing, `border-bottom` for a separator, and `padding-bottom`.
- **`.sub-nav-btn`**:
  - **Purpose:** Individual button for each sub-tab.
  - **Styling:** Inherits general button styles, but specifically sets
    `background-color`, `color`, `padding`, `font-size`, `border-radius` (top
    corners rounded), `margin-right`, and `border-bottom`. Includes a
    `transition` for smooth hover effects.
- **`.sub-nav-btn:hover`**:
  - **Purpose:** Defines the hover state for sub-tab buttons.
  - **Styling:** Changes `background-color` to `var(--info-panel-bg)`.
- **`.sub-nav-btn.active`**:
  - **Purpose:** Defines the appearance of the currently active sub-tab button.
  - **Styling:** Sets a distinct `background-color` (`var(--primary-color)`),
    `color` (white), `font-weight` (bold), and `border-bottom` to visually
    indicate the active state.

### Sub-Tab Content Panels

- **`.sub-tab-content`**:
  - **Purpose:** Container for the content of each individual sub-tab (e.g.,
    Sources panel, Watched List panel).
  - **Styling:** By default, `display: none;` to hide the content. Also includes
    `padding` and `border-top`.
- **`.sub-tab-content.active`**:
  - **Purpose:** Defines the appearance of the currently active sub-tab content
    panel.
  - **Styling:** Sets `display: block;` to make the content visible.

This structure ensures that only the active sub-tab's content is displayed, and
the corresponding navigation button is visually highlighted according to the
application's theme.
