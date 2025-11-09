# Task: Fix Settings Tab Content Disappearing

## Plan

1.  **[x]** Analyze user report: content disappears from settings tabs after clicking away and back.
2.  **[x]** Identify bug in `public/js/modules/settings/handlers.js` where the `handleMainTabClick` function was creating an incorrect panel ID.
3.  **[x]** Correct the logic to use the `data-tab` attribute directly as the panel ID.
4.  **[ ]** Commit the fix.
