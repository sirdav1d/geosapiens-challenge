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

	return useMutation<Asset, ApiHttpError, AssetUpsertRequest>({
		mutationFn: createAsset,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: assetsQueryKeys.lists() });
		},
	});
}

export function useUpdateAssetMutation() {
	const queryClient = useQueryClient();

	return useMutation<
		Asset,
		ApiHttpError,
		{ id: number; payload: AssetUpsertRequest }
	>({
		mutationFn: ({ id, payload }) => updateAsset(id, payload),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: assetsQueryKeys.lists() });
		},
	});
}

export function useDeleteAssetMutation() {
	const queryClient = useQueryClient();

	return useMutation<void, ApiHttpError, number>({
		mutationFn: deleteAsset,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: assetsQueryKeys.lists() });
		},
	});
}

