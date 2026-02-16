/** @format */

import type {
	ColumnFiltersState,
	PaginationState,
} from '@tanstack/react-table';
import { ApiHttpError } from '../api/assets';
import {
	type ApiFieldError,
	type Category,
	type Status,
} from '../api/types';
import { CATEGORY_VALUES, STATUS_VALUES } from '../constants/assets';
import { ASSETS_URL_PARAM_KEYS } from '../constants/assets-list';
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '../constants/pagination';
import { isEnumValue } from './enum';
import { isAllowedPageSize } from './pagination';

type AssetsErrorState = {
	description: string;
	fieldErrors: ApiFieldError[];
	title: string;
};

function getColumnFilterValue<TValue extends string>(
	filters: ColumnFiltersState,
	columnId: string,
): TValue | undefined {
	const filter = filters.find((item) => item.id === columnId);
	if (!filter || typeof filter.value !== 'string' || !filter.value.trim()) {
		return undefined;
	}
	return filter.value as TValue;
}

function readPaginationFromUrl(): PaginationState {
	const params = getUrlSearchParams();
	const pageIndex = parseIntegerParam(params.get(ASSETS_URL_PARAM_KEYS.page));
	const pageSize = parseIntegerParam(params.get(ASSETS_URL_PARAM_KEYS.size));

	return {
		pageIndex:
			pageIndex !== undefined && pageIndex >= 0
				? pageIndex
				: DEFAULT_PAGE_INDEX,
		pageSize:
			pageSize !== undefined && isAllowedPageSize(pageSize)
				? pageSize
				: DEFAULT_PAGE_SIZE,
	};
}

function readSearchQueryFromUrl(): string {
	const queryParam = getUrlSearchParams().get(ASSETS_URL_PARAM_KEYS.query);
	return queryParam?.trim() ?? '';
}

function readColumnFiltersFromUrl(): ColumnFiltersState {
	const params = getUrlSearchParams();
	const filters: ColumnFiltersState = [];

	const category = parseCategoryParam(params.get(ASSETS_URL_PARAM_KEYS.category));
	const status = parseStatusParam(params.get(ASSETS_URL_PARAM_KEYS.status));

	if (category) {
		filters.push({ id: 'category', value: category });
	}
	if (status) {
		filters.push({ id: 'status', value: status });
	}

	return filters;
}

function setOrDeleteParam(
	params: URLSearchParams,
	key: string,
	value: string | undefined,
): void {
	if (value === undefined || value.trim().length === 0) {
		params.delete(key);
		return;
	}
	params.set(key, value);
}

function resolveAssetsError(error: ApiHttpError): AssetsErrorState {
	const fieldErrors = error.details?.errors ?? [];

	if (error.status === 400) {
		return {
			title: 'Parâmetros inválidos',
			description:
				'A consulta foi rejeitada pelo servidor. Revise filtros, busca e paginação.',
			fieldErrors,
		};
	}

	if (error.status === 404) {
		return {
			title: 'Recurso não encontrado',
			description:
				'Não foi possível encontrar o recurso solicitado. Atualize a página e tente novamente.',
			fieldErrors,
		};
	}

	if (error.status === 409) {
		return {
			title: 'Conflito de dados',
			description:
				'Detectamos um conflito no servidor. Atualize a listagem antes de continuar.',
			fieldErrors,
		};
	}

	return {
		title: 'Erro ao carregar ativos',
		description:
			error.message || 'Ocorreu um erro inesperado ao consultar os ativos.',
		fieldErrors,
	};
}

function getUrlSearchParams(): URLSearchParams {
	if (typeof window === 'undefined') {
		return new URLSearchParams();
	}
	return new URLSearchParams(window.location.search);
}

function parseIntegerParam(value: string | null): number | undefined {
	if (!value || value.trim().length === 0) {
		return undefined;
	}

	const parsedValue = Number(value);
	if (!Number.isInteger(parsedValue)) {
		return undefined;
	}

	return parsedValue;
}

function parseCategoryParam(value: string | null): Category | undefined {
	return parseEnumParam(value, CATEGORY_VALUES);
}

function parseStatusParam(value: string | null): Status | undefined {
	return parseEnumParam(value, STATUS_VALUES);
}

function parseEnumParam<TValue extends string>(
	value: string | null,
	allowedValues: readonly TValue[],
): TValue | undefined {
	if (!value) {
		return undefined;
	}

	return isEnumValue(value, allowedValues) ? value : undefined;
}

export {
	getColumnFilterValue,
	readColumnFiltersFromUrl,
	readPaginationFromUrl,
	readSearchQueryFromUrl,
	resolveAssetsError,
	setOrDeleteParam,
};
export type { AssetsErrorState };
