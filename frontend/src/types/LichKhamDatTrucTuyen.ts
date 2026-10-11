export interface BacSiGoiYItem {
  maBacSi: string;
  hoTenBacSi: string;
  chuyenKhoa: string | null;
  bangCap: string | null;
  soLanKhamTruoc: number;
  ngayKhamGanNhat: string | null;
}

export interface BacSiGoiYDaTungKhamResponse {
  thongBao: string;
  danhSachBacSi: BacSiGoiYItem[];
}

export interface BacSiGoiYDaTungKhamRequest {
  soLuongToiDa?: number;
}

export interface LichKhamKiemTraTrongRequest {
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

export interface LichKhamGoiYKhungGioThayTheRequest {
  maBacSi: string;
  ngayKham: string;
  gioKhamMongMuon: string;
  soLuongGoiY?: number;
}

export interface KhungGioGoiYItem {
  maBacSi: string;
  hoTenBacSi: string | null;
  chuyenKhoa: string | null;
  ngayKham: string;
  gioKham: string;
}

export interface LichKhamGoiYKhungGioThayTheResponse {
  thongBao: string;
  danhSachKhungGio: KhungGioGoiYItem[];
}

export interface LichKhamDatTrucTuyenRequest {
  maBacSi: string;
  ngayKham: string;
  gioKham: string;
}

export interface LichKhamDatTrucTuyenResponse {
  thongBao: string;
  idLichKham: string;
  idBenhNhan: string;
  hoTenBenhNhan: string;
  maBacSi: string;
  hoTenBacSi: string | null;
  ngayKham: string;
  gioKham: string;
  trangThai: 'DA_DAT' | 'DA_TIEP_NHAN' | 'DA_HUY' | string;
  phuongThucDatLich: 'TRUC_TUYEN' | 'TRUC_TIEP' | string;
}
