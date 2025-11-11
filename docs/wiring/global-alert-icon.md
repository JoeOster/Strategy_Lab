# Strategy Lab V2: UI Wiring Guide

## Module I: Global Alert Icon

This document is the "contract" for **Module I**, a small, globally-active UI
module. Its purpose is to solve the "buried tab" problem by providing a "pop up"
icon when a backend "buy trigger" has been hit.

## I1: Module Logic

This module's JavaScript will be loaded on `app.js` and will run on a timer.

| (Invented) Element ID / Selector | Purpose (Human-Readable)                    | Handler Function (for GCA)                                                                                 |
| :------------------------------- | :------------------------------------------ | :--------------------------------------------------------------------------------------------------------- |
| `(Global Timer)`                 | (e.g., "every 1 minute") Polls the backend. | `checkAlertStatus()`                                                                                       |
| `(API Function)`                 | The `api.js` function for this module.      | `api.fetchAlertStatus()` (checks the `state.hasNewAlerts` flag from `docs/service-guides/module-h-api.md`) |
| `#global-alert-icon-btn`         | The icon button (in `index.html`).          | (Show/hide is managed by `checkAlertStatus`)                                                               |

## I2: User Interaction

This defines what happens when the user _clicks_ the alert icon.

| (Invented) Element ID / Selector | Purpose (Human-Readable)                                                                                                                                                                                                               | Handler Function (for GCA) |
| :------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------- |
| `#global-alert-icon-btn`         | The clickable alert icon.                                                                                                                                                                                                              | `handleAlertIconClick()`   |
| `(Handler Logic)`                | When clicked, this handler **must** do two things: 1. Navigate the user to the "Strategy Lab" tab (Module E) and open the "Watched List" sub-tab. 2. Call `api.clearAlertStatus()` to clear the global flag, which will hide the icon. |
