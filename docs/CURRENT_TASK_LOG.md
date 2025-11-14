---

## Task: Proposal for `main.css` Splitting and Redundancy Identification

**Objective:** Propose a strategy to refactor the large `public/css/main.css` file into a more modular and maintainable structure, aligning with the architectural principles outlined in `Strategy_Lab_V2_Plan.md`. This includes identifying redundancies and suggesting a plan for splitting the file into smaller, purpose-specific CSS files.

**Proposed Steps:**

1.  **Initial Assessment & Redundancy Scan:**
    *   **Action:** Conduct a thorough review of `public/css/main.css` to identify:
        *   **Duplicate rules:** Identical CSS declarations applied to different selectors.
        *   **Overlapping rules:** Styles that target similar elements or properties, potentially leading to unnecessary overrides or complex specificity.
        *   **Potential for utility classes:** Identify recurring style patterns (e.g., spacing, text alignment, common button styles) that could be abstracted into reusable utility classes.
    *   **Method:** This would involve a combination of manual inspection and potentially using `search_file_content` with specific regex patterns to find duplicate declarations or common patterns.

2.  **Define Module-Specific CSS Files:**
    *   **Action:** Based on the existing JavaScript module structure (e.g., `public/js/modules/navigation`, `public/js/modules/settings`, `public/js/modules/dashboard`), propose creating corresponding CSS files.
    *   **Example Structure:**
        *   `public/css/modules/navigation.css`
        *   `public/css/modules/settings.css`
        *   `public/css/modules/dashboard.css`
        *   `public/css/modules/strategy-lab.css` (for styles specific to the main Strategy Lab tab and its sub-modules)
    *   **Rationale:** This approach directly mirrors the modular JavaScript architecture, making it easier to locate, manage, and potentially lazy-load styles relevant to specific components or pages.

3.  **Create a Base/Utility CSS File:**
    *   **Action:** Extract foundational styles (e.g., `body`, `html` resets, typography defaults), global variables (if not already in `themes.css`), and the identified common utility classes into a new file, such as `public/css/base.css` or `public/css/utilities.css`.
    *   **Rationale:** Centralizes core, project-wide styles and promotes reusability, reducing repetition across module-specific CSS files.

4.  **Conceptual Migration Strategy (No Code Changes in this Proposal):**
    *   **Action:** Outline the high-level process for moving styles from `main.css` to the new modular files.
    *   **Steps:**
        *   For each JavaScript module, identify and move all CSS rules from `main.css` that *exclusively* style elements within that module's HTML to its dedicated CSS file (e.g., `settings.css`).
        *   Move global styles, resets, and utility classes to the `base.css`/`utilities.css` file.
        *   Ensure `public/css/themes.css` continues to hold theme-specific variables and overrides, maintaining its current role.
        *   The `index.html` (and any other relevant HTML files) would then need to be updated to include these new CSS files in the correct order (e.g., `base.css` first, then `themes.css`, then module-specific CSS files).
    *   **Considerations:** During actual implementation, careful attention would be needed to manage CSS specificity and avoid unintended style changes.

5.  **Future Enhancements (Beyond Current Scope):**
    *   **Action:** Suggest potential future improvements for CSS management.
    *   **Examples:**
        *   **CSS Preprocessor:** Introduce a preprocessor like Sass or Less for advanced features such as variables, mixins, and nesting, further enhancing organization.
        *   **Build-time Optimization:** Integrate tools like PurgeCSS to remove unused CSS during the build process, optimizing file size.
        *   **Component-Based Styling:** Explore CSS-in-JS or scoped CSS solutions if the project adopts a more advanced component-based frontend framework.

**Status:** Proposed. No code changes have been made.