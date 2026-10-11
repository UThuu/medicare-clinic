import axios, { AxiosError } from 'axios';
import { LoginRequest, LoginResponse } from '../types/auth';

const apiClient = axios.create({
  withCredentials: true,
});

export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const handleApiError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string }>;
    if (axiosError.response) {
      const status = axiosError.response.status;
      const message = axiosError.response.data?.message || 'Có lỗi xảy ra từ máy chủ.';
      throw new ApiError(message, status);
    } else if (axiosError.request) {
      throw new ApiError('Lỗi kết nối mạng: Không thể kết nối tới máy chủ.');
    }
  }
  throw new ApiError('Đã xảy ra lỗi không xác định.');
};

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post<LoginResponse>('/api/auth/login', data);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  getMe: async (): Promise<LoginResponse> => {
    try {
      const response = await apiClient.get<LoginResponse>('/api/auth/me');
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/api/auth/logout');
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }
};
