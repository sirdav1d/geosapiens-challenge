/** @format */

import { ApiHttpError } from '../api/assets';
import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';

type HandleApiFormErrorOptions<TFieldValues extends FieldValues> = {
	allowedFields: readonly Path<TFieldValues>[];
	conflict?: {
		field: Path<TFieldValues>;
		message: string;
	};
	setFieldError: UseFormSetError<TFieldValues>;
	setFormErrorMessage: (message: string | null) => void;
	unexpectedMessage?: string;
};

function handleApiFormError<TFieldValues extends FieldValues>(
	error: unknown,
	options: HandleApiFormErrorOptions<TFieldValues>,
): void {
	const {
		allowedFields,
		conflict,
		setFieldError,
		setFormErrorMessage,
		unexpectedMessage = 'Ocorreu um erro inesperado. Tente novamente.',
	} = options;

	if (!(error instanceof ApiHttpError)) {
		setFormErrorMessage(unexpectedMessage);
		return;
	}

	if (error.status === 400 && error.details?.errors?.length) {
		let hasFieldError = false;

		for (const fieldError of error.details.errors) {
			if (
				!fieldError?.field ||
				!isAllowedField(fieldError.field, allowedFields)
			) {
				continue;
			}

			setFieldError(fieldError.field, {
				type: 'server',
				message: fieldError.message || 'Valor inválido.',
			});
			hasFieldError = true;
		}

		if (hasFieldError) {
			return;
		}
	}

	if (error.status === 409 && conflict) {
		setFieldError(conflict.field, {
			type: 'server',
			message: error.details?.message || conflict.message,
		});
		return;
	}

	setFormErrorMessage(
		error.details?.message || error.message || unexpectedMessage,
	);
}

function isAllowedField<TFieldValues extends FieldValues>(
	field: string,
	allowedFields: readonly Path<TFieldValues>[],
): field is Path<TFieldValues> {
	return allowedFields.some((allowedField) => allowedField === field);
}

export { handleApiFormError };
