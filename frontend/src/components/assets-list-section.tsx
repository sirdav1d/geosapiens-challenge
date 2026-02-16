/** @format */

import type {
	ColumnFiltersState,
	OnChangeFn,
	PaginationState,
} from '@tanstack/react-table';
import { functionalUpdate } from '@tanstack/react-table';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircleIcon } from 'lucide-react';
import {
	ApiHttpError,
	assetsQueryKeys,
	fetchAssets,
	useAssetsQuery,
} from '../api/assets';
import type { ApiFieldError, Asset, Category, Status } from '../api/types';
import {
	DEFAULT_PAGE_INDEX,
	DEFAULT_PAGE_SIZE,
	isAllowedPageSize,
} from '../constants/pagination';
import { useDebouncedValue } from '../hooks/use-debounced-value';
import { createAssetColumns } from './assets-table/columns';
import { DataTable } from './assets-table/data-table';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';

const SEARCH_DEBOUNCE_IN_MS = 400;

const CATEGORY_VALUES: Category[] = [
	'COMPUTER',
	'PERIPHERAL',
	'NETWORK_EQUIPMENT',
	'SERVER_INFRA',
	'MOBILE_DEVICE',
];

const STATUS_VALUES: Status[] = [
	'IN_USE',
	'IN_STOCK',
	'MAINTENANCE',
	'RETIRED',
];

function AssetsListSection() {
	const queryClient = useQueryClient();

	const [pagination, setPagination] = useState<PaginationState>(() =>
		readPaginationFromUrl(),
	);

	const [globalFilter, setGlobalFilter] = useState(() =>
		readSearchQueryFromUrl(),
	);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(() =>
		readColumnFiltersFromUrl(),
	);

	const categoryFilter = getColumnFilterValue<Category>(
		columnFilters,
		'category',
	);
	const statusFilter = getColumnFilterValue<Status>(columnFilters, 'status');
	const immediateQueryText = globalFilter.trim();
	const debouncedQueryText = useDebouncedValue(
		immediateQueryText,
		SEARCH_DEBOUNCE_IN_MS,
	);
	const queryText =
		immediateQueryText.length === 0
			? undefined
			: debouncedQueryText || undefined;
	const hasActiveFilters =
		immediateQueryText.length > 0 ||
		categoryFilter !== undefined ||
		statusFilter !== undefined;

	useEffect(() => {
		if (typeof window === 'undefined') {
			return;
		}

		const params = new URLSearchParams(window.location.search);
		const searchQuery = immediateQueryText.trim();

		setOrDeleteParam(
			params,
			'page',
			pagination.pageIndex > DEFAULT_PAGE_INDEX
				? String(pagination.pageIndex)
				: undefined,
		);
		setOrDeleteParam(
			params,
			'size',
			pagination.pageSize !== DEFAULT_PAGE_SIZE
				? String(pagination.pageSize)
				: undefined,
		);
		setOrDeleteParam(params, 'q', searchQuery || undefined);
		setOrDeleteParam(params, 'category', categoryFilter);
		setOrDeleteParam(params, 'status', statusFilter);

		const nextSearch = params.toString();
		const currentSearch = window.location.search.replace(/^\?/, '');
		if (nextSearch === currentSearch) {
			return;
		}

		const nextUrl = `${window.location.pathname}${
			nextSearch ? `?${nextSearch}` : ''
		}${window.location.hash}`;
		window.history.replaceState(window.history.state, '', nextUrl);
	}, [
		categoryFilter,
		immediateQueryText,
		pagination.pageIndex,
		pagination.pageSize,
		statusFilter,
	]);

	const handleGlobalFilterChange: OnChangeFn<string> = (updaterOrValue) => {
		setGlobalFilter((previousValue) => {
			const nextValue = functionalUpdate(updaterOrValue, previousValue);
			setPagination((previousPagination) => ({
				...previousPagination,
				pageIndex: 0,
			}));
			return nextValue;
		});
	};

	const handleColumnFiltersChange: OnChangeFn<ColumnFiltersState> = (
		updaterOrValue,
	) => {
		setColumnFilters((previousValue) => {
			const nextValue = functionalUpdate(updaterOrValue, previousValue);
			setPagination((previousPagination) => ({
				...previousPagination,
				pageIndex: 0,
			}));
			return nextValue;
		});
	};

	const handlePaginationChange: OnChangeFn<PaginationState> = (
		updaterOrValue,
	) => {
		setPagination((previousValue) =>
			functionalUpdate(updaterOrValue, previousValue),
		);
	};

	const handleClearFilters = useCallback(() => {
		setGlobalFilter('');
		setColumnFilters([]);
		setPagination((previousPagination) => ({
			...previousPagination,
			pageIndex: 0,
		}));
	}, []);

	const { data, error, isError, isFetching, isLoading, refetch } =
		useAssetsQuery({
			page: pagination.pageIndex,
			size: pagination.pageSize,
			q: queryText,
			category: categoryFilter,
			status: statusFilter,
		});

	useEffect(() => {
		if (!data) {
			return;
		}

		const nextPage = pagination.pageIndex + 1;
		const hasNextPage = nextPage < data.totalPages;
		if (!hasNextPage) {
			return;
		}

		const nextPageParams = {
			page: nextPage,
			size: pagination.pageSize,
			q: queryText,
			category: categoryFilter,
			status: statusFilter,
		};

		void queryClient.prefetchQuery({
			queryKey: assetsQueryKeys.list(nextPageParams),
			queryFn: ({ signal }) => fetchAssets(nextPageParams, signal),
		});
	}, [
		categoryFilter,
		data,
		pagination.pageIndex,
		pagination.pageSize,
		queryClient,
		queryText,
		statusFilter,
	]);

	const handleEdit = useCallback((asset: Asset) => {
		void asset;
	}, []);

	const handleDelete = useCallback((asset: Asset) => {
		void asset;
	}, []);
	const columns = useMemo(
		() =>
			createAssetColumns({
				onDelete: handleDelete,
				onEdit: handleEdit,
			}),
		[handleDelete, handleEdit],
	);

	const errorState = isError ? resolveAssetsError(error) : undefined;

	if (isLoading && !data) {
		return <AssetsListLoadingState />;
	}

	if (isError && !data && errorState) {
		return (
			<AssetsListErrorState
				description={errorState.description}
				fieldErrors={errorState.fieldErrors}
				onRetry={() => void refetch()}
				title={errorState.title}
			/>
		);
	}

	return (
		<section className='space-y-4'>
			{isFetching && data && (
				<p className='text-sm text-muted-foreground'>Atualizando ativos...</p>
			)}

			{isError && data && errorState && (
				<Alert variant='destructive'>
					<AlertCircleIcon />
					<AlertTitle>{errorState.title}</AlertTitle>
					<AlertDescription>
						<p>{errorState.description}</p>
					</AlertDescription>
				</Alert>
			)}

			{data && (
				<div className='space-y-3'>
					<DataTable
						columns={columns}
						data={data.items}
						globalFilter={globalFilter}
						columnFilters={columnFilters}
						onGlobalFilterChange={handleGlobalFilterChange}
						onColumnFiltersChange={handleColumnFiltersChange}
						pagination={pagination}
						onPaginationChange={handlePaginationChange}
						totalElements={data.totalElements}
						totalPages={data.totalPages}
						hasActiveFilters={hasActiveFilters}
						onClearFilters={handleClearFilters}
					/>
				</div>
			)}
		</section>
	);
}

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
	const pageIndex = parseIntegerParam(params.get('page'));
	const pageSize = parseIntegerParam(params.get('size'));

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
	const queryParam = getUrlSearchParams().get('q');
	return queryParam?.trim() ?? '';
}

