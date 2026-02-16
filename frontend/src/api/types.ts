export type Category =
  | "COMPUTER"
  | "PERIPHERAL"
  | "NETWORK_EQUIPMENT"
  | "SERVER_INFRA"
  | "MOBILE_DEVICE";

export type Status = "IN_USE" | "IN_STOCK" | "MAINTENANCE" | "RETIRED";

export interface Asset {
  id: number;
  name: string;
  serialNumber: string;
  category: Category;
  status: Status;
  acquisitionDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssetUpsertRequest {
  name: string;
  serialNumber: string;
  category: Category;
  status: Status;
  acquisitionDate: string;
}

export interface PaginatedResponse<TItem> {
  items: TItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export type AssetsPageResponse = PaginatedResponse<Asset>;

export interface AssetsQueryParams {
  page?: number;
  size?: number;
  sort?: string | string[];
  category?: Category;
  status?: Status;
  q?: string;
}

export interface ApiFieldError {
  field: string;
  message: string;
  rejectedValue: string | null;
}

export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  code: string;
  message: string;
  path: string;
  errors: ApiFieldError[] | null;
}
