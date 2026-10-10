import axios, { type AxiosError } from 'axios';
import type {
  BacSiGoiYDaTungKhamRequest,
  BacSiGoiYDaTungKhamResponse,
  LichKhamDatTrucTuyenRequest,
  LichKhamDatTrucTuyenResponse,
  LichKhamGoiYKhungGioThayTheRequest,
  LichKhamGoiYKhungGioThayTheResponse,
  LichKhamKiemTraTrongRequest,
  LichKhamKiemTraTrongResponse,
} from '../types/LichKhamDatTrucTuyen';

const apiClient = axios.create({ withCredentials: true });

export class LichKhamApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'LichKhamApiError';
    this.status = status;
  }
}

function handleError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string }>;
    if (axiosError.response) {
      const message = axiosError.response.data?.message
        || (axiosError.response.status === 401
          ? 'Phiên đăng nhập đã hết hạn. Hãy đăng nhập lại.'
          : axiosError.response.status === 403
            ? 'Tài khoản không có quyền đặt lịch khám trực tuyến.'
            : 'Không thể thực hiện yêu cầu. Vui lòng kiểm tra dữ liệu.');
      throw new LichKhamApiError(message, axiosError.response.status);
    }
    if (axiosError.request) {
      throw new LichKhamApiError('Không thể kết nối tới máy chủ. Hãy kiểm tra backend Spring Boot.');
    }
  }
  if (error instanceof Error) {
    throw new LichKhamApiError(error.message);
  }
  throw new LichKhamApiError('Đã xảy ra lỗi không xác định.');
}

export const lichKhamDatTrucTuyenService = {
  getRecommendedDoctors: async (
    request: BacSiGoiYDaTungKhamRequest = { soLuongToiDa: 5 },
  ): Promise<BacSiGoiYDaTungKhamResponse> => {
    try {
      const response = await apiClient.post<BacSiGoiYDaTungKhamResponse>(
        '/api/lichkham/bac-si-da-kham', request,
      );
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  checkAvailability: async (
    request: LichKhamKiemTraTrongRequest,
  ): Promise<LichKhamKiemTraTrongResponse> => {
    try {
      const response = await apiClient.post<LichKhamKiemTraTrongResponse>(
        '/api/lichkham/kiem-tra-trong', request,
      );
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  getAlternativeSlots: async (
    request: LichKhamGoiYKhungGioThayTheRequest,
  ): Promise<LichKhamGoiYKhungGioThayTheResponse> => {
    try {
      const response = await apiClient.post<LichKhamGoiYKhungGioThayTheResponse>(
        '/api/lichkham/goi-y-khung-gio-thay-the', request,
      );
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  bookOnline: async (
    request: LichKhamDatTrucTuyenRequest,
  ): Promise<LichKhamDatTrucTuyenResponse> => {
    try {
      const response = await apiClient.post<LichKhamDatTrucTuyenResponse>(
        '/api/lichkham/dat-truc-tuyen', request,
      );
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },
};
