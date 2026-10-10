import type {
  BenhNhanTimKiemTaiQuay,
  LichKhamDatTaiQuayRequest,
  LichKhamDatTaiQuayResponse,
  LichKhamKiemTraTrongResponse,
} from '../types/LichKhamDatTaiQuay';

async function readResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    if (response.status === 204) return undefined as T;
    return response.json() as Promise<T>;
  }

  const contentType = response.headers.get('content-type') || '';
  let message = `Yêu cầu thất bại (HTTP ${response.status}).`;
  try {
    if (contentType.includes('application/json')) {
      const body = (await response.json()) as { message?: string; thongBao?: string };
      message = body.message || body.thongBao || message;
    } else {
      const body = await response.text();
      if (body.trim()) message = body;
    }
  } catch {
    // Giữ thông báo HTTP mặc định khi response không đọc được.
  }
  throw new Error(message);
}

async function searchPatients(params: URLSearchParams): Promise<BenhNhanTimKiemTaiQuay[]> {
  const response = await fetch(`/api/luotkham/tiep-nhan/tim-benh-nhan?${params.toString()}`, {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  return readResponse<BenhNhanTimKiemTaiQuay[]>(response);
}

export function timBenhNhanTheoSoDienThoai(soDienThoai: string) {
  const params = new URLSearchParams({ soDienThoai: soDienThoai.trim() });
  return searchPatients(params);
}

export function timBenhNhanTheoHoTenVaNgaySinh(hoTen: string, ngaySinh: string) {
  const params = new URLSearchParams({ hoTen: hoTen.trim(), ngaySinh });
  return searchPatients(params);
}

export async function kiemTraKhungGio(maBacSi: string, ngayKham: string, gioKham: string) {
  const response = await fetch('/api/lichkham/kiem-tra-trong', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ maBacSi: maBacSi.trim(), ngayKham, gioKham }),
  });
  return readResponse<LichKhamKiemTraTrongResponse>(response);
}

export async function datLichKhamTaiQuay(request: LichKhamDatTaiQuayRequest) {
  const response = await fetch('/api/lichkham/dat-tai-quay', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(request),
  });
  return readResponse<LichKhamDatTaiQuayResponse>(response);
}
