/** @format */

import { zodResolver } from '@hookform/resolvers/zod';
import { PlusIcon } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { useCreateAssetMutation } from '../hooks/use-assets';
import {
	type AssetUpsertRequest,
	type Category,
	type Status,
} from '../api/types';
import {
	CATEGORY_LABELS,
	CATEGORY_VALUES,
	STATUS_LABELS,
	STATUS_VALUES,
} from '../constants/assets';
import { ASSET_CREATE_FIELDS } from '../constants/asset-form';
import { getTodayDateInputValue, isValidDateInput } from '../helpers/date';
import { isEnumValue } from '../helpers/enum';
import { handleApiFormError } from '../helpers/form-errors';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from './ui/select';
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from './ui/sheet';

const assetCreateSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, 'Nome é obrigatório.'),
	serialNumber: z
		.string()
		.trim()
		.min(1, 'Número de série é obrigatório.'),
	category: z
		.string()
		.min(1, 'Categoria é obrigatória.')
		.refine(
			(value): value is Category => isEnumValue(value, CATEGORY_VALUES),
			'Categoria inválida.',
		)
		.transform((value) => value as Category),
	status: z
		.string()
		.min(1, 'Status é obrigatório.')
		.refine(
			(value): value is Status => isEnumValue(value, STATUS_VALUES),
			'Status inválido.',
		)
		.transform((value) => value as Status),
	acquisitionDate: z
		.string()
		.min(1, 'Data de aquisição é obrigatória.')
		.refine((value) => isValidDateInput(value), 'Data de aquisição inválida.')
		.refine(
			(value) => value <= getTodayDateInputValue(),
			'A data de aquisição não pode ser futura.',
		),
});

type AssetCreateFormInput = z.input<typeof assetCreateSchema>;
type AssetCreateFormOutput = z.output<typeof assetCreateSchema>;
type AssetCreateField = keyof AssetCreateFormInput;
const assetCreateFormFields = ASSET_CREATE_FIELDS as readonly AssetCreateField[];

