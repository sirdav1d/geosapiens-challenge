/** @format */

import {
	keepPreviousData,
	useMutation,
	useQuery,
	useQueryClient,
} from '@tanstack/react-query';
import {
	ApiHttpError,
	assetsQueryKeys,
	createAsset,
	deleteAsset,
	fetchAssets,
	normalizeAssetsQueryParams,
	updateAsset,
} from '../api/assets';
import {
	failMutationToast,
	startMutationToast,
	succeedMutationToast,
	type MutationToastContext,
} from '../helpers/mutation-toast';
import type {
	Asset,
	AssetsPageResponse,
	AssetsQueryParams,
	AssetUpsertRequest,
} from '../api/types';

export function useAssetsQuery(params: AssetsQueryParams = {}) {
	const normalizedParams = normalizeAssetsQueryParams(params);

	return useQuery<AssetsPageResponse, ApiHttpError>({
		queryKey: assetsQueryKeys.list(normalizedParams),
		queryFn: ({ signal }) => fetchAssets(normalizedParams, signal),
		placeholderData: keepPreviousData,
	});
}

export function useCreateAssetMutation() {
	const queryClient = useQueryClient();

	return useMutation<
		Asset,
		ApiHttpError,
		AssetUpsertRequest,
		MutationToastContext
	>({
		mutationFn: createAsset,
		onMutate: () => startMutationToast('create'),
		onSuccess: (_data, _variables, context) => {
			succeedMutationToast('create', context);
			void queryClient.invalidateQueries({ queryKey: assetsQueryKeys.lists() });
		},
		onError: (error, _variables, context) => {
			failMutationToast('create', error, context);
		},
	});
}

export function useUpdateAssetMutation() {
	const queryClient = useQueryClient();

	return useMutation<
		Asset,
		ApiHttpError,
		{ id: number; payload: AssetUpsertRequest },
		MutationToastContext
	>({
		mutationFn: ({ id, payload }) => updateAsset(id, payload),
		onMutate: () => startMutationToast('update'),
		onSuccess: (_data, _variables, context) => {
			succeedMutationToast('update', context);
			void queryClient.invalidateQueries({ queryKey: assetsQueryKeys.lists() });
		},
		onError: (error, _variables, context) => {
			failMutationToast('update', error, context);
		},
	});
}

export function useDeleteAssetMutation() {
	const queryClient = useQueryClient();

	return useMutation<void, ApiHttpError, number, MutationToastContext>({
		mutationFn: deleteAsset,
		onMutate: () => startMutationToast('delete'),
		onSuccess: (_data, _variables, context) => {
			succeedMutationToast('delete', context);
			void queryClient.invalidateQueries({ queryKey: assetsQueryKeys.lists() });
		},
		onError: (error, _variables, context) => {
			failMutationToast('delete', error, context);
		},
	});
}
