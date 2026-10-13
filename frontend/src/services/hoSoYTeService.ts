import type { HoSoYTeCaNhanResponse } from '../types/hoSoYTe';

/**
 * Lấy toàn bộ hồ sơ y tế cá nhân của bệnh nhân đang đăng nhập (UC-26).
 * Backend tự động xác định danh tính bệnh nhân từ phiên đăng nhập (UC-01).
 */
export async function layHoSoYTeCaNhan(): Promise<HoSoYTeCaNhanResponse> {
  const response = await fetch('/api/benhnhan/ho-so-y-te', {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const raw = await response.text();
    let message = raw;
    try {
      const parsed = JSON.parse(raw) as { message?: string; error?: string };
      message = parsed.message || parsed.error || raw;
    } catch {
      // ignore parse error
    }

    if (response.status === 401) {
      throw new Error(message || 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
    }
    if (response.status === 403) {
      throw new Error(message || 'Bạn không có quyền truy cập hồ sơ y tế này.');
    }
    if (response.status === 404) {
      throw new Error(message || 'Không tìm thấy hồ sơ y tế của bạn.');
    }
    throw new Error(message || `Lỗi khi tải hồ sơ y tế (${response.status}).`);
  }

  return response.json() as Promise<HoSoYTeCaNhanResponse>;
}
