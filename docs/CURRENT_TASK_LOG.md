## Source Details Modal Cleanup - Attack Plan

**Goal:** Improve the consistency and visual appeal of tables and button
controls within the Source Details modal.

### Phase 1: General Button Styling Consistency

- **Problem:** Buttons within the "Actions" columns of various tables
  (`renderStrategiesTable`, `renderTradeIdeasTable`, `renderOpenIdeasForSource`)
  use a mix of `btn`, `btn-secondary`, `btn-danger`, and `table-action-btn`
  classes. The user previously mentioned wanting "buttons inheriting default CSS
  except for size" and a `.small-btn` class.
- **Proposed Solution:**
  1.  **Define a `.small-btn` class:** Create a CSS class `.small-btn` in
      `public/css/components.css` (or `modals.css` if more specific) to control
      button size. This class will set `padding`, `font-size`, and potentially
      `min-width`/`height` to achieve a smaller button appearance while
      inheriting other default button styles.
  2.  **Apply `.small-btn`:** Add the `.small-btn` class to all action buttons
      within the tables rendered by `renderStrategiesTable`,
      `renderTradeIdeasTable`, and `renderOpenIdeasForSource`.
  3.  **Review existing button classes:** Ensure that `btn` is always present
      for default styling, and `btn-secondary`/`btn-danger` are used
      appropriately for semantic meaning (e.g., primary action, destructive
      action). Remove redundant or conflicting styling.
  4.  **Standardize button order:** For consistency, establish a standard order
      for action buttons (e.g., primary action first, then secondary, then
      destructive).

### Phase 2: Table Structure and Column Consistency (for `renderStrategiesTable`)

- **Problem:** The "Actions" column in `renderStrategiesTable` contains "Add
  Idea", "Edit", and "Delete" buttons. The layout and spacing might be
  inconsistent.
- **Proposed Solution:**
  1.  **Review `strategy-table` CSS:** Inspect `public/css/strategy-lab.css` (or
      other relevant CSS files) for `strategy-table` to ensure proper padding,
      alignment, and responsiveness.
  2.  **Standardize "Actions" column width:** Ensure the "Actions" column has a
      consistent and appropriate width across all tables to prevent wrapping or
      excessive spacing. This might involve setting a `min-width` or `width` on
      the `<th>` and `<td>` elements for the actions column.
  3.  **Button Grouping (Optional but Recommended):** Consider wrapping action
      buttons in a container (e.g., a `div` with a class like `table-actions`)
      to allow for more controlled layout (e.g., using flexbox for spacing and
      alignment within the cell).

### Phase 3: Review of other tables (after Phase 1 and 2 are approved and implemented)

- **`renderTradeIdeasTable`**: Review its structure and button styling after
  general button and table action column styling is established.
- **`renderOpenIdeasForSource`**: Review its structure and button styling after
  general button and table action column styling is established.
