# Strategy Lab V2: UI Wiring Guide

This document is the "contract" for all UI interactions, as defined in our
`Strategy_Lab_V2_Plan.md`. It maps element IDs to their human-readable purpose
and the specific handler function GCA (the Servant) is responsible for wiring.

## Module A: Settings (Modal)

This module is a "conductor" that controls several sub-modules. The HTML
blueprint is `public/index.html`.

### A1: Main Modal Conductor

Handles opening, closing, and navigating the main modal tabs.

| Element ID / Selector   | Purpose (Human-Readable)                    | Handler Function (for GCA)  |
| :---------------------- | :------------------------------------------ | :-------------------------- |
| `#settings-modal`       | The main settings modal container.          | `initializeSettingsModal()` |
| `.settings-tab`         | A main tab button (e.g., Appearance, Data). | `handleMainTabClick(event)` |
| `#save-settings-button` | The "Save & Close" button for all settings. | `handleSaveAllSettings()`   |
| `.close-button`         | The 'x' in the modal corner.                | `handleCloseModal()`        |

---

### A2: General Panel

| Element ID / Selector    | Purpose (Human-Readable)           | Handler Function (for GCA)    |
| :----------------------- | :--------------------------------- | :---------------------------- |
| `#general-settings-form` | Form for all general settings.     | `loadGeneralSettings()`       |
| `#family-name`           | Input: App Title                   | (Managed by `load/save` form) |
| `#take-profit-percent`   | Input: Default Take Profit %       | (Managed by `load/save` form) |
| `#stop-loss-percent`     | Input: Default Stop Loss %         | (Managed by `load/save` form) |
| `#notification-cooldown` | Input: Notification Cooldown (Min) | (Managed by `load/save` form) |

---

### A3: Appearance Panel

| Element ID / Selector       | Purpose (Human-Readable)        | Handler Function (for GCA) |
| :-------------------------- | :------------------------------ | :------------------------- |
| `#appearance-settings-form` | Form for appearance settings.   | `loadAppearanceSettings()` |
| `#theme-selector`           | Input: Selects the color theme. | `handleThemeChange(event)` |
| `#font-selector`            | Input: Selects the UI font.     | `handleFontChange(event)`  |

---

### A4: Data Management (Sub-Conductor)

Handles the sub-tabs for Data Management.

| Element ID / Selector              | Purpose (Human-Readable)             | Handler Function (for GCA)     |
| :--------------------------------- | :----------------------------------- | :----------------------------- |
| `[data-sub-tab="sources-panel"]`   | Sub-tab button for "Advice Sources". | `handleDataSubTabClick(event)` |
| `[data-sub-tab="exchanges-panel"]` | Sub-tab button for "Exchanges".      | `handleDataSubTabClick(event)` |

#### A4.1: Sources Sub-Module (Add New)

