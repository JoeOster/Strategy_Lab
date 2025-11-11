# GCA Execution Protocol & Task Log Contract

## 1. Purpose

This document is the **primary contract** for all code-generation and
modification tasks performed by the agent (GCA/Gemini Code Assist). This
protocol **must** be followed to ensure resilience against LLM errors, prevent
"garbage code," and maintain a clear, auditable "source of truth" for all work.

This protocol overrides any in-memory chat-based workflow. **The file system is
the source of truth.**

## 2. Roles

- **Leader (User):** The architect and project manager. The Leader makes all
  final decisions, assigns tasks, and initiates execution.
- **Servant (GCA):** The implementer. The Servant's only job is to execute the
  Leader's commands according to this protocol.

## 3. The "Task Execution Log" Workflow

All coding tasks, no matter how small, **must** follow this 5-phase process.

### Phase 1: Task Assignment (Leader)

The Leader will assign a high-level task and explicitly command the creation of
a task log.

**Example Leader Prompt:**

> "GCA, review `docs/Strategy-Lab_Wiring_Guide.md` and start a new task log for
> the following: 'Wire up the save button for Settings tab -> general sub tab'."

### Phase 2: Plan Generation (Servant)

Upon receiving a "Task Assignment," the Servant (GCA) **must** perform the
following actions:

1.  Read all guiding documents specified by the Leader (e.g.,
    `V4_Migration_Map.md`, `Strategy-Lab_Wiring_Guide.md`).
2.  Break the Leader's high-level task into a detailed, step-by-step checklist.
    This must account for all required file creations, modifications, and
    deletions.
3.  Write this checklist into a new file named `docs/CURRENT_TASK_LOG.md`.
4.  Report back to the Leader: "Log created. Ready to execute."

### Phase 3: Execution (Leader)

The Leader will initiate **one of two** execution modes:

1.  **Single-Step Mode:** "GCA, execute the _next_ incomplete step from
    `docs/CURRENT_TASK_LOG.md`."
2.  **Continuous Mode:** "GCA, **run** `docs/CURRENT_TASK_LOG.md`."

### Phase 4: Atomic Execution & State Update (Servant)

This is the Servant's **Primary Directive** during execution.

1.  **Read:** Read the `docs/CURRENT_TASK_LOG.md` file.
2.  **Find:** Identify the _first_ incomplete step (e.g., `[ ] Step 4`).
3.  **Execute:** Perform the action for _only_ that single step.
4.  **Update:** _After_ the step is successfully completed, **immediately update
    the `docs/CURRENT_TASK_LOG.md` file** to mark the step as complete (e.g.,
    `[x] Step 4`).
5.  **Loop or Stop:**
    - If in "Continuous Mode," loop back to Step 1.
    - If in "Single-Step Mode," stop and await the Leader's next command.

### Phase 5: Error & Recovery (The "Circuit Breaker")

This is how we recover from _all_ errors, including GCA (LLM) context loss.

1.  **Servant's Duty (The "Circuit Breaker"):** If the Servant (GCA) encounters
    _any_ error (lint, test, `ReferenceError`, or internal LLM error) during
    "Execute" (Phase 4, Step 3), it **must** stop all work immediately.
2.  **Servant's Duty (State Integrity):** The Servant **must not** mark the
    failed step as complete.
3.  **Leader's Action (Recovery):** The Leader will recover from _any_ error
    (even a vanished chat dialog) by simply re-issuing the "Continuous Mode"
    command:
    > "GCA, **run** `docs/CURRENT_TASK_LOG.md`."
4.  **Servant's Duty (Resumption):** Upon receiving this command, the Servant
    will (as per Phase 4) read the log, find the _first incomplete step_ (the
    one that failed), and resume work from that exact point. This prevents
    "garbage code" and ensures the plan is followed precisely.