function readColumnFiltersFromUrl(): ColumnFiltersState {
	const params = getUrlSearchParams();
	const filters: ColumnFiltersState = [];

	const category = parseCategoryParam(params.get('category'));
	const status = parseStatusParam(params.get('status'));

	if (category) {
		filters.push({ id: 'category', value: category });
	}
	if (status) {
		filters.push({ id: 'status', value: status });
	}

	return filters;
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
	if (!value) {
		return undefined;
	}

	return CATEGORY_VALUES.find((category) => category === value);
}

function parseStatusParam(value: string | null): Status | undefined {
	if (!value) {
		return undefined;
	}

	return STATUS_VALUES.find((status) => status === value);
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

type AssetsErrorState = {
	description: string;
	fieldErrors: ApiFieldError[];
	title: string;
};

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

type AssetsListErrorStateProps = {
	description: string;
	fieldErrors: ApiFieldError[];
	onRetry: () => void;
	title: string;
};

function AssetsListErrorState({
	description,
	fieldErrors,
	onRetry,
	title,
}: AssetsListErrorStateProps) {
	return (
		<section className='space-y-4'>
			<Alert variant='destructive'>
				<AlertCircleIcon />
				<AlertTitle>{title}</AlertTitle>
				<AlertDescription>
					<p>{description}</p>
					{fieldErrors.length > 0 && (
						<ul className='list-disc pl-4'>
							{fieldErrors.slice(0, 3).map((fieldError) => (
								<li key={`${fieldError.field}-${fieldError.message}`}>
									{fieldError.field}: {fieldError.message}
								</li>
							))}
						</ul>
					)}
				</AlertDescription>
			</Alert>

			<Button
				variant='outline'
				onClick={onRetry}>
				Tentar novamente
			</Button>
		</section>
	);
}

function AssetsListLoadingState() {
	return (
		<section className='space-y-4'>
			<div className='flex flex-col gap-3 md:flex-row md:items-center'>
				<Skeleton className='h-9 w-full md:max-w-sm' />
				<div className='flex flex-col gap-2 sm:flex-row md:ml-auto'>
					<Skeleton className='h-9 w-full sm:w-[220px]' />
					<Skeleton className='h-9 w-full sm:w-[180px]' />
					<Skeleton className='h-9 w-full sm:w-[88px]' />
				</div>
			</div>
			<div className='space-y-2 rounded-lg border p-4'>
				<Skeleton className='h-8 w-full' />
				<Skeleton className='h-8 w-full' />
				<Skeleton className='h-8 w-full' />
				<Skeleton className='h-8 w-full' />
				<Skeleton className='h-8 w-full' />
			</div>
		</section>
	);
}

export default AssetsListSection;
