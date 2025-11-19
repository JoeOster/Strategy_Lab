// public/js/utils/sortUtils.js

/**
 * Sorts an array of objects based on a key and direction.
 * @param {Array<Object>} data - The array of objects to sort.
 * @param {string} key - The key to sort by.
 * @param {string} direction - 'asc' for ascending, 'desc' for descending.
 * @returns {Array<Object>} The sorted array.
 */
export function sortData(data, key, direction) {
  if (!data || data.length === 0 || !key) {
    return data;
  }

  const sortedData = [...data].sort((a, b) => {
    const aValue = a[key];
    const bValue = b[key];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    } else {
      // Handle numbers, nulls, and undefined values
      if (aValue === null || aValue === undefined) return direction === 'asc' ? -1 : 1;
      if (bValue === null || bValue === undefined) return direction === 'asc' ? 1 : -1;
      return direction === 'asc' ? aValue - bValue : bValue - aValue;
    }
  });

  return sortedData;
}
