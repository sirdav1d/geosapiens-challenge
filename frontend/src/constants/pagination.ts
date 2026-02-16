/** @format */

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
const DEFAULT_PAGE_INDEX = 0;
const DEFAULT_PAGE_SIZE = PAGE_SIZE_OPTIONS[0];

type AllowedPageSize = (typeof PAGE_SIZE_OPTIONS)[number];

function isAllowedPageSize(value: number): value is AllowedPageSize {
	return PAGE_SIZE_OPTIONS.includes(value as AllowedPageSize);
}

export {
	DEFAULT_PAGE_INDEX,
	DEFAULT_PAGE_SIZE,
	isAllowedPageSize,
	PAGE_SIZE_OPTIONS,
};

