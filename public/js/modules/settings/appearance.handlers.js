// public/js/modules/settings/appearance.handlers.js

const THEME_STORAGE_KEY = 'strategyLabTheme';
const FONT_STORAGE_KEY = 'strategyLabFont';

/**
 * Applies the given theme to the document body.
 * @param {string} themeName - The name of the theme to apply.
 */
function applyTheme(themeName) {
  document.body.setAttribute('data-theme', themeName);
}

/**
 * Applies the given font to the document body.
 * @param {string} fontName - The name of the font to apply.
 */
function applyFont(fontName) {
  document.body.style.setProperty('--body-font', `var(--font-${fontName})`);
}

function populateThemeSelector(currentTheme) {
  const themeSelector = document.getElementById('theme-selector');
  if (!themeSelector) {
    console.error('Theme selector element not found.');
    return;
  }

  // Clear existing options
  themeSelector.innerHTML = '';

  const themes = ['light', 'dark', 'sepia', 'contrast']; // These should ideally come from a more centralized config

  for (const theme of themes) {
    const option = document.createElement('option');
    option.value = theme;
    option.textContent = theme.charAt(0).toUpperCase() + theme.slice(1); // Capitalize first letter
    if (theme === currentTheme) {
      option.selected = true;
    }
    themeSelector.appendChild(option);
  }
}

function populateFontSelector(currentFont) {
  const fontSelector = document.getElementById('font-selector');
  if (!fontSelector) {
    console.error('Font selector element not found.');
    return;
  }

  // Clear existing options
  fontSelector.innerHTML = '';

  const fonts = ['system', 'sans-serif', 'serif', 'monospace', 'dancing-script']; // These should ideally come from a more centralized config

  for (const font of fonts) {
    const option = document.createElement('option');
    option.value = font;
    option.textContent = font.charAt(0).toUpperCase() + font.slice(1); // Capitalize first letter
    if (font === currentFont) {
      option.selected = true;
    }
    fontSelector.appendChild(option);
  }
}

/**
 * Loads user preferences (theme and font) from local storage and applies them.
 */
export function loadAppearanceSettings() {
  console.log('loadAppearanceSettings called');
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  const savedFont = localStorage.getItem(FONT_STORAGE_KEY);

  let currentTheme = 'light'; // Default theme
  if (savedTheme) {
    currentTheme = savedTheme;
  }
  applyTheme(currentTheme);
  populateThemeSelector(currentTheme); // Call here

  let currentFont = 'system'; // Default font
  if (savedFont) {
    currentFont = savedFont;
  }
  applyFont(currentFont);
  populateFontSelector(currentFont);
}

/**
 * Handles changes to the theme selection.
 * @param {Event} event - The change event from the theme select element.
 */
export function handleThemeChange(event) {
  const newTheme = event.target.value;
  applyTheme(newTheme);
  localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  console.log('Theme changed to:', newTheme);
}

/**
 * Handles changes to the font selection.
 * @param {Event} event - The change event from the font select element.
 */
export function handleFontChange(event) {
  const newFont = event.target.value;
  applyFont(newFont);
  localStorage.setItem(FONT_STORAGE_KEY, newFont);
  console.log('Font changed to:', newFont);
}
