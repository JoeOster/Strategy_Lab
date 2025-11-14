- [x] **CSS Refactoring: `main.css` Split and Redundancy Identification**
  - [ ] Review `public/css/main.css` for current structure and content.
  - [ ] Propose a new modular file structure for CSS files within `public/css/`
        based on logical components (e.g., `base.css`, `navigation.css`,
        `forms.css`, `modals.css`, `components.css`, `settings.css`,
        `strategy-lab.css`).
  - [ ] Identify and document redundancies in styling across different
        components (e.g., button styles, tab/sub-tab styling, list item styling,
        form input styles).
  - [ ] Suggest opportunities for abstraction and creation of reusable CSS
        classes to reduce duplication.
  - [ ] Add this proposal to `docs/CURRENT_TASK_LOG.md`.

**Proposal for `main.css` Refactoring**

The `main.css` file currently serves as a monolithic stylesheet, containing
styles for general layout, typography, navigation, modals, forms, and various
list components (account holders, advice sources, exchanges, web apps, strategy
lab cards). As the application grows, this approach will become increasingly
difficult to manage, leading to potential issues with maintainability,
scalability, and performance.

**Goals of Refactoring:**

1.  **Modularity:** Break down the stylesheet into smaller, more manageable
    files based on logical components or features.
2.  **Maintainability:** Improve the ease of locating and modifying styles for
    specific parts of the application.
3.  **Readability:** Enhance the overall readability and organization of the
    CSS.
4.  **Reduce Redundancy:** Identify and eliminate duplicate or very similar
    styles.
5.  **Performance (Potential):** While not the primary goal, a modular approach
    can sometimes lead to better caching and loading strategies.

**Proposed Split Structure:**

I recommend organizing the CSS files within the `public/css/` directory,
mirroring the JavaScript module structure where appropriate.

- **`base.css`**:
  - General body and app layout (`body`, `.app-container`, `.header`, `h1`,
    `p`).
  - General typography (`h1` to `h6`).
  - Any global utility classes that are truly generic.
- **`navigation.css`**:
  - Main navigation (`.main-nav`, `.main-nav .nav-btn`).
  - Sub-navigation (`.sub-nav`, `.sub-nav .sub-nav-btn`).
- **`forms.css`**:
  - All form-related styles (`#general-settings-form`, `label`, `input`,
    `select`, `textarea`, `button` within forms).
  - General button styles that are not specific to navigation or modals.
- **`modals.css`**:
  - Modal styles (`.modal`, `.modal-content`, `.close-button`).
  - Modal footer styles (`.modal-footer`).
- **`components.css`**:
  - Styles for reusable UI components that appear in multiple places or are
    distinct enough to warrant their own section.
  - This would include the various list styles that mimic tables (e.g.,
    `.account-holder-item`, `.advice-source-item`, `.exchange-item`,
    `.webapp-item`).
  - User selector dropdown (`.user-select-container`, `.user-select-dropdown`).
  - Table action buttons (`.table-action-btn`, `.small-btn`).
- **`settings.css`**:
  - Specific styles for the settings module (`.settings-tabs`,
    `.settings-sub-tabs`, `.settings-panel`, `.sub-panel`, `.sub-tab-content`).
- **`strategy-lab.css`**:
  - Specific styles for the strategy lab module (`#source-cards-grid`,
    `.source-card`, `.source-card-title`, `.source-card-type`,
    `.source-card-description`).

**Identified Redundancies and Opportunities for Abstraction:**

1.  **Button Styles:**
    - Many buttons (`.main-nav .nav-btn`, `.settings-tabs button`,
      `.settings-sub-tabs button`, `.modal-footer button`,
      `#add-new-source-form button`, etc.) share common properties like
      `border: none;`, `cursor: pointer;`, `font-size: 1rem;`,
      `border-radius: 5px;`.
    - **Recommendation:** Create a base button class (e.g., `.btn`) in
      `forms.css` or `base.css` that defines these common styles. Then, specific
      button types can extend or override these base styles.
    - The `.table-action-btn` and `.small-btn` already attempt to create smaller
      buttons. These could be variations of a base button class.

2.  **Tab/Sub-Tab Styling:**
    - `.main-nav .nav-btn`, `.settings-tabs button`, and
      `.settings-sub-tabs button` have very similar styling for their active and
      hover states.
    - **Recommendation:** Abstract common tab/button styling into a reusable
      class or mixin (if using a preprocessor, which we are not currently). For
      plain CSS, define a common set of properties for active/hover states that
      can be applied to different tab-like elements.

3.  **List Item Styling (Mimicking Tables):**
    - `#account-holder-list ul`, `.account-holder-item`
    - `#advice-source-list`, `.advice-source-item`
    - `#exchange-list ul`, `.exchange-item`
    - `#webapp-list ul`, `.webapp-item`
    - These all share a very similar structure and styling for displaying items
      in a list that looks like a table row
      (`display: flex; justify-content: space-between; align-items: center; padding: 10px 15px; border-bottom: 1px solid var(--container-border);`).
    - **Recommendation:** Create a generic list component class (e.g.,
      `.list-table`, `.list-table-item`) in `components.css` that encapsulates
      these common styles. Specific lists can then use these classes and add
      their unique styles.

4.  **Form Input Styles:**
    - `input`, `select`, `textarea` within forms share common padding, border,
      background, color, and border-radius.
    - **Recommendation:** Define a base style for form controls (e.g.,
      `.form-control`) in `forms.css` to apply these common properties.

5.  **Shadow and Border Colors:**
    - `box-shadow` and `border` properties frequently use `var(--shadow-color)`
      and `var(--container-border)`. This is already good practice using CSS
      variables, but it highlights the consistent use of these visual elements
      across different components.
