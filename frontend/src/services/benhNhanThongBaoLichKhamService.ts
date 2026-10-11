import axios, { AxiosError } from 'axios';
import type { BenhNhanThongBaoLichKhamResponse } from '../types/BenhNhanThongBaoLichKham';

const apiClient = axios.create({
  withCredentials: true,
});

export class BenhNhanThongBaoApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'BenhNhanThongBaoApiError';
    this.status = status;
  }
}

export const benhNhanThongBaoLichKhamService = {
  async layThongBaoLichKham(): Promise<BenhNhanThongBaoLichKhamResponse> {
    try {
      // UC25 lấy danh tính bệnh nhân từ session đăng nhập ở backend; không gửi ID bệnh nhân từ client.
      const response = await apiClient.post<BenhNhanThongBaoLichKhamResponse>(
        '/api/benhnhan/thong-bao-lich-kham',
        {},
      );
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message?: string }>;
        if (axiosError.response) {
          const message = axiosError.response.data?.message || 'Không thể tải thông báo lịch khám.';
          throw new BenhNhanThongBaoApiError(message, axiosError.response.status);
        }
        if (axiosError.request) {
          throw new BenhNhanThongBaoApiError('Không kết nối được máy chủ. Hãy kiểm tra backend và kết nối mạng.');
        }
      }
      throw new BenhNhanThongBaoApiError('Đã xảy ra lỗi không xác định khi tải thông báo.');
    }
  },
};
