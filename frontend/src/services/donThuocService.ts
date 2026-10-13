import api from './api';
import {
  ThuocItem,
  CanhBaoDiUng,
  DonThuocResponse,
  TaoDonThuocRequest,
} from '../types/donThuoc';

export const donThuocService = {
  // Lấy danh mục thuốc để chọn kê đơn
  getDanhMucThuoc: async (): Promise<ThuocItem[]> => {
    const res = await api.get<ThuocItem[]>('/don-thuoc/danh-muc-thuoc');
    return res.data;
  },

  // UC13: Kiểm tra cảnh báo dị ứng thuốc
  kiemTraDiUng: async (idLuotKham: string, dsIdThuoc: string[]): Promise<CanhBaoDiUng[]> => {
    const res = await api.post<CanhBaoDiUng[]>('/don-thuoc/kiem-tra-di-ung', dsIdThuoc, {
      params: { idLuotKham },
    });
    return res.data;
  },

  // Lấy thông tin khám & đơn thuốc của lượt khám
  getThongTinKeDon: async (idLuotKham: string): Promise<DonThuocResponse> => {
    const res = await api.get<DonThuocResponse>(`/don-thuoc/luot-kham/${encodeURIComponent(idLuotKham)}`);
    return res.data;
  },

  // UC11: Tạo đơn thuốc
  taoDonThuoc: async (data: TaoDonThuocRequest): Promise<DonThuocResponse> => {
    const res = await api.post<DonThuocResponse>('/don-thuoc', data);
    return res.data;
  },

  // UC12: Cập nhật đơn thuốc (thao tác độc lập trên đơn thuốc đã lưu)
  capNhatDonThuoc: async (idDonThuoc: string, data: TaoDonThuocRequest): Promise<DonThuocResponse> => {
    const res = await api.put<DonThuocResponse>(`/don-thuoc/${encodeURIComponent(idDonThuoc)}`, data);
    return res.data;
  },

  // UC14: Lấy dữ liệu để xem trước và in đơn thuốc
  getDonThuocDeIn: async (idDonThuoc: string): Promise<DonThuocResponse> => {
    const res = await api.get<DonThuocResponse>(`/don-thuoc/${encodeURIComponent(idDonThuoc)}/in`);
    return res.data;
  },
};
