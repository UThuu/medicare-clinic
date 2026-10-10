export interface BenhNhanTimKiemTaiQuay {
  idBenhNhan: string;
  hoTen: string;
  ngaySinh: string;
  gioiTinh: string;
  soDienThoai: string;
  diaChi?: string;
}

export interface LichKhamDatTaiQuayRequest {
  idBenhNhan: string;
  maBacSi: string;
  ngayKham: string;
  gioKham: string;
}

export interface LichKhamKiemTraTrongResponse {
  maBacSi: string;
  ngayKham: string;
  gioKham: string;
  conTrong: boolean;
  thongBao: string;
}

export interface LichKhamDatTaiQuayResponse {
  thongBao: string;
  idLichKham: string;
  idBenhNhan: string;
  hoTenBenhNhan: string;
  maBacSi: string;
  hoTenBacSi?: string | null;
  ngayKham: string;
  gioKham: string;
  trangThai: string;
  phuongThucDatLich: string;
}
