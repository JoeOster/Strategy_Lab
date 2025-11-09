# Task: Fix Dynamic Forms in Settings

## Plan

1.  **[x]** Analyze user report: "Book" and "Website" form fields are not appearing when selected in the "Add New Advice Source" section.
2.  **[x]** Identify that the `handleSourceTypeChange` function was a placeholder and that no event listener was attached to the dropdown.
3.  **[x]** Implement the `handleSourceTypeChange` function in `public/js/modules/settings/handlers.js` to correctly toggle panel visibility.
4.  **[x]** Add event listeners to the `#new-source-type` and `#edit-source-type` dropdowns in `public/js/modules/settings/index.js`.
5.  **[ ]** Commit the fix.