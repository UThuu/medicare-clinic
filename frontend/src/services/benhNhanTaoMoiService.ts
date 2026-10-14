import type { BenhNhanTaoMoiRequest, BenhNhanTaoMoiResponse } from '../types/BenhNhanTaoMoi';
import type { BenhNhanTimKiemResponse } from '../types/BenhNhanTimKiem';

async function postPatientApi<T>(path: string, request: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(request),
    });
  } catch {
    throw new Error('Không thể kết nối tới máy chủ. Kiểm tra kết nối mạng.');
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || (response.status === 401
      ? 'Phiên đăng nhập đã hết hạn. Hãy đăng nhập lại.'
      : response.status === 403 ? 'Tài khoản hiện tại không có quyền thực hiện thao tác này.'
        : 'Không thể thực hiện thao tác. Vui lòng thử lại.'));
  }
  return payload as T;
}

export function taoHoSoBenhNhanMoi(request: BenhNhanTaoMoiRequest): Promise<BenhNhanTaoMoiResponse> {
  return postPatientApi('/api/benhnhan/tao-moi', request);
}

/** Exact normalized phone match; this check never writes patient data. */
export function kiemTraSoDienThoai(soDienThoai: string): Promise<BenhNhanTimKiemResponse> {
  return postPatientApi('/api/benhnhan/kiem-tra-so-dien-thoai', { soDienThoai });
}
