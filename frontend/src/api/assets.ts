/** @format */

import {
	keepPreviousData,
	useMutation,
	useQuery,
	useQueryClient,
} from '@tanstack/react-query';
import type {
	ApiErrorResponse,
	Asset,
	AssetsPageResponse,
	AssetsQueryParams,
	AssetUpsertRequest,
	Category,
	Status,
} from './types';

type Primitive = string | number | boolean;
type QueryValue = Primitive | Primitive[] | null | undefined;
type QueryParams = Record<string, QueryValue>;

type NormalizedAssetsQueryParams = {
	page: number;
	size: number;
	sort?: string[];
	category?: Category;
	status?: Status;
	q?: string;
};

const API_BASE_URL = resolveApiBaseUrl(import.meta.env.VITE_API_URL);

export class ApiHttpError extends Error {
	readonly status: number;
	readonly code?: string;
	readonly details?: ApiErrorResponse;

	constructor(status: number, message: string, details?: ApiErrorResponse) {
		super(message);
		this.name = 'ApiHttpError';
		this.status = status;
		this.code = details?.code;
		this.details = details;
	}
}

export const assetsQueryKeys = {
	all: ['assets'] as const,
	lists: () => [...assetsQueryKeys.all, 'list'] as const,
	list: (params: NormalizedAssetsQueryParams) =>
		[...assetsQueryKeys.lists(), params] as const,
};

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

export function fetchAssets(
	params: AssetsQueryParams = {},
	signal?: AbortSignal,
): Promise<AssetsPageResponse> {
	const normalizedParams = normalizeAssetsQueryParams(params);

	return request<AssetsPageResponse>('/assets', {
		method: 'GET',
		query: {
			page: normalizedParams.page,
			size: normalizedParams.size,
			sort: normalizedParams.sort,
			category: normalizedParams.category,
			status: normalizedParams.status,
			q: normalizedParams.q,
		},
		signal,
	});
}

export function createAsset(payload: AssetUpsertRequest): Promise<Asset> {
	return request<Asset>('/assets', {
		method: 'POST',
		body: payload,
	});
}

export function updateAsset(
	id: number,
	payload: AssetUpsertRequest,
): Promise<Asset> {
	return request<Asset>(`/assets/${id}`, {
		method: 'PUT',
		body: payload,
	});
}

export function deleteAsset(id: number): Promise<void> {
	return request<void>(`/assets/${id}`, {
		method: 'DELETE',
	});
}

async function request<TResponse>(
	path: string,
	options: {
		method: 'GET' | 'POST' | 'PUT' | 'DELETE';
		query?: QueryParams;
		body?: unknown;
		signal?: AbortSignal;
	},
): Promise<TResponse> {
	const response = await fetch(buildUrl(path, options.query), {
		method: options.method,
		signal: options.signal,
		headers: buildHeaders(options.body !== undefined),
		body: options.body === undefined ? undefined : JSON.stringify(options.body),
	});

	return parseResponse<TResponse>(response);
}

function resolveApiBaseUrl(value: string | undefined): string {
	if (!value || !value.trim()) {
		throw new Error('A variável de ambiente VITE_API_URL é obrigatória.');
	}
	return value.trim().replace(/\/+$/, '');
}

function buildUrl(path: string, query?: QueryParams): string {
	const normalizedPath = path.startsWith('/') ? path : `/${path}`;
	const queryString = toQueryString(query);
	return `${API_BASE_URL}${normalizedPath}${queryString}`;
}

function toQueryString(query?: QueryParams): string {
	if (!query) {
		return '';
	}

	const params = new URLSearchParams();
	for (const [key, value] of Object.entries(query)) {
		appendQueryValue(params, key, value);
	}

	const queryString = params.toString();
	return queryString ? `?${queryString}` : '';
}

function appendQueryValue(
	params: URLSearchParams,
	key: string,
	value: QueryValue,
): void {
	if (value === null || value === undefined) {
		return;
	}

	if (Array.isArray(value)) {
		for (const item of value) {
			params.append(key, String(item));
		}
		return;
	}

	params.append(key, String(value));
}

function buildHeaders(hasBody: boolean): Headers {
	const headers = new Headers();
	headers.set('Accept', 'application/json');
	if (hasBody) {
		headers.set('Content-Type', 'application/json');
	}
	return headers;
}

async function parseResponse<TResponse>(
	response: Response,
): Promise<TResponse> {
	if (response.status === 204) {
		return undefined as TResponse;
	}

	const contentType = response.headers.get('content-type') ?? '';
	if (contentType.includes('application/json')) {
		const payload = (await response.json()) as TResponse | ApiErrorResponse;
		if (!response.ok) {
			const details = payload as ApiErrorResponse;
			const message = details.message || `Erro HTTP ${response.status}.`;
			throw new ApiHttpError(response.status, message, details);
		}
		return payload as TResponse;
	}

	const textPayload = await response.text();
	if (!response.ok) {
		throw new ApiHttpError(
			response.status,
			textPayload || `Erro HTTP ${response.status}.`,
		);
	}

	return undefined as TResponse;
}

function normalizeAssetsQueryParams(
	params: AssetsQueryParams,
): NormalizedAssetsQueryParams {
	const sort = Array.isArray(params.sort)
		? params.sort.filter((entry) => entry.trim().length > 0)
		: params.sort && params.sort.trim().length > 0
			? [params.sort]
			: undefined;

	return {
		page: params.page ?? 0,
		size: params.size ?? 20,
		sort: sort && sort.length > 0 ? sort : undefined,
		category: params.category,
		status: params.status,
		q: params.q?.trim() ? params.q.trim() : undefined,
	};
}
