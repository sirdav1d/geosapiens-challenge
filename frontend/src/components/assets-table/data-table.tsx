/** @format */

import type {
	ColumnDef,
	ColumnFiltersState,
	OnChangeFn,
	PaginationState,
	SortingState,
} from '@tanstack/react-table';
import {
	flexRender,
	getCoreRowModel,
	useReactTable,
} from '@tanstack/react-table';
import { LayoutGroup, motion, useReducedMotion } from 'motion/react';
import { useMemo } from 'react';
import { type Asset } from '../../api/types';
import {
	CATEGORY_LABELS,
	CATEGORY_VALUES,
	STATUS_LABELS,
	STATUS_VALUES,
} from '../../constants/assets';
import { CATEGORY_ICONS } from '../../constants/category-icons';
import {
	ASSETS_TABLE_MAX_VISIBLE_PAGES,
	ASSETS_TABLE_EMPTY_MIN_HEIGHT_CLASSNAME,
	ASSETS_TABLE_ROW_CLASSNAME,
	ASSETS_TABLE_ROW_LAYOUT_TRANSITION,
	ASSETS_TABLE_ROW_OPACITY_TRANSITION,
	ASSETS_TABLE_VIEWPORT_CLASSNAME,
} from '../../constants/assets-table';
import { PAGE_SIZE_OPTIONS } from '../../constants/pagination';
import { buildPageWindow } from '../../helpers/pagination';
import { Button } from '../ui/button';
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from '../ui/empty';
import { Input } from '../ui/input';
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from '../ui/pagination';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '../ui/select';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '../ui/table';
import { XIcon } from '../ui/x';
import { SearchIcon } from '../ui/search';

type DataTableProps = {
	columnFilters: ColumnFiltersState;
	columns: ColumnDef<Asset>[];
	data: Asset[];
	globalFilter: string;
	hasActiveFilters: boolean;
	isFetching: boolean;
	onColumnFiltersChange: OnChangeFn<ColumnFiltersState>;
	onClearFilters: () => void;
	onGlobalFilterChange: OnChangeFn<string>;
	onPaginationChange: OnChangeFn<PaginationState>;
	onSortingChange: OnChangeFn<SortingState>;
	pagination: PaginationState;
	sorting: SortingState;
	totalElements: number;
	totalPages: number;
};

