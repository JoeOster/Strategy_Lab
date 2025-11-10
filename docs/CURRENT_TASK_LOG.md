# Task: Align "Advice Sources" with the Wiring Guide

This task involves refactoring the "Advice Sources" feature to match the detailed specification in `docs/wiring/settings.md`. This will replace the previous, simpler implementation.

## Plan

**_Part 1: Revert Previous Changes_**

1. **[x] Revert `public/index.html`:** Restore the original complex form for adding and editing advice sources.
2. **[x] Revert `public/js/modules/settings/handlers.js`:** Restore the original handlers that manage the complex UI logic.
3. **[x] Revert `server.js`:** Restore the original API endpoints that were designed for the complex data model.

**Part 2: Implement Correct Schema** 4. **[x] Update Database Schema:** Modify `services/database.js` to create the `advice_sources` table with the detailed schema described in the wiring guide. 5. **[x] Align API with Schema:** Update the API endpoints in `server.js` to perfectly match the new `advice_sources` table schema.

**Part 3: Finalize and Test** 6. **[x] Verify Frontend Logic:** Ensure all frontend handlers in `handlers.js` (add, load, delete, type-change) function correctly with the new backend. 7. **[x] Manual End-to-End Test:** Thoroughly test the complete functionality: adding sources of different types, viewing them, and deleting them. 8. **[x] Commit Changes:** Commit all the completed work.
