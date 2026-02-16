/** @format */

import type {
	ColumnDef,
	ColumnFiltersState,
	OnChangeFn,
	PaginationState,
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
import {
	ASSETS_TABLE_MAX_VISIBLE_PAGES,
	ASSETS_TABLE_ROW_CLASSNAME,
	ASSETS_TABLE_ROW_LAYOUT_TRANSITION,
	ASSETS_TABLE_ROW_OPACITY_TRANSITION,
} from '../../constants/assets-table';
import { PAGE_SIZE_OPTIONS } from '../../constants/pagination';
import { buildPageWindow } from '../../helpers/pagination';
import { Button } from '../ui/button';
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
import { categoryIcons } from './columns';

type DataTableProps = {
	columnFilters: ColumnFiltersState;
	columns: ColumnDef<Asset>[];
	data: Asset[];
	globalFilter: string;
	hasActiveFilters: boolean;
	onColumnFiltersChange: OnChangeFn<ColumnFiltersState>;
	onClearFilters: () => void;
	onGlobalFilterChange: OnChangeFn<string>;
	onPaginationChange: OnChangeFn<PaginationState>;
	pagination: PaginationState;
	totalElements: number;
	totalPages: number;
};

export default function DataTable({
	columnFilters,
	columns,
	data,
	globalFilter,
	hasActiveFilters,
	onColumnFiltersChange,
	onClearFilters,
	onGlobalFilterChange,
	onPaginationChange,
	pagination,
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
		},
		onGlobalFilterChange,
		onColumnFiltersChange,
		onPaginationChange,
		manualFiltering: true,
		manualPagination: true,
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
	const tableLayoutDependency = `${currentPage}-${categoryFilterValue}-${statusFilterValue}-${table.getState().globalFilter}-${visibleRows.length}`;

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
								const CategoryIcon = categoryIcons[value];

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
				className='overflow-hidden rounded-lg border bg-card max-h-[34vh] md:max-h-[64vh] 2xl:max-h-[70vh] h-full overflow-y-auto'>
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
										className='h-24 text-center text-muted-foreground'>
										<div className='flex flex-col items-center gap-2 py-2'>
											<p>
												{hasActiveFilters
													? 'Nenhum ativo encontrado para os filtros aplicados.'
													: 'Ainda não existem ativos para exibição.'}
											</p>
											{hasActiveFilters && (
												<Button
													variant='outline'
													size='sm'
													onClick={onClearFilters}>
													Limpar filtros
												</Button>
											)}
										</div>
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

			<div className='flex flex-col gap-3 pt-3 md:flex-row md:items-center md:justify-between w-full'>
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

				{totalPages > 1 && (
					<div className='overflow-x-auto'>
						<Pagination className='mx-0 md:w-max min-w-full justify-between  md:min-w-0 md:justify-end'>
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
					</div>
				)}
			</div>
		</div>
	);
}
