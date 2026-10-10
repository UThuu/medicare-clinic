export type TrangThaiHoaDon = 'CHUA_THANH_TOAN' | 'DA_THANH_TOAN';

export interface HoaDonTraCuuRequest {
  idHoaDon?: string;
  soDienThoaiBenhNhan?: string;
  tuNgay?: string;
  denNgay?: string;
  trangThai?: TrangThaiHoaDon;
}

export interface ChiTietHoaDonItem {
  loaiChiPhi: string;
  moTa: string;
  soLuong: number;
  donGia: number;
  thanhTien: number;
}

export interface HoaDonItem {
  idHoaDon: string;
  idLuotKham?: string | null;
  idBenhNhan?: string | null;
  hoTenBenhNhan?: string | null;
  soDienThoaiBenhNhan?: string | null;
  maBacSi?: string | null;
  tenBacSi?: string | null;
  hoTenThuNgan?: string | null;
  ngayTao: string;
  tongTien: number;
  trangThai: TrangThaiHoaDon;
  chiTietHoaDon: ChiTietHoaDonItem[];
}

export interface HoaDonTraCuuResponse {
  thongBao: string;
  tongSoKetQua: number;
  danhSachHoaDon: HoaDonItem[];
}
