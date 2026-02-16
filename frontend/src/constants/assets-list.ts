/** @format */

const SEARCH_DEBOUNCE_IN_MS = 400;

const ASSETS_URL_PARAM_KEYS = {
	page: 'page',
	size: 'size',
	query: 'q',
	category: 'category',
	status: 'status',
} as const;

export { ASSETS_URL_PARAM_KEYS, SEARCH_DEBOUNCE_IN_MS };

