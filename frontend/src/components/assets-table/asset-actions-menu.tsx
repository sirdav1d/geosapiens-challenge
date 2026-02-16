/** @format */

import { MoreHorizontalIcon } from 'lucide-react';
import { useRef } from 'react';
import type { Asset } from '../../api/types';
import { Button } from '../ui/button';
import { DeleteIcon, type DeleteIconHandle } from '../ui/delete';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { SquarePenIcon, type SquarePenIconHandle } from '../ui/square-pen';

type AssetActionsMenuProps = {
	asset: Asset;
	onDelete: (asset: Asset) => void;
	onEdit: (asset: Asset) => void;
};

export default function AssetActionsMenu({
	asset,
	onDelete,
	onEdit,
}: AssetActionsMenuProps) {
	const editIconRef = useRef<SquarePenIconHandle>(null);
	const deleteIconRef = useRef<DeleteIconHandle>(null);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant='outline'
					size='icon'
					className='h-8 w-8'
					aria-label='Abrir ações do ativo'>
					<MoreHorizontalIcon className='size-4' />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align='end'
				className='w-36'>
				<DropdownMenuItem
					className='text-foreground'
					onMouseEnter={() => editIconRef.current?.startAnimation()}
					onMouseLeave={() => editIconRef.current?.stopAnimation()}
					onClick={() => onEdit(asset)}>
					<SquarePenIcon
						ref={editIconRef}
						size={16}
						className='size-4 shrink-0 text-foreground!'
					/>
					<span>Editar</span>
				</DropdownMenuItem>
				<DropdownMenuItem
					variant='destructive'
					className='group'
					onMouseEnter={() => deleteIconRef.current?.startAnimation()}
					onMouseLeave={() => deleteIconRef.current?.stopAnimation()}
					onClick={() => onDelete(asset)}>
					<DeleteIcon
						ref={deleteIconRef}
						size={16}
						className='size-4 shrink-0 text-destructive!'
					/>
					<span>Excluir</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
