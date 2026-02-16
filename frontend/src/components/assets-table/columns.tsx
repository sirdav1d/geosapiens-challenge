/** @format */

import type { ColumnDef } from '@tanstack/react-table';
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from 'lucide-react';
import {
	CATEGORY_LABELS,
	STATUS_LABELS,
} from '../../constants/assets';
import { CATEGORY_ICONS } from '../../constants/category-icons';
import {
	type Asset,
	type Status,
} from '../../api/types';
import { formatLocalDate } from '../../helpers/date';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import AssetActionsMenu from './asset-actions-menu';

export type AssetTableActions = {
	onDelete: (asset: Asset) => void;
	onEdit: (asset: Asset) => void;
};

type StatusBadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive';

type SortDirection = false | 'asc' | 'desc';

const statusBadgeVariants: Record<Status, StatusBadgeVariant> = {
	IN_USE: 'default',
	IN_STOCK: 'secondary',
	MAINTENANCE: 'outline',
	RETIRED: 'destructive',
};

export function createAssetColumns({
	onDelete,
	onEdit,
}: AssetTableActions): ColumnDef<Asset>[] {
	return [
		{
			accessorKey: 'name',
			header: ({ column }) =>
				renderSortableHeaderButton({
					columnLabel: 'Nome',
					onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
					sortDirection: column.getIsSorted(),
				}),
			cell: ({ row }) => (
				<span className='font-medium'>{row.original.name}</span>
			),
		},
		{
			accessorKey: 'serialNumber',
			header: 'Número de série',
		},
		{
			accessorKey: 'category',
			header: 'Categoria',
			cell: ({ row }) => {
				const category = row.original.category;
				const CategoryIcon = CATEGORY_ICONS[category];

				return (
					<div className='inline-flex items-center gap-2'>
						<CategoryIcon
							size={16}
							className='shrink-0 text-muted-foreground'
						/>
						<span>{CATEGORY_LABELS[category]}</span>
					</div>
				);
			},
		},
		{
			accessorKey: 'status',
			header: 'Status',
			cell: ({ row }) => {
				const status = row.original.status;
				return (
					<Badge variant={statusBadgeVariants[status]}>
						{STATUS_LABELS[status]}
					</Badge>
				);
			},
		},
		{
			accessorKey: 'acquisitionDate',
			header: ({ column }) =>
				renderSortableHeaderButton({
					columnLabel: 'Aquisição',
					onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
					sortDirection: column.getIsSorted(),
				}),
			cell: ({ row }) => formatLocalDate(row.original.acquisitionDate),
		},
		{
			id: 'actions',
			header: () => <div className='text-center'>Ações</div>,
			cell: ({ row }) => (
				<div className='flex justify-center'>
					<AssetActionsMenu
						asset={row.original}
						onDelete={onDelete}
						onEdit={onEdit}
					/>
				</div>
			),
		},
	];
}

type SortableHeaderButtonProps = {
	columnLabel: string;
	onClick: () => void;
	sortDirection: SortDirection;
};

function renderSortableHeaderButton({
	columnLabel,
	onClick,
	sortDirection,
}: SortableHeaderButtonProps) {
	return (
		<Button
			type='button'
			variant='ghost'
			size='sm'
			className='-ml-3 h-8'
			onClick={onClick}>
			{columnLabel}
			{sortDirection === 'asc' && <ArrowUpIcon className='size-4' />}
			{sortDirection === 'desc' && <ArrowDownIcon className='size-4' />}
			{sortDirection === false && (
				<ArrowUpDownIcon className='size-4 text-muted-foreground' />
			)}
		</Button>
	);
}
