export interface ThuocItem {
  idThuoc: string;
  tenThuoc: string;
  donViTinh: string;
  donGia: number;
  thanhPhans: string[];
}

export interface CanhBaoDiUng {
  idThuoc: string;
  tenThuoc: string;
  thanhPhanTrung: string;
  ghiChuDiUng: string;
  coCanhBao: boolean;
}

export interface ChiTietDonThuocInput {
  tempId: string;
  idThuoc: string;
  tenThuoc: string;
  donViTinh: string;
  soLuong: number;
  lieuLuong: string;
  huongDanSuDung: string;
  donGia: number;
  lyDoBoQuaCanhBao?: string;
  canhBaoDiUng?: CanhBaoDiUng | null;
  daXacNhanTiepTuc?: boolean;
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

export interface DiUngItem {
  thanhPhan: string;
  ghiChu?: string;
}

export interface DonThuocResponse {
  idDonThuoc: string | null;
  idLuotKham: string;
  ngayKe: string | null;
  ghiChu: string | null;

  // Bệnh nhân
  idBenhNhan: string;
  hoTenBenhNhan: string;
  ngaySinhBenhNhan: string | null;
  tuoiBenhNhan: number | null;
  gioiTinhBenhNhan: string | null;
  soDienThoaiBenhNhan: string | null;
  diaChiBenhNhan: string | null;

  // Bác sĩ
  maBacSi: string | null;
  tenBacSi: string | null;

  // Lâm sàng
  lyDoKham: string | null;
  trieuChung: string | null;
  chanDoan: string | null;
  ketQuaKham: string | null;
  trangThaiLuotKham: string | null;

  // Dị ứng
  diUngs: DiUngItem[];

  // Chi tiết đơn thuốc
  chiTietDonThuoc: ChiTietDonThuocResponse[];
}

export interface TaoDonThuocRequest {
  idLuotKham: string;
  ghiChu?: string;
  chiTietDonThuoc: {
    idThuoc: string;
    soLuong: number;
    lieuLuong: string;
    huongDanSuDung: string;
    donGia?: number;
    lyDoBoQuaCanhBao?: string;
  }[];
}
