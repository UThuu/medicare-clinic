export type GioiTinhBenhNhan = 'NAM' | 'NU';

/** Request DTO tương ứng BenhNhanTimKiemRequest của backend UC28. */
export interface BenhNhanTimKiemRequest {
  soDienThoai?: string;
  hoTen?: string;
  ngaySinh?: string;
}

/** Một hồ sơ trong danhSachBenhNhan của BenhNhanTimKiemResponse. */
export interface BenhNhanTimKiemItem {
  idBenhNhan: string;
  hoTen: string;
  ngaySinh: string;
  gioiTinh: GioiTinhBenhNhan;
  soDienThoai: string;
  diaChi: string | null;
}

/** Response DTO tương ứng BenhNhanTimKiemResponse của backend UC28. */
export interface BenhNhanTimKiemResponse {
  thongBao: string;
  tongSoKetQua: number;
  danhSachBenhNhan: BenhNhanTimKiemItem[];
}
