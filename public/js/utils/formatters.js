// public/js/utils/formatters.js

/**
 * Formats a number as a currency string (e.g., $1,234.56).
 * @param {number | null | undefined} value - The number to format.
 * @returns {string} - The formatted currency string, or an empty string if the value is null or undefined.
 */
export function formatCurrency(value) {
  if (value === null || value === undefined) {
    return '';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}
