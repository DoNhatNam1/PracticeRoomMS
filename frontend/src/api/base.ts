import axios from 'axios';
import { tokenService } from '@/services/tokenService';
import { useAuthStore } from '@/stores/authStore';
import { ApiResponse, ApiErrorResponse } from '@/types/common/response';

// Cài đặt URL từ env
const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000
});

// Queue cho các request pending khi đang refresh token
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

// Xử lý queue
const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Thêm token vào request
api.interceptors.request.use(config => {
  const token = tokenService.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Xử lý refresh token khi gặp lỗi 401
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    // Nếu lỗi 401 và chưa thử refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Nếu đang refresh, đưa request vào hàng đợi
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Lấy refresh token
        const refreshToken = tokenService.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Gọi API refresh token với refresh token từ localStorage
        const { data } = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken
        });
        
        // Lấy token mới
        const { accessToken, refreshToken: newRefreshToken } = data.data;
        
        // Lưu token mới
        tokenService.setAccessToken(accessToken);
        if (newRefreshToken) tokenService.setRefreshToken(newRefreshToken);
        
        // Cập nhật store
        useAuthStore.getState().setToken(accessToken);
        if (newRefreshToken) useAuthStore.getState().setRefreshToken(newRefreshToken);
        
        // Cập nhật header
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        // Xử lý queue
        processQueue(null, accessToken);
        
        // Thử lại request ban đầu
        return api(originalRequest);
      } catch (refreshError) {
        // Nếu refresh thất bại, đăng xuất
        processQueue(refreshError as Error);
        useAuthStore.getState().logout();
        tokenService.clearTokens();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);

// Helper function để set auth header
export const setAuthHeader = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// API request function
export async function apiRequest<T>(
  method: string,
  url: string,
  options: {
    data?: any;
    params?: any;
    headers?: Record<string, string>;
  } = {}
): Promise<ApiResponse<T>> {
  try {
    const config = {
      method,
      url,
      params: options.params,
      headers: options.headers,
      data: options.data
    };

    const response = await api(config);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw error.response.data as ApiErrorResponse;
    }
    
    throw {
      success: false,
      message: error.message || 'An unexpected error occurred',
      statusCode: error.response?.status || 500,
    } as ApiErrorResponse;
  }
}

export default api;