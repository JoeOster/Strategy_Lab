// public/js/utils/logger.js

/**
 * Logs messages to the console only if IS_DEV_MODE is true.
 * @param {...any} args - Arguments to log.
 */
export function log(...args) {
	// @ts-ignore
	if (window.IS_DEV_MODE) {
		console.log(...args);
	}
}

/**
 * Logs error messages to the console only if IS_DEV_MODE is true.
 * @param {...any} args - Arguments to log.
 */
export function error(...args) {
	// @ts-ignore
	if (window.IS_DEV_MODE) {
		console.error(...args);
	}
}
