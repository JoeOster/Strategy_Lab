# Strategy Lab V3: Future Development Plan

This document outlines potential features and enhancements for Strategy Lab V3.
The goal is to continuously improve the application's functionality, user
experience, and analytical capabilities.

## 1. Immediate Focus: Settings Refactoring

- **Refactor "Settings" Module:**
  - Transition the "Settings" module from its current static modal
    implementation to the dynamic content loading pattern used by other main
    tabs (e.g., "Strategy Lab").
  - This involves moving the "Settings" HTML from `public/index.html` to a
    dedicated `public/_settings.html` file.
  - Adjust `public/js/modules/navigation/index.js` to treat "Settings" like any
    other dynamically loaded tab, calling `loadPageContent('settings')`.
  - Ensure the modal behavior (showing/hiding) is correctly managed by the
    `public/js/modules/settings/index.js` module after its content is loaded.

## 2. Future Features

- More features will be added to this plan over time, based on development
  priorities and user feedback.
