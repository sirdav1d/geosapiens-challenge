/** @format */

import { zodResolver } from '@hookform/resolvers/zod';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import {
	useCallback,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import type { Asset, AssetUpsertRequest, Category, Status } from '../api/types';
import {
	CATEGORY_LABELS,
	CATEGORY_VALUES,
	STATUS_LABELS,
	STATUS_VALUES,
} from '../constants/assets';
import { CATEGORY_ICONS } from '../constants/category-icons';
import { ASSET_CREATE_FIELDS } from '../constants/asset-form';
import {
	formatLocalDate,
	getTodayDateInputValue,
	isValidDateInput,
	parseDateInput,
	toDateInputValue,
} from '../helpers/date';
import { isEnumValue } from '../helpers/enum';
import { handleApiFormError } from '../helpers/form-errors';
import {
	useCreateAssetMutation,
	useUpdateAssetMutation,
} from '../hooks/use-assets';
import { Button } from './ui/button';
import { Calendar } from './ui/calendar';
import { Input } from './ui/input';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
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

const assetUpsertSchema = z.object({
	name: z.string().trim().min(1, 'Nome é obrigatório.'),
	serialNumber: z.string().trim().min(1, 'Número de série é obrigatório.'),
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

type AssetUpsertFormInput = z.input<typeof assetUpsertSchema>;
type AssetUpsertFormOutput = z.output<typeof assetUpsertSchema>;
type AssetUpsertField = keyof AssetUpsertFormInput;

type AssetUpsertSheetMode = 'create' | 'edit';

type AssetUpsertSheetProps = {
	asset?: Asset | null;
	mode: AssetUpsertSheetMode;
	onOpenChange?: (open: boolean) => void;
	open?: boolean;
	trigger?: ReactNode;
};

const emptyFormValues: AssetUpsertFormInput = {
	name: '',
	serialNumber: '',
	category: '',
	status: '',
	acquisitionDate: '',
};

const assetUpsertFormFields =
	ASSET_CREATE_FIELDS as readonly AssetUpsertField[];

export default function AssetUpsertSheet({
	asset,
	mode,
	onOpenChange,
	open,
	trigger,
}: AssetUpsertSheetProps) {
	const [internalOpen, setInternalOpen] = useState(false);
	const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null);
	const createAssetMutation = useCreateAssetMutation();
	const updateAssetMutation = useUpdateAssetMutation();
	const isCreateMode = mode === 'create';
	const isEditMode = mode === 'edit';
	const isSubmitting =
		createAssetMutation.isPending || updateAssetMutation.isPending;
	const maxSelectableDate = useMemo(
		() => parseDateInput(getTodayDateInputValue()) ?? new Date(),
		[],
	);

	const resolvedOpen = open ?? internalOpen;
	const setResolvedOpen = useCallback(
		(nextOpen: boolean) => {
			if (onOpenChange) {
				onOpenChange(nextOpen);
				return;
			}
			setInternalOpen(nextOpen);
		},
		[onOpenChange],
	);

	const form = useForm<AssetUpsertFormInput, unknown, AssetUpsertFormOutput>({
		resolver: zodResolver(assetUpsertSchema),
		defaultValues: emptyFormValues,
	});

	const handleOpenChange = useCallback(
		(nextOpen: boolean) => {
			if (!nextOpen && isSubmitting) {
				return;
			}

			if (!nextOpen) {
				form.reset(emptyFormValues);
				setFormErrorMessage(null);
			}

			setResolvedOpen(nextOpen);
		},
		[form, isSubmitting, setResolvedOpen],
	);

	useEffect(() => {
		if (!resolvedOpen) {
			return;
		}

		if (isEditMode) {
			if (!asset) {
				return;
			}

			form.reset({
				name: asset.name,
				serialNumber: asset.serialNumber,
				category: asset.category,
				status: asset.status,
				acquisitionDate: asset.acquisitionDate,
			});
			return;
		}

		form.reset(emptyFormValues);
	}, [asset, form, isEditMode, resolvedOpen]);

	const handleSubmit = useCallback(
		async (values: AssetUpsertFormOutput) => {
			setFormErrorMessage(null);

			try {
				if (isCreateMode) {
					await createAssetMutation.mutateAsync(values as AssetUpsertRequest);
				} else {
					if (!asset) {
						setFormErrorMessage(
							'Não foi possível identificar o ativo para edição.',
						);
						return;
					}

					await updateAssetMutation.mutateAsync({
						id: asset.id,
						payload: values as AssetUpsertRequest,
					});
				}

				handleOpenChange(false);
			} catch (error) {
				handleApiFormError<AssetUpsertFormInput>(error, {
					allowedFields: assetUpsertFormFields,
					conflict: {
						field: 'serialNumber',
						message: 'Já existe um ativo com este número de série.',
					},
					setFieldError: form.setError,
					setFormErrorMessage,
					unexpectedMessage: isCreateMode
						? 'Ocorreu um erro inesperado ao criar o ativo. Tente novamente.'
						: 'Ocorreu um erro inesperado ao editar o ativo. Tente novamente.',
				});
			}
		},
		[
			asset,
			createAssetMutation,
			form.setError,
			handleOpenChange,
			isCreateMode,
			updateAssetMutation,
		],
	);

	if (isEditMode && !asset) {
		return null;
	}

	const title = isCreateMode ? 'Novo ativo' : 'Editar ativo';
	const description = isCreateMode
		? 'Preencha os campos para cadastrar um novo ativo no inventário.'
		: 'Atualize os dados do ativo selecionado.';
	const formId = isCreateMode ? 'asset-create-form' : 'asset-edit-form';
	const submitButtonLabel = isCreateMode ? 'Salvar ativo' : 'Salvar alterações';
	const submitButtonLoadingLabel = isCreateMode
		? 'Salvando...'
		: 'Salvando alterações...';

	return (
		<Sheet
			open={resolvedOpen}
			onOpenChange={handleOpenChange}>
			{trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
			<SheetContent
				side='right'
				className='overflow-y-auto sm:max-w-md'>
				<SheetHeader>
					<SheetTitle className='text-xl'>{title}</SheetTitle>
					<SheetDescription>{description}</SheetDescription>
				</SheetHeader>

				<form
					id={formId}
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
										className='w-full'
										id='asset-category'
										aria-invalid={fieldState.invalid}>
										<SelectValue placeholder='Selecione uma categoria' />
									</SelectTrigger>
									<SelectContent>
										{CATEGORY_VALUES.map((category) => {
											const CategoryIcon = CATEGORY_ICONS[category];

											return (
												<SelectItem
													key={category}
													value={category}>
													<div className='flex items-center gap-2'>
														<CategoryIcon
															size={14}
															className='shrink-0 text-muted-foreground'
														/>
														<span>{CATEGORY_LABELS[category]}</span>
													</div>
												</SelectItem>
											);
										})}
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
										className='w-full'
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

					<Controller
						control={form.control}
						name='acquisitionDate'
						render={({ field, fieldState }) => {
							const selectedDate = parseDateInput(field.value);
							const hasSelectedDate = selectedDate !== undefined;

							return (
								<div className='space-y-2'>
									<label
										htmlFor='asset-acquisition-date'
										className='text-sm font-medium'>
										Data de aquisição
									</label>
									<Popover>
										<PopoverTrigger asChild>
											<Button
												id='asset-acquisition-date'
												type='button'
												variant='outline'
												aria-invalid={fieldState.invalid}
												disabled={isSubmitting}
												className={[
													'w-full justify-start text-left font-normal',
													!hasSelectedDate ? 'text-muted-foreground' : '',
												].join(' ')}>
												<CalendarIcon className='size-4 text-muted-foreground' />
												{hasSelectedDate
													? formatLocalDate(field.value)
													: 'Selecione a data de aquisição'}
											</Button>
										</PopoverTrigger>
										<PopoverContent
											className='w-auto p-0'
											align='start'>
											<Calendar
												mode='single'
												locale={ptBR}
												selected={selectedDate}
												onSelect={(selectedValue) => {
													if (!selectedValue) {
														return;
													}
													field.onChange(toDateInputValue(selectedValue));
												}}
												disabled={(date) => date > maxSelectableDate}
												initialFocus
											/>
										</PopoverContent>
									</Popover>
									{fieldState.error?.message && (
										<p className='text-sm text-destructive'>
											{fieldState.error.message}
										</p>
									)}
								</div>
							);
						}}
					/>

					{formErrorMessage && (
						<p className='text-sm text-destructive'>{formErrorMessage}</p>
					)}
				</form>

				<SheetFooter>
					<Button
						type='submit'
						form={formId}
						disabled={isSubmitting}>
						{isSubmitting ? submitButtonLoadingLabel : submitButtonLabel}
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
