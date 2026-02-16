/** @format */

import type { ColumnDef } from '@tanstack/react-table';
import type { ComponentType } from 'react';
import {
	CATEGORY_LABELS,
	STATUS_LABELS,
} from '../../constants/assets';
import {
	type Asset,
	type Category,
	type Status,
} from '../../api/types';
import { formatLocalDate } from '../../helpers/date';
import { Badge } from '../ui/badge';
import { CpuIcon } from '../ui/cpu';
import { KeyboardIcon } from '../ui/keyboard';
import { LaptopMinimalCheckIcon } from '../ui/laptop-minimal-check';
import { SmartphoneNfcIcon } from '../ui/smartphone-nfc';
import { WaypointsIcon } from '../ui/waypoints';
import AssetActionsMenu from './asset-actions-menu';

export type AssetTableActions = {
	onDelete: (asset: Asset) => void;
	onEdit: (asset: Asset) => void;
};

type StatusBadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive';

const statusBadgeVariants: Record<Status, StatusBadgeVariant> = {
	IN_USE: 'default',
	IN_STOCK: 'secondary',
	MAINTENANCE: 'outline',
	RETIRED: 'destructive',
};

type CategoryIconProps = {
	className?: string;
	size?: number;
};

export const categoryIcons: Record<
	Category,
	ComponentType<CategoryIconProps>
> = {
	COMPUTER: LaptopMinimalCheckIcon,
	PERIPHERAL: KeyboardIcon,
	NETWORK_EQUIPMENT: WaypointsIcon,
	SERVER_INFRA: CpuIcon,
	MOBILE_DEVICE: SmartphoneNfcIcon,
};

export function createAssetColumns({
	onDelete,
	onEdit,
}: AssetTableActions): ColumnDef<Asset>[] {
	return [
		{
			accessorKey: 'name',
			header: 'Nome',
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
				const CategoryIcon = categoryIcons[category];

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
			header: 'Aquisição',
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
