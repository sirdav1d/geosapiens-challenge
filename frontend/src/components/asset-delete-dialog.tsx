/** @format */

import { ApiHttpError } from '../api/assets';
import type { Asset } from '../api/types';
import { useDeleteAssetMutation } from '../hooks/use-assets';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from './ui/dialog';

type AssetDeleteDialogProps = {
	asset: Asset | null;
	onOpenChange: (open: boolean) => void;
	open: boolean;
};

function resolveDeleteErrorMessage(error: unknown): string {
	if (!(error instanceof ApiHttpError)) {
		return 'Ocorreu um erro inesperado ao excluir o ativo. Tente novamente.';
	}

	if (error.status === 404) {
		return 'Este ativo não foi encontrado. Atualize a listagem e tente novamente.';
	}

	if (error.status === 409) {
		return 'Não foi possível excluir o ativo devido a um conflito no servidor.';
	}

	return (
		error.details?.message ||
		error.message ||
		'Ocorreu um erro inesperado ao excluir o ativo.'
	);
}

export default function AssetDeleteDialog({
	asset,
	onOpenChange,
	open,
}: AssetDeleteDialogProps) {
	const deleteAssetMutation = useDeleteAssetMutation();
	const isDeleting = deleteAssetMutation.isPending;
	const deleteErrorMessage = deleteAssetMutation.isError
		? resolveDeleteErrorMessage(deleteAssetMutation.error)
		: null;

	const handleOpenChange = (nextOpen: boolean) => {
		if (!nextOpen && isDeleting) {
			return;
		}

		if (!nextOpen) {
			deleteAssetMutation.reset();
		}

		onOpenChange(nextOpen);
	};

	const handleConfirmDelete = async () => {
		if (!asset) {
			return;
		}

		try {
			await deleteAssetMutation.mutateAsync(asset.id);
			handleOpenChange(false);
		} catch {
			// O erro é tratado no estado da mutation para exibição no modal.
		}
	};

	if (!asset) {
		return null;
	}

	return (
		<Dialog
			open={open}
			onOpenChange={handleOpenChange}>
			<DialogContent className='sm:max-w-md'>
				<DialogHeader>
					<DialogTitle>Confirmar exclusão</DialogTitle>
					<DialogDescription>
						Você está prestes a excluir o ativo <strong>{asset.name}</strong>{' '}
						(<strong>{asset.serialNumber}</strong>). Esta ação não pode ser
						desfeita.
					</DialogDescription>
				</DialogHeader>

				{deleteErrorMessage && (
					<Alert variant='destructive'>
						<AlertTitle>Falha ao excluir ativo</AlertTitle>
						<AlertDescription>{deleteErrorMessage}</AlertDescription>
					</Alert>
				)}

				<DialogFooter>
					<Button
						type='button'
						variant='outline'
						disabled={isDeleting}
						onClick={() => handleOpenChange(false)}>
						Cancelar
					</Button>
					<Button
						type='button'
						variant='destructive'
						disabled={isDeleting}
						onClick={() => void handleConfirmDelete()}>
						{isDeleting ? 'Excluindo...' : 'Excluir ativo'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

