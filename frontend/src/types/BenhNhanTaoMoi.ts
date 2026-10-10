export type GioiTinhBenhNhan = 'NAM' | 'NU';

/** Payload đúng với BenhNhanTaoMoiRequest ở backend UC29. */
export interface BenhNhanTaoMoiRequest {
  hoTen: string;
  ngaySinh: string;
  gioiTinh: GioiTinhBenhNhan;
  soDienThoai: string;
  diaChi?: string;
}

/** Response đúng với BenhNhanTaoMoiResponse ở backend UC29. */
export interface BenhNhanTaoMoiResponse {
  thongBao: string;
  idBenhNhan: string;
  hoTen: string;
  ngaySinh: string;
  gioiTinh: GioiTinhBenhNhan;
  soDienThoai: string;
  diaChi?: string | null;
}