function AssetCreateSheet() {
	const [open, setOpen] = useState(false);
	const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null);
	const createAssetMutation = useCreateAssetMutation();
	const isSubmitting = createAssetMutation.isPending;
	const maxDate = useMemo(() => getTodayDateInputValue(), []);

	const form = useForm<AssetCreateFormInput, unknown, AssetCreateFormOutput>({
		resolver: zodResolver(assetCreateSchema),
		defaultValues: {
			name: '',
			serialNumber: '',
			category: '',
			status: '',
			acquisitionDate: '',
		},
	});

	const handleOpenChange = useCallback(
		(nextOpen: boolean) => {
			if (!nextOpen && isSubmitting) {
				return;
			}

			if (!nextOpen) {
				form.reset();
				setFormErrorMessage(null);
			}

			setOpen(nextOpen);
		},
		[form, isSubmitting],
	);

	const handleSubmit = useCallback(
		async (values: AssetCreateFormOutput) => {
			setFormErrorMessage(null);

			try {
				await createAssetMutation.mutateAsync(values as AssetUpsertRequest);
				handleOpenChange(false);
			} catch (error) {
				handleApiFormError<AssetCreateFormInput>(error, {
					allowedFields: assetCreateFormFields,
					conflict: {
						field: 'serialNumber',
						message: 'Já existe um ativo com este número de série.',
					},
					setFieldError: form.setError,
					setFormErrorMessage,
					unexpectedMessage:
						'Ocorreu um erro inesperado ao criar o ativo. Tente novamente.',
				});
			}
		},
		[createAssetMutation, form.setError, handleOpenChange],
	);

	return (
		<Sheet
			open={open}
			onOpenChange={handleOpenChange}>
			<SheetTrigger asChild>
				<Button className='gap-2'>
					<PlusIcon className='size-4' />
					Novo ativo
				</Button>
			</SheetTrigger>
			<SheetContent
				side='right'
				className='overflow-y-auto sm:max-w-md'>
				<SheetHeader>
					<SheetTitle>Novo ativo</SheetTitle>
					<SheetDescription>
						Preencha os campos para cadastrar um novo ativo no inventário.
					</SheetDescription>
				</SheetHeader>

				<form
					id='asset-create-form'
					onSubmit={form.handleSubmit(handleSubmit)}
					className='space-y-4 px-4'>
					<div className='space-y-2'>
						<label
							htmlFor='asset-name'
							className='text-sm font-medium'>
							Nome
						</label>
						<Input
							id='asset-name'
							placeholder='Ex.: Notebook Dell Latitude'
							aria-invalid={Boolean(form.formState.errors.name)}
							disabled={isSubmitting}
							{...form.register('name')}
						/>
						{form.formState.errors.name?.message && (
							<p className='text-sm text-destructive'>
								{form.formState.errors.name.message}
							</p>
						)}
					</div>

					<div className='space-y-2'>
						<label
							htmlFor='asset-serial-number'
							className='text-sm font-medium'>
							Número de série
						</label>
						<Input
							id='asset-serial-number'
							placeholder='Ex.: SN-000201'
							aria-invalid={Boolean(form.formState.errors.serialNumber)}
							disabled={isSubmitting}
							{...form.register('serialNumber')}
						/>
						{form.formState.errors.serialNumber?.message && (
							<p className='text-sm text-destructive'>
								{form.formState.errors.serialNumber.message}
							</p>
						)}
					</div>

					<Controller
						control={form.control}
						name='category'
						render={({ field, fieldState }) => (
							<div className='space-y-2'>
								<label
									htmlFor='asset-category'
									className='text-sm font-medium'>
									Categoria
								</label>
								<Select
									value={field.value || undefined}
									onValueChange={field.onChange}
									disabled={isSubmitting}>
									<SelectTrigger
										id='asset-category'
										aria-invalid={fieldState.invalid}>
										<SelectValue placeholder='Selecione uma categoria' />
									</SelectTrigger>
									<SelectContent>
										{CATEGORY_VALUES.map((category) => (
											<SelectItem
												key={category}
												value={category}>
												{CATEGORY_LABELS[category]}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{fieldState.error?.message && (
									<p className='text-sm text-destructive'>
										{fieldState.error.message}
									</p>
								)}
							</div>
						)}
					/>

					<Controller
						control={form.control}
						name='status'
						render={({ field, fieldState }) => (
							<div className='space-y-2'>
								<label
									htmlFor='asset-status'
									className='text-sm font-medium'>
									Status
								</label>
								<Select
									value={field.value || undefined}
									onValueChange={field.onChange}
									disabled={isSubmitting}>
									<SelectTrigger
										id='asset-status'
										aria-invalid={fieldState.invalid}>
										<SelectValue placeholder='Selecione um status' />
									</SelectTrigger>
									<SelectContent>
										{STATUS_VALUES.map((status) => (
											<SelectItem
												key={status}
												value={status}>
												{STATUS_LABELS[status]}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{fieldState.error?.message && (
									<p className='text-sm text-destructive'>
										{fieldState.error.message}
									</p>
								)}
							</div>
						)}
					/>

					<div className='space-y-2'>
						<label
							htmlFor='asset-acquisition-date'
							className='text-sm font-medium'>
							Data de aquisição
						</label>
						<Input
							id='asset-acquisition-date'
							type='date'
							max={maxDate}
							aria-invalid={Boolean(form.formState.errors.acquisitionDate)}
							disabled={isSubmitting}
							{...form.register('acquisitionDate')}
						/>
						{form.formState.errors.acquisitionDate?.message && (
							<p className='text-sm text-destructive'>
								{form.formState.errors.acquisitionDate.message}
							</p>
						)}
					</div>

					{formErrorMessage && (
						<p className='text-sm text-destructive'>{formErrorMessage}</p>
					)}
				</form>

				<SheetFooter>
					<Button
						type='button'
						variant='outline'
						disabled={isSubmitting}
						onClick={() => handleOpenChange(false)}>
						Cancelar
					</Button>
					<Button
						type='submit'
						form='asset-create-form'
						disabled={isSubmitting}>
						{isSubmitting ? 'Salvando...' : 'Salvar ativo'}
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}

export { AssetCreateSheet };
