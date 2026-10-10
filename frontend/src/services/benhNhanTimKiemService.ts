import type {
  BenhNhanTimKiemRequest,
  BenhNhanTimKiemResponse,
} from '../types/BenhNhanTimKiem';

/** Tìm hồ sơ bệnh nhân theo API UC28. Session cookie được gửi kèm để backend kiểm tra vai trò Lễ tân. */
export async function timKiemHoSoBenhNhan(
  request: BenhNhanTimKiemRequest,
): Promise<BenhNhanTimKiemResponse> {
  const response = await fetch('/api/benhnhan/tim-kiem', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const raw = await response.text();
    let message = raw;
    try {
      const parsed = JSON.parse(raw) as { message?: string; error?: string };
      message = parsed.message || parsed.error || raw;
    } catch {
      // Backend có thể trả về text thay vì JSON khi lỗi.
    }

    if (response.status === 401) {
      throw new Error(message || 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    }
    if (response.status === 403) {
      throw new Error(message || 'Chức năng này chỉ dành cho tài khoản Lễ tân.');
    }
    if (response.status === 400) {
      throw new Error(message || 'Thông tin tìm kiếm chưa hợp lệ.');
    }
    throw new Error(message || `Không thể tìm kiếm hồ sơ (HTTP ${response.status}).`);
  }

  return response.json() as Promise<BenhNhanTimKiemResponse>;
}
