/** @format */

import type {
	ColumnFiltersState,
	OnChangeFn,
	PaginationState,
} from '@tanstack/react-table';
import { functionalUpdate } from '@tanstack/react-table';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AlertCircleIcon } from 'lucide-react';
import {
	assetsQueryKeys,
	fetchAssets,
} from '../api/assets';
import {
	type ApiFieldError,
	type Asset,
	type Category,
	type Status,
} from '../api/types';
import {
	ASSETS_URL_PARAM_KEYS,
	SEARCH_DEBOUNCE_IN_MS,
} from '../constants/assets-list';
import {
	DEFAULT_PAGE_INDEX,
	DEFAULT_PAGE_SIZE,
} from '../constants/pagination';
import {
	getColumnFilterValue,
	readColumnFiltersFromUrl,
	readPaginationFromUrl,
	readSearchQueryFromUrl,
	resolveAssetsError,
	setOrDeleteParam,
} from '../helpers/assets-list';
import { useDebouncedValue } from '../hooks/use-debounced-value';
import { useAssetsQuery } from '../hooks/use-assets';
import { AssetCreateSheet } from './asset-create-sheet';
import { createAssetColumns } from './assets-table/columns';
import { DataTable } from './assets-table/data-table';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';

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
			ASSETS_URL_PARAM_KEYS.page,
			pagination.pageIndex > DEFAULT_PAGE_INDEX
				? String(pagination.pageIndex)
				: undefined,
		);
		setOrDeleteParam(
			params,
			ASSETS_URL_PARAM_KEYS.size,
			pagination.pageSize !== DEFAULT_PAGE_SIZE
				? String(pagination.pageSize)
				: undefined,
		);
		setOrDeleteParam(params, ASSETS_URL_PARAM_KEYS.query, searchQuery || undefined);
		setOrDeleteParam(params, ASSETS_URL_PARAM_KEYS.category, categoryFilter);
		setOrDeleteParam(params, ASSETS_URL_PARAM_KEYS.status, statusFilter);

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

	let content: ReactNode;

	if (isLoading && !data) {
		content = <AssetsListLoadingState />;
	} else if (isError && !data && errorState) {
		content = (
			<AssetsListErrorState
				description={errorState.description}
				fieldErrors={errorState.fieldErrors}
				onRetry={() => void refetch()}
				title={errorState.title}
			/>
		);
	} else {
		content = (
			<>
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
			</>
		);
	}

	return (
		<section className='space-y-4'>
			<div className='flex justify-end'>
				<AssetCreateSheet />
			</div>
			{content}
		</section>
	);
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
