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

/**
 * Loads user preferences (theme and font) from local storage and applies them.
 */
export function loadAppearanceSettings() {
  console.log('loadAppearanceSettings called');
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  const savedFont = localStorage.getItem(FONT_STORAGE_KEY);

  if (savedTheme) {
    applyTheme(savedTheme);
  } else {
    applyTheme('light'); // Default theme
  }

  if (savedFont) {
    applyFont(savedFont);
  } else {
    applyFont('system'); // Default font
  }
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
