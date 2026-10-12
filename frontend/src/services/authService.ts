
import axios, { AxiosError } from 'axios';
import type { LoginRequest, LoginResponse } from '../types/auth';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const handleApiError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string }>;

    if (axiosError.response) {
      const status = axiosError.response.status;
      const message =
          axiosError.response.data?.message ??
          'Có lỗi xảy ra từ máy chủ.';

      throw new ApiError(message, status);
    }

    if (axiosError.request) {
      throw new ApiError(
          'Lỗi kết nối mạng: Không thể kết nối tới máy chủ.',
      );
    }
  }

  if (error instanceof Error) {
    throw error;
  }

  throw new ApiError('Đã xảy ra lỗi không xác định.');
};

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post<LoginResponse>(
          '/api/auth/login',
          data,
      );

      return response.data;
    } catch (error: unknown) {
      return handleApiError(error);
    }
  },

  getMe: async (): Promise<LoginResponse> => {
    try {
      const response = await apiClient.get<LoginResponse>(
          '/api/auth/me',
      );

      return response.data;
    } catch (error: unknown) {
      return handleApiError(error);
    }
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/api/auth/logout');
    } catch (error: unknown) {
      return handleApiError(error);
    }
  },
};

export default authService;
