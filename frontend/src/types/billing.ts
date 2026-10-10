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

export interface GiaoDichResponse {
  idGiaoDich: string;
  maGiaoDich: string;
  phuongThuc: string;
  soTien: number;
  trangThai: string;
  thoiGian: string;
}

export interface ThongTinThanhToanResponse {
  idHoaDon: string;
  idThanhToan?: string;
  idLuotKham?: string;
  maBenhNhan: string;
  tenBenhNhan: string;
  soDienThoai: string;
  diaChi?: string;
  bacSiKham: string;
  chuyenKhoa?: string;
  chanDoan?: string;
  ngayLapHoaDon: string;
  phiKham: number;
  tienThuoc: number;
  tongTien: number;
  trangThaiHoaDon: 'CHUA_THANH_TOAN' | 'DA_THANH_TOAN' | 'HUY';
  trangThaiThanhToan: string;
  danhSachChiTiet: ChiTietKhoanThuDTO[];
  lichSuGiaoDich: GiaoDichResponse[];
}

export interface XacNhanThanhToanRequest {
  idHoaDon: string;
  phuongThuc: string;
  soTien?: number;
  maGiaoDichNgoai?: string;
  ghiChu?: string;
}

export interface KetQuaThanhToanResponse {
  idThanhToan: string;
  idGiaoDich: string;
  maGiaoDich: string;
  idHoaDon: string;
  phuongThuc: string;
  soTien: number;
  trangThai: string;
  thoiGian: string;
  thongBao: string;
}

export interface ThanhToanTienMatRequest {
  idHoaDon: string;
  tienKhachDua: number;
  ghiChu?: string;
}

export interface ThanhToanTienMatResponse {
  idThanhToan: string;
  idGiaoDich: string;
  maGiaoDich: string;
  idHoaDon: string;
  tongTien: number;
  tienKhachDua: number;
  tienThoiLai: number;
  phuongThuc: string;
  trangThai: string;
  thoiGian: string;
  thongBao: string;
}

export interface ThongTinQrResponse {
  idHoaDon: string;
  soTien: number;
  nganHang: string;
  maNganHang: string;
  soTaiKhoan: string;
  tenChuTaiKhoan: string;
  noiDung: string;
  qrImageUrl: string;
  qrQuickLink: string;
}

export interface ThanhToanQrRequest {
  idHoaDon: string;
  maGiaoDichNganHang?: string;
  ghiChu?: string;
}

export interface VNPayPaymentResponse {
  paymentUrl: string;
  maGiaoDich: string;
  idHoaDon: string;
  soTien: number;
  thongBao: string;
}

export interface VNPayCallbackResponse {
  idHoaDon: string;
  maGiaoDich: string;
  maGiaoDichVNPay?: string;
  soTien: number;
  nganHang?: string;
  thoiGianThanhToan?: string;
  thoiGian?: string;
  trangThai: string;
  thanhCong?: boolean;
  maPhanHoi: string;
  thongBao: string;
}

export interface InHoaDonResponse {
  tenPhongKham: string;
  diaChiPhongKham: string;
  hotline: string;
  email: string;
  website: string;
  idHoaDon: string;
  idLuotKham: string;
  ngayLap: string;
  ngayThanhToan: string;
  trangThai: 'CHUA_THANH_TOAN' | 'DA_THANH_TOAN' | 'HUY';
  maBenhNhan: string;
  tenBenhNhan: string;
  ngaySinh?: string;
  tuoi?: number;
  gioiTinh?: string;
  soDienThoai: string;
  diaChi?: string;
  bacSiKham: string;
  chuyenKhoa?: string;
  lyDoKham?: string;
  chanDoan?: string;
  danhSachKhoanThu: ChiTietKhoanThuDTO[];
  phiKham: number;
  tienThuoc: number;
  tongTien: number;
  tongTienBangChu: string;
  phuongThucThanhToan: string;
  tenPhuongThuc: string;
  maGiaoDich: string;
  thuNganThu: string;
  ghiChu?: string;
}


