// public/js/utils/formatters.js

/**
 * Formats a number as a currency string (e.g., $1,234.56).
 * @param {number | null | undefined} value - The number to format.
 * @returns {string} - The formatted currency string, or an empty string if the value is null or undefined.
 */
export function formatCurrency(value) {
	if (value === null || value === undefined) {
		return "";
	}
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
	}).format(value);
}

/**
 * Truncates a description and adds a "See more" link if it exceeds a certain length.
 * @param {string | null | undefined} description - The description text.
 * @param {number} maxLength - The maximum length before truncation.
 * @returns {string} - The HTML string with truncated description and "See more" link, or the original description if not truncated.
 */
export function formatDescriptionWithReadMore(description, maxLength = 100) {
	if (!description) {
		return "";
	}

	if (description.length > maxLength) {
		const visibleText = description.substring(0, maxLength);
		const hiddenText = description.substring(maxLength);
		return `
            <p class="source-card-description">
                ${visibleText}<span class="dots">...</span><span class="more-text" style="display: none;">${hiddenText}</span>
                <span class="read-more-btn">See more</span>
            </p>
        `;
	}
	return `<p class="source-card-description">${description}</p>`;
}

/**
 * Formats a number as a percentage string (e.g., 12.34%).
 * @param {number | null | undefined} value - The number to format.
 * @returns {string} - The formatted percentage string, or an empty string if the value is null or undefined.
 */
export function formatPercentage(value) {
	if (value === null || value === undefined) {
		return "";
	}
	return `${(value * 100).toFixed(2)}%`;
}