| Element ID / Selector                                                                                                                                                                                                                                                           | Purpose (Human-Readable)                         | Handler Function (for GCA)               |
| :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :----------------------------------------------- | :--------------------------------------- |
| `#add-new-source-form`                                                                                                                                                                                                                                                          | Form to add a new advice source.                 | `handleAddNewSourceSubmit(event)`        |
| **Backend API:** `POST /api/sources` (expects JSON body matching `advice_sources` table schema)                                                                                                                                                                                 |
| `#new-source-name`                                                                                                                                                                                                                                                              | Input: Source Name (label changes dynamically)   | (Managed by form submit)                 |
| `#new-source-type`                                                                                                                                                                                                                                                              | Input: Selects source type (Person, Book, etc.). | `handleSourceTypeChange(event, 'new')`   |
| `#new-source-url`                                                                                                                                                                                                                                                               | Input: URL (Optional)                            | (Managed by form submit)                 |
| `#new-source-description`                                                                                                                                                                                                                                                       | Input: Description (Optional)                    | (Managed by form submit)                 |
| `#new-source-image-path`                                                                                                                                                                                                                                                        | Input: Image Path (Optional)                     | (Managed by form submit)                 |
| `#new-source-panel-person`                                                                                                                                                                                                                                                      | Panel: Fields for "Person" type.                 | (Controlled by `handleSourceTypeChange`) |
| `#new-source-contact-email`                                                                                                                                                                                                                                                     | Input: Person's Email                            | (Managed by form submit)                 |
| `#new-source-contact-phone`                                                                                                                                                                                                                                                     | Input: Person's Phone                            | (Managed by form submit)                 |
| `#new-source-contact-app-type`                                                                                                                                                                                                                                                  | Input: Person's Contact App                      | (Managed by form submit)                 |
| `#new-source-contact-app-handle`                                                                                                                                                                                                                                                | Input: Person's App Handle                       | (Managed by form submit)                 |
| `#new-source-panel-group`                                                                                                                                                                                                                                                       | Panel: Fields for "Group" type.                  | (Controlled by `handleSourceTypeChange`) |
| `#new-source-group-person`                                                                                                                                                                                                                                                      | Input: Group's Primary Contact                   | (Managed by form submit)                 |
| `#new-source-group-email`                                                                                                                                                                                                                                                       | Input: Group's Email                             | (Managed by form submit)                 |
| `#new-source-group-phone`                                                                                                                                                                                                                                                       | Input: Group's Phone                             | (Managed by form submit)                 |
| `#new-source-group-app-type`                                                                                                                                                                                                                                                    | Input: Group's Contact App                       | (Managed by form submit)                 |
| `#new-source-group-app-handle`                                                                                                                                                                                                                                                  | Input: Group's App Handle                        | (Managed by form submit)                 |
| `#new-source-panel-book`                                                                                                                                                                                                                                                        | Panel: Fields for "Book" type.                   | (Controlled by `handleSourceTypeChange`) |
| `#new-source-book-author`                                                                                                                                                                                                                                                       | Input: Book's Author                             | (Managed by form submit)                 |
| `#new-source-book-isbn`                                                                                                                                                                                                                                                         | Input: Book's ISBN                               | (Managed by form submit)                 |
| `#new-source-book-websites`                                                                                                                                                                                                                                                     | Input: Book's Website Links                      | (Managed by form submit)                 |
| `#new-source-book-pdfs`                                                                                                                                                                                                                                                         | Input: Book's PDF Links                          | (Managed by form submit)                 |
| `#new-source-panel-website`                                                                                                                                                                                                                                                     | Panel: Fields for "Website" type.                | (Controlled by `handleSourceTypeChange`) |
| `#new-source-website-websites`                                                                                                                                                                                                                                                  | Input: Website's Relevant Links                  | (Managed by form submit)                 |
| `#new-source-website-pdfs`                                                                                                                                                                                                                                                      | Input: Website's Saved Docs                      | (Managed by form submit)                 |
| `#advice-source-list`                                                                                                                                                                                                                                                           | Container: List of all existing sources.         | `loadSourcesList()`                      |
| `(list item button)`                                                                                                                                                                                                                                                            | (Dynamic) Button to edit a source.               | `handleEditSourceClick(sourceId)`        |
| `(list item button)`                                                                                                                                                                                                                                                            | (Dynamic) Button to delete a source.             | `handleDeleteSourceClick(sourceId)`      |
| **Note:** The `handleSourceTypeChange` function should be called on initial load (e.g., when the settings modal opens or the "Advice Sources" sub-tab is activated) to ensure the correct dynamic fields are displayed based on the default or previously selected source type. |

#### Database Schema: `advice_sources` table

```sql
CREATE TABLE IF NOT EXISTS advice_sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  url TEXT,
  description TEXT,
  image_path TEXT,
  person_email TEXT,
  person_phone TEXT,
  person_app_type TEXT,
  person_app_handle TEXT,
  group_primary_contact TEXT,
  group_email TEXT,
  group_phone TEXT,
  group_app_type TEXT,
  group_app_handle TEXT,
  book_author TEXT,
  book_isbn TEXT,
  book_websites TEXT,
  book_pdfs TEXT,
  website_websites TEXT,
  website_pdfs TEXT
);
```

#### A4.2: Exchanges Sub-Module

| Element ID / Selector | Purpose (Human-Readable)                   | Handler Function (for GCA)              |
| :-------------------- | :----------------------------------------- | :-------------------------------------- |
| `#add-exchange-form`  | Form to add a new exchange.                | `handleAddExchangeSubmit(event)`        |
| `#add-exchange-btn`   | Button: Submits the new exchange.          | (Wired to form submit)                  |
| `#exchange-list`      | Container: List of all existing exchanges. | `loadExchangesList()`                   |
| `(list item button)`  | (Dynamic) Button to delete an exchange.    | `handleDeleteExchangeClick(exchangeId)` |

---

### A5: User Management (Sub-Conductor)

Handles the sub-tabs for User Management.

| Element ID / Selector                  | Purpose (Human-Readable)            | Handler Function (for GCA)     |
| :------------------------------------- | :---------------------------------- | :----------------------------- |
| `[data-sub-tab="users-panel"]`         | Sub-tab button for "Users".         | `handleUserSubTabClick(event)` |
| `[data-sub-tab="subscriptions-panel"]` | Sub-tab button for "Subscriptions". | `handleUserSubTabClick(event)` |

#### A5.1: Users Sub-Module (Account Holders)

| Element ID / Selector     | Purpose (Human-Readable)                  | Handler Function (for GCA)                 |
| :------------------------ | :---------------------------------------- | :----------------------------------------- |
| `#add-holder-form`        | Form to add a new account holder.         | `handleAddHolderSubmit(event)`             |
| `#add-account-holder-btn` | Button: Submits the new holder.           | (Wired to form submit)                     |
| `#account-holder-list`    | Container: List of all account holders.   | `loadAccountHoldersList()`                 |
| `(list item button)`      | (Dynamic) Button to set user as default.  | `handleSetDefaultHolderClick(holderId)`    |
| `(list item button)`      | (Dynamic) Button to manage subscriptions. | `handleManageSubscriptionsClick(holderId)` |
| `(list item button)`      | (Dynamic) Button to delete a holder.      | `handleDeleteHolderClick(holderId)`        |

