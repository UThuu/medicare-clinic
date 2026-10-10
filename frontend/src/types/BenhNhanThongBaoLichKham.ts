export type LoaiThongBaoLichKham =
  | 'XAC_NHAN_DAT_LICH'
  | 'NHAC_LICH_1_NGAY'
  | 'NHAC_LICH_2_GIO';

export type TrangThaiLichKham = 'DA_DAT' | 'DA_TIEP_NHAN' | 'DA_HUY' | string;

export interface ThongBaoLichKhamItem {
  idLichKham: string;
  loaiThongBao: LoaiThongBaoLichKham | string;
  tieuDe: string;
  noiDung: string;
  maBacSi: string | null;
  hoTenBacSi: string | null;
  ngayKham: string;
  gioKham: string;
  trangThaiLichKham: TrangThaiLichKham;
  thoiDiemNhac: string | null;
}

export interface BenhNhanThongBaoLichKhamResponse {
  thoiDiemTruyVan: string;
  tongSoThongBao: number;
  danhSachThongBao: ThongBaoLichKhamItem[];
}
