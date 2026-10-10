import axios, { AxiosError } from 'axios';
import type {
  HoaDonTongDoanhThuRequest,
  HoaDonTongDoanhThuResponse,
} from '../types/HoaDonDoanhThu';
import { ApiError } from './authService';

const apiClient = axios.create({
  withCredentials: true,
});

type ApiErrorBody = {
  message?: string;
  thongBao?: string;
  error?: string;
};

/** API service cho UC23. Backend yêu cầu POST /api/hoadon/tong-doanh-thu. */
export const hoaDonTongDoanhThuService = {
  xemTongDoanhThu: async (
    request: HoaDonTongDoanhThuRequest,
  ): Promise<HoaDonTongDoanhThuResponse> => {
    try {
      const response = await apiClient.post<HoaDonTongDoanhThuResponse>(
        '/api/hoadon/tong-doanh-thu',
        request,
      );
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiErrorBody>;
        if (axiosError.response) {
          const message =
            axiosError.response.data?.thongBao ||
            axiosError.response.data?.message ||
            axiosError.response.data?.error ||
            'Không thể xem tổng doanh thu. Vui lòng thử lại.';
          throw new ApiError(message, axiosError.response.status);
        }

        if (axiosError.request) {
          throw new ApiError('Không thể kết nối tới máy chủ. Hãy kiểm tra backend và kết nối mạng.');
        }
      }

      if (error instanceof Error) {
        throw new ApiError(error.message);
      }
      throw new ApiError('Đã xảy ra lỗi không xác định khi xem tổng doanh thu.');
    }
  },
};
