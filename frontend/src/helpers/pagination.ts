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
	if (totalPages <= 0 || maxVisiblePages <= 0) {
		return [];
	}

	if (totalPages <= maxVisiblePages) {
		return Array.from({ length: totalPages }, (_, index) => index);
	}

	const clampedCurrentPage = Math.min(Math.max(currentPage, 0), totalPages - 1);
	const lastPage = totalPages - 1;

	if (maxVisiblePages === 1) {
		return [clampedCurrentPage];
	}

	let numericPages: number[];
	if (maxVisiblePages === 2) {
		numericPages = [0, lastPage];
	} else {
		const middleSlots = maxVisiblePages - 2;
		const nearStartBoundary = middleSlots;
		const nearEndBoundary = totalPages - middleSlots - 1;

		if (clampedCurrentPage <= nearStartBoundary) {
			numericPages = [
				...Array.from({ length: middleSlots + 1 }, (_, index) => index),
				lastPage,
			];
		} else if (clampedCurrentPage >= nearEndBoundary) {
			const start = Math.max(1, lastPage - middleSlots);
			numericPages = [
				0,
				...Array.from(
					{ length: lastPage - start + 1 },
					(_, index) => start + index,
				),
			];
		} else {
			const start = clampedCurrentPage - Math.floor(middleSlots / 2);
			numericPages = [
				0,
				...Array.from({ length: middleSlots }, (_, index) => start + index),
				lastPage,
			];
		}
	}

	const dedupedSortedPages = [...new Set(numericPages)].sort((a, b) => a - b);
	const pages: PageWindowItem[] = [];

	for (let index = 0; index < dedupedSortedPages.length; index += 1) {
		const page = dedupedSortedPages[index];
		const nextPage = dedupedSortedPages[index + 1];
		pages.push(page);
		if (nextPage !== undefined && nextPage - page > 1) {
			pages.push('ellipsis');
		}
	}

	return pages;
}

export { buildPageWindow, isAllowedPageSize };
export type { AllowedPageSize, PageWindowItem };
