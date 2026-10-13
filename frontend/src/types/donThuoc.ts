export interface ChiTietDonThuocRequest {
  idThuoc: string;
  soLuong: number;
  lieuLuong: string;
  huongDanSuDung: string;
  donGia?: number;
  lyDoBoQuaCanhBao?: string;
}

export interface DonThuocRequest {
  idLuotKham: string;
  ghiChu: string;
  chiTietDonThuoc: ChiTietDonThuocRequest[];
}

export interface CanhBaoDiUngResponse {
  idThuoc: string;
  tenThuoc: string;
  thanhPhanTrung: string;
  ghiChuDiUng: string;
  coCanhBao: boolean;
}

export interface ChiTietDonThuocResponse {
  id: string;
  idThuoc: string;
  tenThuoc: string;
  donViTinh: string;
  soLuong: number;
  lieuLuong: string;
  huongDanSuDung: string;
  donGia: number;
  thanhTien: number;
  lyDoBoQuaCanhBao?: string;
}

export interface DonThuocResponse {
  idDonThuoc: string;
  idLuotKham: string;
  idBenhNhan: string;
  hoTenBenhNhan: string;
  tenBacSi: string;
  ngayKe: string;
  ghiChu: string;
  chiTietDonThuoc: ChiTietDonThuocResponse[];
}