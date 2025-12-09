# Strategy Lab v4.5: The "Bullseye" AI Integration Roadmap

**Status:** Planned (Post-Stabilization) **Objective:** Evolve Strategy Lab from
a passive tracking tool into an active, AI-powered trading mentor.

---

## 1. Executive Summary

We are not scrapping the current **Strategy Lab** project. Instead, we are
treating the current codebase as the "Chassis" (Data, Logging, UI) and will
later install the "Engine" (AI Analysis).

Once the current version is stable and robust (clean tests, working database,
reliable price feeds), we will implement the **"Bullseye Protocol"**—a 7-step AI
workflow derived from the Bullseye Alerts methodology.

---

## 2. The "Bullseye Protocol" (Essence of the 7 Docs)

This section summarizes the core logic we will automate. Currently, these are
manual prompts; in v4.5, they will be one-click features.

### Phase 1: The Setup (Foundation)

- **Day 1: The Persona.** The AI acts not as a bot, but as a "Mentor" or "Senior
  Analyst." It knows your specific risk tolerance and style (Swing vs. Day
  Trade).
- **Day 5: The System.** A rigid set of rules defined by the user (e.g., "I only
  trade if RSI is between 50-70"). The AI must validate every potential trade
  against these rules before suggesting it.

### Phase 2: The Hunt (Finding Ideas)

- **Day 2: The Scanner.** Instead of you looking for stocks, the AI scans
  specifically for "Bullish Breakouts" (near resistance, volume rising) or
  "Bearish Breakdowns."
- **Day 6: The Catalyst.** The AI analyzes news headlines and earnings reports
  to find "Tradeable Events," filtering out noise to focus on what moves price.

### Phase 3: The Plan (Execution)

- **Day 3: Chart Reading.** The AI analyzes the trend and momentum (MACD, Moving
  Averages) to confirm if a setup is valid.
- **Day 4: The Trade Card.** The core output. For every trade, the AI defines
  three hard numbers:
  1. **Entry Zone** (Where to buy)
  2. **Stop-Loss** (Where to bail)
  3. **Profit Target** (Where to sell)
  - _Crucial Metric:_ It calculates the **R/R (Risk/Reward) Ratio**
    automatically.

### Phase 4: The Routine (Maintenance)

- **Day 7: The Daily Loop.**
  - **Morning:** Scan for pre-market movers.
  - **Midday:** Check active trades (adjust stops?).
  - **Close:** Log the day's lessons.

---

## 3. Implementation Plan (v4.5)

We will map the 7 Days directly into the existing Strategy Lab architecture.

### Module E: Strategy Lab (The "Brain")

- **Current:** Manual "Add Idea" forms.
- **v4.5 Upgrade:**
  - **"AI Source":** Add a permanent Source called "Bullseye AI."
  - **"Scan Market" Button:** Triggers the _Day 2 Logic_ via `aiService.js` to
    populate the Watched List automatically.
  - **"News Analysis" Input:** Paste a URL/Headline (Day 6) -> AI returns a
    Trade Idea.

### Module B: Orders (The "Analyst")

- **Current:** Manual entry of Price, Quantity, Limits.
- **v4.5 Upgrade:**
  - **"Auto-Plan" Button:** When viewing a ticker, click this to run the _Day 4
    Logic_.
  - **Auto-Fill:** The AI fills in the Entry, Stop, and Limit fields on the
    order form based on its analysis.
  - **Confidence Score:** A visual bar (1-10) showing how well the setup matches
    your _Day 5 Rules_.

### Module G: Daily Report (The "Coach")

- **Current:** Table of transactions and P&L.
- **v4.5 Upgrade:**
  - **AI Recap:** A generated text summary at the top of the report (Day 7).
  - _Example:_ "You followed your system well today, but you sold NVDA too
    early. Your rules say to hold until RSI hits 80."

---

## 4. Technical Requirements

To support v4.5, the current foundation must provide:

1. **Reliable Data:** `priceService.js` must accurately fetch OHLCV (Open, High,
   Low, Close, Volume) data. The AI cannot analyze charts without history.
2. **Robust Schema:** The `watched_items` table needs new columns:
   - `ai_confidence` (Integer)
   - `ai_reasoning` (Text)
   - `risk_reward_ratio` (Float)
3. **New Service:** `services/aiService.js` will be created to handle OpenAI API
   communication, prompt engineering, and response parsing.
