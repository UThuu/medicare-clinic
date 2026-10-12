import type { BacSiDatLich, KhungGioTrong, LichKhamDatTaiQuayRequest, LichKhamDatTaiQuayResponse } from '../types/LichKhamDatTaiQuay';
export class BookingApiError extends Error { constructor(message: string, public status: number) { super(message); } }
async function api<T>(path: string, body?: unknown): Promise<T> {
  const r = await fetch('/api/lichkham' + path, { method: body ? 'POST' : 'GET', credentials: 'include',
    headers: { 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });
  const value = await r.json().catch(() => ({}));
  if (!r.ok) throw new BookingApiError(value.message || 'Không thể tải dữ liệu, vui lòng thử lại.', r.status);
  return value as T;
}
export interface LichHenTrongNgay {
  idLichKham: string;
  idBenhNhan: string;
  tenBenhNhan: string;
  soDienThoaiBenhNhan: string;
  maBacSi: string;
  tenBacSi: string;
  chuyenKhoa: string;
  ngayKham: string;
  gioKham: string;
  trangThai: 'DA_DAT' | 'DA_TIEP_NHAN' | 'DA_HUY';
  daTiepNhan: boolean;
  idLuotKham?: string;
}

export const layBacSi = () => api<BacSiDatLich[]>('/bac-si');
export const layKhungGio = (maBacSi: string, ngayKham: string) => api<KhungGioTrong>('/khung-gio?' + new URLSearchParams({ maBacSi, ngayKham }));
export const datLichKhamTaiQuay = (body: LichKhamDatTaiQuayRequest) => api<LichKhamDatTaiQuayResponse>('/dat-tai-quay', body);
export const layLichHenTrongNgay = (ngayKham?: string) => api<LichHenTrongNgay[]>('/trong-ngay' + (ngayKham ? '?' + new URLSearchParams({ ngayKham }) : ''));

