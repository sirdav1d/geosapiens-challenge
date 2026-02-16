/** @format */

import { PAGE_SIZE_OPTIONS } from '../constants/pagination';

type AllowedPageSize = (typeof PAGE_SIZE_OPTIONS)[number];
type PageWindowItem = number | 'ellipsis';

function isAllowedPageSize(value: number): value is AllowedPageSize {
	return PAGE_SIZE_OPTIONS.includes(value as AllowedPageSize);
}

function buildPageWindow(
	currentPage: number,
	totalPages: number,
	maxVisiblePages: number,
): PageWindowItem[] {
	if (totalPages <= 0) {
		return [];
	}

	if (totalPages <= maxVisiblePages) {
		return Array.from({ length: totalPages }, (_, index) => index);
	}

	const half = Math.floor(maxVisiblePages / 2);
	let start = Math.max(0, currentPage - half);
	const end = Math.min(totalPages - 1, start + maxVisiblePages - 1);

	if (end - start + 1 < maxVisiblePages) {
		start = Math.max(0, end - maxVisiblePages + 1);
	}

	const pages: PageWindowItem[] = [];

	if (start > 0) {
		pages.push(0);
		if (start > 1) {
			pages.push('ellipsis');
		}
	}

	for (let pageIndex = start; pageIndex <= end; pageIndex += 1) {
		pages.push(pageIndex);
	}

	if (end < totalPages - 1) {
		if (end < totalPages - 2) {
			pages.push('ellipsis');
		}
		pages.push(totalPages - 1);
	}

	return pages;
}

export { buildPageWindow, isAllowedPageSize };
export type { AllowedPageSize, PageWindowItem };
