import axios, { AxiosError } from 'axios';
import { DoctorScheduleResponse } from '../types/schedule';

// Khởi tạo axios client với withCredentials để gửi cookie session
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

export const scheduleService = {
  getDoctorSchedule: async (date?: string): Promise<DoctorScheduleResponse[]> => {
    try {
      const params = date ? { date } : {};
      const response = await apiClient.get<DoctorScheduleResponse[]>('/api/doctor/schedules', { params });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }
};
