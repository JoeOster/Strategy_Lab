// public/js/utils/loadHtmlPartial.js
/**
 * Fetches an HTML partial and inserts it into a specified DOM element.
 * @param {string} url The URL of the HTML partial to fetch.
 * @param {string} targetElementId The ID of the DOM element where the partial should be inserted.
 * @returns {Promise<void>} A promise that resolves when the partial is loaded and inserted.
 */
export async function loadHtmlPartial(url, targetElementId) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load partial: ${response.statusText}`);
    }
    const html = await response.text();
    const targetElement = document.getElementById(targetElementId);
    if (targetElement) {
      targetElement.insertAdjacentHTML('afterend', html);
    } else {
      console.error(`Target element with ID "${targetElementId}" not found.`);
    }
  } catch (error) {
    console.error(`Error loading HTML partial from ${url}:`, error);
  }
}