#### A5.2: Subscriptions Sub-Module

| Element ID / Selector                 | Purpose (Human-Readable)                        | Handler Function (for GCA)                     |
| :------------------------------------ | :---------------------------------------------- | :--------------------------------------------- |
| `#subscriptions-panel-title`          | Content: "Manage Subscribed Sources for [User]" | `loadSubscriptionsForUser(holderId)`           |
| `#subscriptions-panel-list-container` | Container: List of all sources with checkboxes. | (Managed by `loadSubscriptionsForUser`)        |
| `(dynamic checkbox)`                  | (Dynamic) Checkbox to subscribe/unsubscribe.    | `handleSubscriptionToggle(holderId, sourceId)` |

---

### A6: Edit Source Modal (Sub-Module)

This is a separate modal, triggered by `handleEditSourceClick()`.

| Element ID / Selector                                                                              | Purpose (Human-Readable)                         | Handler Function (for GCA)               |
| :------------------------------------------------------------------------------------------------- | :----------------------------------------------- | :--------------------------------------- |
| `#edit-source-modal`                                                                               | The "Edit Source" modal container.               | `openEditSourceModal(sourceId)`          |
| `#edit-source-form`                                                                                | Form to edit an existing source.                 | `handleEditSourceSubmit(event)`          |
| **Backend API:** `PUT /api/sources/:id` (expects JSON body matching `advice_sources` table schema) |
| **Backend API:** `PUT /api/sources/:id` (expects JSON body matching `advice_sources` table schema) |
| `#edit-source-id`                                                                                  | Hidden Input: The ID of the source being edited. | (Populated by `openEditSourceModal`)     |
| `#edit-source-name`                                                                                | Input: Source Name (label changes dynamically)   | (Loaded by `openEditSourceModal`)        |
| `#edit-source-type`                                                                                | Input: Selects source type.                      | `handleSourceTypeChange(event, 'edit')`  |
| `#edit-source-url`                                                                                 | Input: URL (Optional)                            | (Loaded by `openEditSourceModal`)        |
| `#edit-source-description`                                                                         | Input: Description (Optional)                    | (Loaded by `openEditSourceModal`)        |
| `#edit-source-image-path`                                                                          | Input: Image Path (Optional)                     | (Loaded by `openEditSourceModal`)        |
| `#edit-source-panel-person`                                                                        | Panel: Fields for "Person" type.                 | (Controlled by `handleSourceTypeChange`) |
| `#edit-source-contact-email`                                                                       | Input: Person's Email                            | (Loaded by `openEditSourceModal`)        |
| `#edit-source-contact-phone`                                                                       | Input: Person's Phone                            | (Loaded by `openEditSourceModal`)        |
| `#edit-source-contact-app-type`                                                                    | Input: Person's Contact App                      | (Loaded by `openEditSourceModal`)        |
| `#edit-source-contact-app-handle`                                                                  | Input: Person's App Handle                       | (Loaded by `openEditSourceModal`)        |
| `#edit-source-panel-group`                                                                         | Panel: Fields for "Group" type.                  | (Controlled by `handleSourceTypeChange`) |
| `#edit-source-group-person`                                                                        | Input: Group's Primary Contact                   | (Loaded by `openEditSourceModal`)        |
| `#edit-source-group-email`                                                                         | Input: Group's Email                             | (Loaded by `openEditSourceModal`)        |
| `#edit-source-group-phone`                                                                         | Input: Group's Phone                             | (Loaded by `openEditSourceModal`)        |
| `#edit-source-group-app-type`                                                                      | Input: Group's Contact App                       | (Loaded by `openEditSourceModal`)        |
| `#edit-source-group-app-handle`                                                                    | Input: Group's App Handle                        | (Loaded by `openEditSourceModal`)        |
| `#edit-source-panel-book`                                                                          | Panel: Fields for "Book" type.                   | (Controlled by `handleSourceTypeChange`) |
| `#edit-source-book-author`                                                                         | Input: Book's Author                             | (Loaded by `openEditSourceModal`)        |
| `#edit-source-book-isbn`                                                                           | Input: Book's ISBN                               | (Loaded by `openEditSourceModal`)        |
| `#edit-source-book-websites`                                                                       | Input: Book's Website Links                      | (Loaded by `openEditSourceModal`)        |
| `#edit-source-book-pdfs`                                                                           | Input: Book's PDF Links                          | (Loaded by `openEditSourceModal`)        |
| `#edit-source-panel-website`                                                                       | Panel: Fields for "Website" type.                | (Controlled by `handleSourceTypeChange`) |
| `#edit-source-website-websites`                                                                    | Input: Website's Relevant Links                  | (Loaded by `openEditSourceModal`)        |
| `#edit-source-website-pdfs`                                                                        | Input: Website's Saved Docs                      | (Loaded by `openEditSourceModal`)        |
