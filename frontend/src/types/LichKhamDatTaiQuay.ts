export interface BacSiDatLich { maBacSi: string; hoTen: string; chuyenKhoa: string }
export interface KhungGioTrong { maBacSi: string; ngayKham: string; gioTrong: string[]; ngayGoiY: string[] }
export interface LichKhamDatTaiQuayRequest { idBenhNhan: string; maBacSi: string; ngayKham: string; gioKham: string }
export interface LichKhamDatTaiQuayResponse extends LichKhamDatTaiQuayRequest {
  thongBao: string; idLichKham: string; hoTenBenhNhan: string; hoTenBacSi: string;
  trangThai: 'DA_DAT'; phuongThucDatLich: 'TRUC_TIEP';
}
