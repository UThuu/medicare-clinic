export interface ChiTietKhoanThuDTO {
  loaiKhoanThu: 'TIEN_KHAM' | 'TIEN_THUOC';
  tenKhoanThu: string;
  donViTinh?: string;
  soLuong: number;
  donGia: number;
  thanhTien: number;
  huongDan?: string;
}

export interface ChiPhiKhamPreviewResponse {
  idLuotKham: string;
  maBenhNhan: string;
  tenBenhNhan: string;
  soDienThoai: string;
  ngaySinh?: string;
  gioiTinh?: string;
  bacSiKham: string;
  chuyenKhoa?: string;
  lyDoKham?: string;
  chanDoan?: string;
  ngayKham?: string;
  phiKham: number;
  tienThuoc: number;
  tongTien: number;
  danhSachKhoanThu: ChiTietKhoanThuDTO[];
  daCoHoaDon: boolean;
  idHoaDonHienTai?: string;
}

export interface TaoHoaDonRequest {
  idLuotKham: string;
  maThuNgan?: string;
  phiKhamTuyChinh?: number;
  ghiChu?: string;
}

export interface HoaDonResponse {
  idHoaDon: string;
  idLuotKham: string;
  maBenhNhan: string;
  tenBenhNhan: string;
  soDienThoai: string;
  diaChi?: string;
  bacSiKham: string;
  thuNganLap: string;
  ngayTao: string;
  phiKham: number;
  tienThuoc: number;
  tongTien: number;
  trangThai: 'CHUA_THANH_TOAN' | 'DA_THANH_TOAN' | 'HUY';
  danhSachChiTiet: ChiTietKhoanThuDTO[];
}

export interface LuotKhamChoHoaDonResponse {
  idLuotKham: string;
  idLichKham?: string;
  maBenhNhan: string;
  tenBenhNhan: string;
  soDienThoai: string;
  bacSiKham: string;
  chuyenKhoa?: string;
  ngayKham?: string;
  gioKham?: string;
  lyDoKham?: string;
  chanDoan?: string;
  trangThaiLuotKham: string;
  daCoDonThuoc: boolean;
}
