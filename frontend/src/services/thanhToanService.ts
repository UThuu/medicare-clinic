import api from './api';
import {
  HoaDonResponse,
  ThongTinThanhToanResponse,
  XacNhanThanhToanRequest,
  KetQuaThanhToanResponse,
  ThanhToanTienMatRequest,
  ThanhToanTienMatResponse,
  ThongTinQrResponse,
  ThanhToanQrRequest,
  GiaoDichResponse,
} from '../types/billing';

export const thanhToanService = {
  /**
   * Lấy danh sách hóa đơn chưa thanh toán chờ thu ngân xử lý
   */
  layDanhSachHoaDonChuaThanhToan: async (): Promise<HoaDonResponse[]> => {
    const res = await api.get<HoaDonResponse[]>('/thanhtoan/cho-thanh-toan');
    return res.data;
  },

  /**
   * Lấy chi tiết thông tin thanh toán của một hóa đơn
   */
  layThongTinThanhToan: async (idHoaDon: string): Promise<ThongTinThanhToanResponse> => {
    const res = await api.get<ThongTinThanhToanResponse>(`/thanhtoan/hoa-don/${idHoaDon}`);
    return res.data;
  },

  /**
   * UC-17: Xác nhận thanh toán hóa đơn
   */
  xacNhanThanhToan: async (
    payload: XacNhanThanhToanRequest
  ): Promise<KetQuaThanhToanResponse> => {
    const res = await api.post<KetQuaThanhToanResponse>('/thanhtoan/xac-nhan', payload);
    return res.data;
  },

  /**
   * UC-18: Xác nhận thanh toán bằng tiền mặt tại quầy (tính tiền thối lại)
   */
  thanhToanTienMat: async (
    payload: ThanhToanTienMatRequest
  ): Promise<ThanhToanTienMatResponse> => {
    const res = await api.post<ThanhToanTienMatResponse>('/thanhtoan/tien-mat', payload);
    return res.data;
  },

  /**
   * UC-19: Lấy thông tin mã VietQR ngân hàng phục vụ thanh toán
   */
  layThongTinQrThanhToan: async (idHoaDon: string): Promise<ThongTinQrResponse> => {
    const res = await api.get<ThongTinQrResponse>(`/thanhtoan/qr/${idHoaDon}`);
    return res.data;
  },

  /**
   * UC-19: Xác nhận hoàn tất thanh toán qua chuyển khoản / QR ngân hàng
   */
  xacNhanThanhToanQr: async (
    payload: ThanhToanQrRequest
  ): Promise<KetQuaThanhToanResponse> => {
    const res = await api.post<KetQuaThanhToanResponse>('/thanhtoan/qr-xac-nhan', payload);
    return res.data;
  },

  /**
   * Lấy lịch sử giao dịch của hóa đơn
   */
  layLichSuGiaoDich: async (idHoaDon: string): Promise<GiaoDichResponse[]> => {
    const res = await api.get<GiaoDichResponse[]>(`/thanhtoan/lich-su/${idHoaDon}`);
    return res.data;
  },
};

