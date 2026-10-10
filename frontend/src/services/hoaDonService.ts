import axios, { AxiosError } from 'axios';
import type { HoaDonTraCuuRequest, HoaDonTraCuuResponse } from '../types/HoaDon';
import { ApiError } from './authService';

// withCredentials cho phép gửi cookie session đăng nhập tới backend.
const apiClient = axios.create({
  withCredentials: true,
});

type ApiErrorBody = {
  message?: string;
  thongBao?: string;
};

export const hoaDonService = {
  traCuuHoaDon: async (request: HoaDonTraCuuRequest): Promise<HoaDonTraCuuResponse> => {
    try {
      const response = await apiClient.get<HoaDonTraCuuResponse>('/api/hoadon/tra-cuu', {
        params: request,
      });
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiErrorBody>;
        if (axiosError.response) {
          const message =
            axiosError.response.data?.message ||
            axiosError.response.data?.thongBao ||
            'Không thể tra cứu hóa đơn. Vui lòng thử lại.';
          throw new ApiError(message, axiosError.response.status);
        }

        if (axiosError.request) {
          throw new ApiError('Không thể kết nối tới máy chủ. Kiểm tra backend và kết nối mạng.');
        }
      }

      if (error instanceof Error) {
        throw new ApiError(error.message);
      }
      throw new ApiError('Đã xảy ra lỗi không xác định khi tra cứu hóa đơn.');
    }
  },
};
