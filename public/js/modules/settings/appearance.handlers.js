// public/js/modules/settings/appearance.handlers.js

// --- START: FIX ---
// Add keys for localStorage
const THEME_KEY = 'strategyLabTheme';
const FONT_KEY = 'strategyLabFont';
// --- END: FIX ---

/**
 * Applies the given theme to the document body AND saves it.
 * @param {string} themeName - The name of the theme to apply.
 */
function applyTheme(themeName) {
  document.body.setAttribute('data-theme', themeName);
  // --- START: FIX ---
  // Save the choice to localStorage
  try {
    localStorage.setItem(THEME_KEY, themeName);
  } catch (e) {
    console.error('Failed to save theme to localStorage', e);
  }
  // --- END: FIX ---
}

/**
 * Applies the given font to the document body AND saves it.
 * @param {string} fontName - The name of the font to apply.
 */
function applyFont(fontName) {
  document.body.style.setProperty('--body-font', `var(--font-${fontName})`);
  // --- START: FIX ---
  // Save the choice to localStorage
  try {
    localStorage.setItem(FONT_KEY, fontName);
  } catch (e) {
    console.error('Failed to save font to localStorage', e);
  }
  // --- END: FIX ---
}

/**
 * Populates the theme dropdown selector.
 * @param {string} currentTheme
 */
function populateThemeSelector(currentTheme) {
  const themeSelector = document.getElementById('theme-selector');
  if (!themeSelector) {
    console.error('Theme selector element not found.');
    return;
  }

  // Clear existing options
  themeSelector.innerHTML = '';

  const themes = ['light', 'dark', 'sepia', 'contrast'];

  for (const theme of themes) {
    const option = document.createElement('option');
    option.value = theme;
    option.textContent = theme.charAt(0).toUpperCase() + theme.slice(1);
    if (theme === currentTheme) {
      option.selected = true;
    }
    themeSelector.appendChild(option);
  }
}

/**
 * Populates the font dropdown selector.
 * @param {string} currentFont
 */
function populateFontSelector(currentFont) {
  const fontSelector = document.getElementById('font-selector');
  if (!fontSelector) {
    console.error('Font selector element not found.');
    return;
  }

  // Clear existing options
  fontSelector.innerHTML = '';

  const fonts = [
    'system',
    'sans-serif',
    'serif',
    'monospace',
    'dancing-script',
  ];

  for (const font of fonts) {
    const option = document.createElement('option');
    option.value = font;
    option.textContent = font.charAt(0).toUpperCase() + font.slice(1);
    if (font === currentFont) {
      option.selected = true;
    }
    fontSelector.appendChild(option);
  }
}

/**
 * Loads user preferences (theme and font) and applies them AT STARTUP.
 * This function is called from app-main.js and does NOT touch selectors.
 */
export function applyInitialAppearance() {
  console.log('applyInitialAppearance called');

  // --- START: FIX ---
  // Read from localStorage, providing a default if nothing is saved
  const currentTheme = localStorage.getItem(THEME_KEY) || 'light';
  const currentFont = localStorage.getItem(FONT_KEY) || 'system';
  // --- END: FIX ---

  applyTheme(currentTheme);
  applyFont(currentFont);
}

/**
 * Populates the selectors in the Appearance settings tab.
 * This is called when the settings module is initialized.
 */
export function initializeAppearanceTab() {
  console.log('initializeAppearanceTab called');

  // --- START: FIX ---
  // Read from localStorage to set the dropdowns to the *correct* active value
  const currentTheme = localStorage.getItem(THEME_KEY) || 'light';
  const currentFont = localStorage.getItem(FONT_KEY) || 'system';
  // --- END: FIX ---

  // Now it's safe to find these elements
  populateThemeSelector(currentTheme);
  populateFontSelector(currentFont);
}

/**
 * Handles changes to the theme selection.
 * @param {Event} event - The change event from the theme select element.
 */
export function handleThemeChange(event) {
  const newTheme = /** @type {HTMLSelectElement} */ (event.target).value;
  // This function now automatically saves to localStorage
  applyTheme(newTheme);
  console.log('Theme changed to:', newTheme);
}

/**
 * Handles changes to the font selection.
 * @param {Event} event - The change event from the font select element.
 */
export function handleFontChange(event) {
  const newFont = /** @type {HTMLSelectElement} */ (event.target).value;
  // This function now automatically saves to localStorage
  applyFont(newFont);
  console.log('Font changed to:', newFont);
}