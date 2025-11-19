// public/js/utils/sortUtils.js

/**
 * Sorts an array of objects based on a key and direction.
 * @param {Array<{[key: string]: any}>} data - The array of objects to sort.
 * @param {string} key - The key to sort by.
 * @param {string} direction - 'asc' for ascending, 'desc' for descending.
 * @returns {Array<{[key: string]: any}>} The sorted array.
 */
export function sortData(data, key, direction) {
	if (!data || data.length === 0 || !key) {
		return data;
	}

	const sortedData = [...data].sort((a, b) => {
		const aValue = a[key];
		const bValue = b[key];

		if (typeof aValue === "string" && typeof bValue === "string") {
			return direction === "asc"
				? aValue.localeCompare(bValue)
				: bValue.localeCompare(aValue);
		}
		// Handle numbers, nulls, and undefined values
		if (aValue === null || aValue === undefined)
			return direction === "asc" ? -1 : 1;
		if (bValue === null || bValue === undefined)
			return direction === "asc" ? 1 : -1;
		return direction === "asc" ? aValue - bValue : bValue - aValue;
	});

	return sortedData;
}

/**
 * Makes the headers of a table sortable.
 * Looks for `<th>` elements with the class `sortable` and a `data-sort-key` attribute.
 * @param {HTMLTableElement} table - The table element to make sortable.
 */
export function makeTableSortable(table) {
    const headers = table.querySelectorAll('th.sortable');
    headers.forEach(header => {
        header.addEventListener('click', () => {
            const tableBody = table.querySelector('tbody');
            if (!tableBody) return;
            const rows = Array.from(tableBody.querySelectorAll('tr'));
            const sortDirection = header.dataset.sortDirection === 'asc' ? 'desc' : 'asc';

            // Reset sort direction for other headers
            headers.forEach(h => {
                if (h !== header) {
                    h.removeAttribute('data-sort-direction');
                }
            });
            header.dataset.sortDirection = sortDirection;

            const headerIndex = Array.from(header.parentNode.children).indexOf(header);

            rows.sort((a, b) => {
                const aText = a.children[headerIndex]?.textContent.trim() || '';
                const bText = b.children[headerIndex]?.textContent.trim() || '';

                // Attempt to parse numbers, removing currency symbols, commas, and percentages
                const aNum = parseFloat(aText.replace(/[$%,]/g, ''));
                const bNum = parseFloat(bText.replace(/[$%,]/g, ''));

                const aValue = !isNaN(aNum) ? aNum : aText.toLowerCase();
                const bValue = !isNaN(bNum) ? bNum : bText.toLowerCase();

                if (aValue < bValue) {
                    return sortDirection === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortDirection === 'asc' ? 1 : -1;
                }
                return 0;
            });

            rows.forEach(row => tableBody.appendChild(row));
        });
    });
}
