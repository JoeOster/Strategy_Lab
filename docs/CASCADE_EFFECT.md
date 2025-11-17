# Investment Idea Cascade Effect

This document outlines the lifecycle of an investment idea within the Strategy
Lab application, from its strategic origin to its final outcome.

## The Cascade Flow:

1.  **Strategies:**
    - These are the overarching plans, methodologies, or rules often derived
      from a "Source" (e.g., a book, a person's advice, a website).
    - A strategy defines the general approach, such as asset types to trade,
      market conditions, entry/exit criteria, risk management rules, etc.

2.  **Ideas (Watched Items):**
    - A strategy generates specific "Ideas" (also referred to as "Watched
      Items").
    - An idea is a concrete potential trade opportunity, typically for a
      specific ticker symbol, with details like target buy/sell prices,
      stop-loss levels, and notes.
    - At this stage, the idea is in an observation or planning phase; no capital
      has been committed.

3.  **Buy / Paper Trade Initiation:**
    - From an "Idea," a user can choose to act upon it in one of two ways:
      - **Real Buy:** The user executes a real-money transaction based on the
        idea. This leads to an "Open Trade" (a real-money position).
      - **Paper Trade:** The user simulates a transaction based on the idea
        without committing real capital. This leads to a "Paper Trade" (a
        simulated position).

4.  **Open Trades / Paper Trades (Active Positions):**
    - **Open Trades:** These are active, real-money positions in the market.
      They are monitored for performance, and "Unrealized P/L" (Profit/Loss) is
      tracked.
    - **Paper Trades:** These are active, simulated positions. They also track
      "Unrealized P/L" based on hypothetical market movements.

5.  **Closed Sold / Closed (Final Outcome):**
    - Eventually, both real "Open Trades" and simulated "Paper Trades" reach a
      conclusion:
      - **Real Open Trade (Sold):** When a real "Open Trade" is closed (e.g., by
        selling the asset), it becomes a "Closed Trade." At this point, the
        "Realized P/L" is calculated and recorded.
      - **Paper Trade (Closed):** When a "Paper Trade" is concluded (e.g., by
        hypothetically selling the asset), it also becomes a "Closed Trade"
        (simulated). "Realized P/L" is calculated based on the simulated entry
        and exit.

## Importance of Understanding the Cascade:

- **Data Relationships:** It defines the hierarchical and relational links
  between different data entities (Sources -> Strategies -> Ideas ->
  Transactions).
- **Information Relevance:** It dictates which financial metrics (e.g.,
  Unrealized vs. Realized P/L) are relevant and displayed at each stage of a
  trade's lifecycle.
- **UI/UX Structure:** It informs how different tables, views, and modals should
  be structured, what data they should present, and what actions (e.g., "Sell"
  for open trades, "Details/Delete" for paper trades) should be available to the
  user at each point.
- **Application Logic:** It is fundamental to the application's business logic,
  ensuring that data is correctly processed, stored, and displayed according to
  the trade's status and type.

## User's Concise Understanding:

Strategies -> Ideas -> Buy/Paper -> Closed Sold/Closed
