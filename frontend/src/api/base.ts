import axios from 'axios';
import { ApiResponse } from '../types/common/response';

// Tạo instance của axios
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor cho request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor cho response
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Xử lý các lỗi chung (401, 403, 500, etc.)
    return Promise.reject(error);
  }
);

// Function để gọi API với type safety
export const apiRequest = <T>(
  method: string,
  url: string,
  options: {
    params?: any;
    data?: any;
    headers?: any;
  } = {}
): Promise<ApiResponse<T>> => {
  return apiClient({
    method,
    url,
    params: options.params,
    data: options.data,
    headers: options.headers
  }).then(response => response.data);
};

export default apiClient;