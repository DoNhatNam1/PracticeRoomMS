import { PaginatedResponse } from '../pagination';

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  statusCode?: number;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: string;
  statusCode: number;
}

export interface ApiListResponse<T = any> extends ApiResponse<PaginatedResponse<T>> {}

export type ApiResponsePromise<T = any> = Promise<ApiResponse<T>>;
export type ApiListResponsePromise<T = any> = Promise<ApiListResponse<T>>;