export default function DataTable({
	columnFilters,
	columns,
	data,
	globalFilter,
	hasActiveFilters,
	isFetching,
	onColumnFiltersChange,
	onClearFilters,
	onGlobalFilterChange,
	onPaginationChange,
	onSortingChange,
	pagination,
	sorting,
	totalElements,
	totalPages,
}: DataTableProps) {
	const prefersReducedMotion = useReducedMotion();

	// TanStack Table expõe APIs não memoizáveis pelo React Compiler.
	// eslint-disable-next-line react-hooks/incompatible-library
	const table = useReactTable({
		data,
		columns,
		state: {
			globalFilter,
			columnFilters,
			pagination,
			sorting,
		},
		onGlobalFilterChange,
		onColumnFiltersChange,
		onPaginationChange,
		onSortingChange,
		manualFiltering: true,
		manualPagination: true,
		manualSorting: true,
		rowCount: totalElements,
		pageCount: totalPages,
		getCoreRowModel: getCoreRowModel(),
	});

	const categoryFilterValue =
		(table.getColumn('category')?.getFilterValue() as string | undefined) ??
		'ALL';
	const statusFilterValue =
		(table.getColumn('status')?.getFilterValue() as string | undefined) ??
		'ALL';
	const hasSelectedFilters =
		categoryFilterValue !== 'ALL' || statusFilterValue !== 'ALL';
	const currentPage = table.getState().pagination.pageIndex;
	const rowModel = table.getRowModel();
	const visibleRows = rowModel.rows;
	const pagesToRender = useMemo(
		() =>
			buildPageWindow(currentPage, totalPages, ASSETS_TABLE_MAX_VISIBLE_PAGES),
		[currentPage, totalPages],
	);
	const canPreviousPage = table.getCanPreviousPage();
	const canNextPage = table.getCanNextPage();
	const currentPageSize = table.getState().pagination.pageSize;
	const sortingDependency = sorting
		.map((item) => `${item.id}:${item.desc ? 'desc' : 'asc'}`)
		.join('|');
	const tableLayoutDependency = `${currentPage}-${categoryFilterValue}-${statusFilterValue}-${table.getState().globalFilter}-${sortingDependency}-${visibleRows.length}`;

	return (
		<div className='space-y-3'>
			<div className='flex flex-col gap-3 md:flex-row md:items-center'>
				<div className='w-full md:max-w-sm'>
					<Input
						placeholder='Buscar por nome ou número de série...'
						value={table.getState().globalFilter ?? ''}
						onChange={(event) => table.setGlobalFilter(event.target.value)}
					/>
				</div>

				<div className='flex flex-col gap-2 sm:flex-row md:ml-auto'>
					{hasSelectedFilters && (
						<Button
							variant='ghost'
							size='sm'
							className='h-9'
							onClick={onClearFilters}>
							<XIcon
								size={14}
								className='shrink-0 text-muted-foreground'
							/>
							Limpar
						</Button>
					)}

					<Select
						value={categoryFilterValue}
						onValueChange={(value) =>
							table
								.getColumn('category')
								?.setFilterValue(value === 'ALL' ? undefined : value)
						}>
						<SelectTrigger className='w-full sm:w-[220px]'>
							<SelectValue placeholder='Categoria' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='ALL'>Todas as categorias</SelectItem>
							{CATEGORY_VALUES.map((value) => {
								const label = CATEGORY_LABELS[value];
								const CategoryIcon = CATEGORY_ICONS[value];

								return (
									<SelectItem
										key={value}
										value={value}>
										<div className='flex items-center gap-2'>
											<CategoryIcon
												size={14}
												className='shrink-0 text-muted-foreground'
											/>
											<span>{label}</span>
										</div>
									</SelectItem>
								);
							})}
						</SelectContent>
					</Select>

					<Select
						value={statusFilterValue}
						onValueChange={(value) =>
							table
								.getColumn('status')
								?.setFilterValue(value === 'ALL' ? undefined : value)
						}>
						<SelectTrigger className='w-full sm:w-[180px]'>
							<SelectValue placeholder='Status' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='ALL'>Todos os status</SelectItem>
							{STATUS_VALUES.map((value) => (
								<SelectItem
									key={value}
									value={value}>
									{STATUS_LABELS[value]}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			<motion.div
				layoutScroll
				layoutDependency={tableLayoutDependency}
				className={`relative overflow-hidden rounded-lg border bg-card overflow-y-auto ${ASSETS_TABLE_VIEWPORT_CLASSNAME}`}>
				<div
					className={[
						'pointer-events-none absolute top-2 right-3 z-10 text-xs text-muted-foreground transition-opacity duration-150',
						isFetching ? 'opacity-100' : 'opacity-0',
					].join(' ')}>
					Atualizando ativos...
				</div>
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead key={header.id}>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<LayoutGroup id='assets-table-rows'>
						<TableBody>
							{visibleRows.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={columns.length}
										className='p-0 text-center text-muted-foreground'>
										<Empty
											className={`m-4 border ${ASSETS_TABLE_EMPTY_MIN_HEIGHT_CLASSNAME}`}>
											<EmptyHeader>
												<EmptyTitle className='flex flex-col items-center gap-2'>
													<SearchIcon />
													{hasActiveFilters
														? 'Nenhum ativo encontrado'
														: 'Sem ativos para exibição'}
												</EmptyTitle>
												<EmptyDescription>
													{hasActiveFilters
														? 'Ajuste ou limpe os filtros para visualizar outros resultados.'
														: 'Cadastre um novo ativo para começar a preencher a tabela.'}
												</EmptyDescription>
											</EmptyHeader>
											{hasActiveFilters && (
												<EmptyContent>
													<Button
														variant='outline'
														size='sm'
														onClick={onClearFilters}>
														Limpar filtros
													</Button>
												</EmptyContent>
											)}
										</Empty>
									</TableCell>
								</TableRow>
							) : (
								visibleRows.map((row) => (
									<motion.tr
										key={row.original.id}
										layout='position'
										layoutId={`asset-row-${row.original.id}`}
										initial={prefersReducedMotion ? false : { opacity: 0 }}
										animate={{ opacity: 1 }}
										exit={
											prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }
										}
										transition={
											prefersReducedMotion
												? { duration: 0 }
												: {
														layout: ASSETS_TABLE_ROW_LAYOUT_TRANSITION,
														opacity: ASSETS_TABLE_ROW_OPACITY_TRANSITION,
													}
										}
										data-slot='table-row'
										className={ASSETS_TABLE_ROW_CLASSNAME}>
										{row.getVisibleCells().map((cell) => (
											<TableCell key={cell.id}>
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext(),
												)}
											</TableCell>
										))}
									</motion.tr>
								))
							)}
						</TableBody>
					</LayoutGroup>
				</Table>
			</motion.div>

			<div className='flex min-h-12 w-full flex-col gap-3 pt-3 md:flex-row md:items-center md:justify-between'>
				<div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3'>
					<div className='flex w-full items-center gap-2'>
						<span className='text-sm text-muted-foreground'>
							Itens por página
						</span>
						<Select
							value={String(currentPageSize)}
							onValueChange={(value) => {
								const nextPageSize = Number(value);
								if (Number.isNaN(nextPageSize)) {
									return;
								}

								table.setPagination((previousPagination) => ({
									...previousPagination,
									pageIndex: 0,
									pageSize: nextPageSize,
								}));
							}}>
							<SelectTrigger className='h-8 w-20'>
								<SelectValue />
							</SelectTrigger>
							<SelectContent align='end'>
								{PAGE_SIZE_OPTIONS.map((pageSizeOption) => (
									<SelectItem
										key={pageSizeOption}
										value={String(pageSizeOption)}>
										{pageSizeOption}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<p className='text-sm text-nowrap text-muted-foreground'>
						Página {currentPage + 1} de {Math.max(totalPages, 1)} ·{' '}
						{totalElements} itens
					</p>
				</div>

				<div className='min-h-9 overflow-x-auto'>
					{totalPages > 1 ? (
						<Pagination className='mx-0 min-w-full justify-between md:w-max md:min-w-0 md:justify-end'>
							<PaginationContent>
								<PaginationItem>
									<PaginationPrevious
										href='#'
										className={
											!canPreviousPage
												? 'pointer-events-none opacity-50'
												: undefined
										}
										onClick={(event) => {
											event.preventDefault();
											if (canPreviousPage) {
												table.previousPage();
											}
										}}
									/>
								</PaginationItem>

								{pagesToRender.map((pageItem, index) => (
									<PaginationItem key={`${pageItem}-${index}`}>
										{pageItem === 'ellipsis' ? (
											<PaginationEllipsis />
										) : (
											<PaginationLink
												href='#'
												isActive={pageItem === currentPage}
												onClick={(event) => {
													event.preventDefault();
													table.setPageIndex(pageItem);
												}}>
												{pageItem + 1}
											</PaginationLink>
										)}
									</PaginationItem>
								))}

								<PaginationItem>
									<PaginationNext
										href='#'
										className={
											!canNextPage
												? 'pointer-events-none opacity-50'
												: undefined
										}
										onClick={(event) => {
											event.preventDefault();
											if (canNextPage) {
												table.nextPage();
											}
										}}
									/>
								</PaginationItem>
							</PaginationContent>
						</Pagination>
					) : (
						<div
							aria-hidden='true'
							className='h-9'
						/>
					)}
				</div>
			</div>
		</div>
	);
}
