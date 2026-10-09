export type TrangThaiLichKham = 'DA_DAT' | 'DA_TIEP_NHAN' | 'DA_HUY';
export type TrangThaiLuotKham = 'CHO_KHAM' | 'DANG_KHAM' | 'HOAN_TAT';
export type PhuongThucDatLich = 'TRUC_TUYEN' | 'TRUC_TIEP';
export type GioiTinh = 'NAM' | 'NU';

export interface DoctorScheduleResponse {
  idLichKham: string;
  ngayKham: string;
  gioKham: string;
  trangThaiLichKham: TrangThaiLichKham;
  phuongThucDatLich: PhuongThucDatLich;
  
  idBenhNhan: string;
  tenBenhNhan: string;
  gioiTinh: GioiTinh;
  ngaySinh: string;
  soDienThoai: string;
  
  idLuotKham: string | null;
  trangThaiLuotKham: TrangThaiLuotKham | null;
  
  lyDoKham: string | null;
  huyetApTamThu: number | null;
  huyetApTamTruong: number | null;
  nhietDo: number | null;
  canNang: number | null;
  thoiDiemDoSinhHieu: string | null;
}
