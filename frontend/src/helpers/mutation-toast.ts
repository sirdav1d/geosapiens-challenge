/** @format */

import { toast, type ExternalToast } from 'sonner';
import { ApiHttpError } from '../api/assets';
import {
	ASSET_MUTATION_TOAST_MESSAGES,
	type AssetMutationToastAction,
} from '../constants/toasts';

export type MutationToastContext = {
	toastId: string | number;
};

export function startMutationToast(
	action: AssetMutationToastAction,
	options?: ExternalToast,
): MutationToastContext {
	const { loading } = ASSET_MUTATION_TOAST_MESSAGES[action];
	return {
		toastId: toast.loading(loading, options),
	};
}

export function succeedMutationToast(
	action: AssetMutationToastAction,
	context?: MutationToastContext,
	options?: ExternalToast,
): void {
	const { success } = ASSET_MUTATION_TOAST_MESSAGES[action];

	if (context?.toastId !== undefined) {
		toast.success(success, { ...options, id: context.toastId });
		return;
	}

	toast.success(success, options);
}

export function failMutationToast(
	action: AssetMutationToastAction,
	error: unknown,
	context?: MutationToastContext,
	options?: ExternalToast,
): void {
	const message = resolveMutationErrorMessage(action, error);

	if (context?.toastId !== undefined) {
		toast.error(message, { ...options, id: context.toastId });
		return;
	}

	toast.error(message, options);
}

function resolveMutationErrorMessage(
	action: AssetMutationToastAction,
	error: unknown,
): string {
	const fallbackMessage = ASSET_MUTATION_TOAST_MESSAGES[action].errorFallback;

	if (!(error instanceof ApiHttpError)) {
		return fallbackMessage;
	}

	const apiMessage = error.details?.message?.trim();
	if (apiMessage) {
		return apiMessage;
	}

	const message = error.message?.trim();
	if (message) {
		return message;
	}

	return fallbackMessage;
}
