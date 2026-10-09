import api from './api';
import {
  ChiPhiKhamPreviewResponse,
  HoaDonResponse,
  LuotKhamChoHoaDonResponse,
  TaoHoaDonRequest,
} from '../types/billing';

export const hoaDonService = {
  // Lấy danh sách lượt khám chờ lập hóa đơn
  getDanhSachChoLapHoaDon: async (): Promise<LuotKhamChoHoaDonResponse[]> => {
    const response = await api.get<LuotKhamChoHoaDonResponse[]>('/hoadon/cho-lap');
    return response.data;
  },

  // UC-16: Xem trước chi phí và tính tổng tiền
  getChiPhiDuKien: async (idLuotKham: string): Promise<ChiPhiKhamPreviewResponse> => {
    const response = await api.get<ChiPhiKhamPreviewResponse>(`/hoadon/chi-phi-du-kien/${idLuotKham}`);
    return response.data;
  },

  // UC-15: Lập hóa đơn
  taoHoaDon: async (request: TaoHoaDonRequest): Promise<HoaDonResponse> => {
    const response = await api.post<HoaDonResponse>('/hoadon/tao', request);
    return response.data;
  },

  // Lấy chi tiết hóa đơn theo ID
  getHoaDonById: async (id: string): Promise<HoaDonResponse> => {
    const response = await api.get<HoaDonResponse>(`/hoadon/${id}`);
    return response.data;
  },

  // Lấy tất cả hóa đơn đã tạo
  getDanhSachTatCaHoaDon: async (): Promise<HoaDonResponse[]> => {
    const response = await api.get<HoaDonResponse[]>('/hoadon');
    return response.data;
  },
};
