/** @format */

import type { ColumnDef } from '@tanstack/react-table';
import type { ComponentType } from 'react';
import type { Asset, Category, Status } from '../../api/types';
import { Badge } from '../ui/badge';
import { CpuIcon } from '../ui/cpu';
import { KeyboardIcon } from '../ui/keyboard';
import { LaptopMinimalCheckIcon } from '../ui/laptop-minimal-check';
import { SmartphoneNfcIcon } from '../ui/smartphone-nfc';
import { WaypointsIcon } from '../ui/waypoints';
import { AssetActionsMenu } from './asset-actions-menu';

export type AssetTableActions = {
	onDelete: (asset: Asset) => void;
	onEdit: (asset: Asset) => void;
};

export const categoryLabels: Record<Category, string> = {
	COMPUTER: 'Computador',
	PERIPHERAL: 'Periférico',
	NETWORK_EQUIPMENT: 'Equipamento de rede',
	SERVER_INFRA: 'Infra de servidor',
	MOBILE_DEVICE: 'Dispositivo móvel',
};

export const statusLabels: Record<Status, string> = {
	IN_USE: 'Em uso',
	IN_STOCK: 'Em estoque',
	MAINTENANCE: 'Manutenção',
	RETIRED: 'Descartado',
};

type StatusBadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive';

const statusBadgeVariants: Record<Status, StatusBadgeVariant> = {
	IN_USE: 'default',
	IN_STOCK: 'secondary',
	MAINTENANCE: 'outline',
	RETIRED: 'destructive',
};

const dateFormatter = new Intl.DateTimeFormat('pt-BR');

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
						<span>{categoryLabels[category]}</span>
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
						{statusLabels[status]}
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

function formatLocalDate(value: string): string {
	const date = new Date(`${value}T00:00:00`);
	if (Number.isNaN(date.getTime())) {
		return value;
	}
	return dateFormatter.format(date);
}
