export interface ThongTinBenhNhan {
  idBenhNhan: string;
  hoTen: string;
  ngaySinh: string;
  gioiTinh: string;
  soDienThoai: string;
  diaChi: string;
}

export interface DiUng {
  thanhPhan: string;
  ghiChu: string;
}

export interface SinhHieu {
  idLuotKham: string | null;
  huyetApTamThu: number | null;
  huyetApTamTruong: number | null;
  canNang: number | null;
  nhietDo: number | null;
  thoiDiemDo: string;
}

export interface ChiTietThuoc {
  idThuoc: string;
  tenThuoc: string;
  donViTinh: string;
  soLuong: number;
  lieuLuong: string;
  huongDanSuDung: string;
  donGia: number;
  thanhTien: number;
}

export interface DonThuoc {
  idDonThuoc: string;
  ngayKe: string;
  ghiChu: string;
  chiTiet: ChiTietThuoc[];
}

export interface LichSuKham {
  idLuotKham: string;
  idLichKham: string;
  ngayKham: string;
  gioKham: string;
  tenBacSi: string;
  chuyenKhoa: string;
  lyDoKham: string;
  trieuChung: string;
  chanDoan: string;
  ketQuaKham: string;
  trangThai: 'CHO_KHAM' | 'DANG_KHAM' | 'HOAN_TAT';
  sinhHieu: SinhHieu | null;
  donThuoc: DonThuoc | null;
}

export interface HoSoYTeCaNhanResponse {
  benhNhan: ThongTinBenhNhan;
  diUng: DiUng[];
  sinhHieu: SinhHieu[];
  lichSuKham: LichSuKham[];
}
