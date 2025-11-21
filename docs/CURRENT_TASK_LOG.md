# Task: Implement Dashboard Feature

- [x] **1. Create Dashboard Sub-tabs:**
    - [x] a. Create `_dashboard-list-view.html` and `_dashboard-card-view.html` partials.
    - [x] b. Modify `_dashboard.html` to include sub-tab navigation for "List View" and "Card View".
    - [x] c. Create `public/js/modules/dashboard/handlers.js` to handle sub-tab switching.
    - [x] d. Update `public/js/modules/dashboard/index.js` to initialize the sub-tab handlers.

- [x] **2. Implement List View:**
    - [x] a. Create `public/js/modules/dashboard/api.js` to fetch open and closed retail trades.
    - [x] b. Create `public/js/modules/dashboard/render.js` to render the open and closed retail trades tables.
    - [x] c. Update `public/js/modules/dashboard/handlers.js` to call the render functions when the "List View" sub-tab is active.

- [x] **3. Implement Card View:**
    - [x] a. Update `public/js/modules/dashboard/api.js` to fetch and process data for the card view.
    - [x] b. Update `public/js/modules/dashboard/render.js` to render the card view for open retail trades.
    - [x] c. Update `public/js/modules/dashboard/handlers.js` to call the render function when the "Card View" sub-tab is active.

- [x] **4. Implement Open Ticker Modal:**
    - [x] a. Create `_open-ticker-modal.html` partial.
    - [x] b. Add logic to `public/js/modules/dashboard/handlers.js` to open the modal when a ticker is clicked.
    - [x] c. Create `public/js/modules/dashboard/modal.handlers.js` to handle the modal's functionality.
    - [x] d. Create `public/js/modules/dashboard/modal.render.js` to render the content of the modal.
    - [x] e. Update `public/js/modules/dashboard/index.js` to initialize the modal handlers.

- [x] **5. Implement "Click on Ticker" Functionality:**
    - [x] a. Add event listeners to all tables to handle ticker clicks.
    - [x] b. When a ticker is clicked, open the "Open Ticker Modal" with the corresponding data.