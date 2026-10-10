import type {
  BenhNhanTaoMoiRequest,
  BenhNhanTaoMoiResponse,
} from '../types/BenhNhanTaoMoi';

interface ApiErrorResponse {
  message?: string;
}

/** Tạo hồ sơ bệnh nhân mới qua API UC29. */
export async function taoHoSoBenhNhanMoi(
  request: BenhNhanTaoMoiRequest,
): Promise<BenhNhanTaoMoiResponse> {
  let response: Response;

  try {
    response = await fetch('/api/benhnhan/tao-moi', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(request),
    });
  } catch {
    throw new Error('Không thể kết nối tới máy chủ. Kiểm tra backend và kết nối mạng.');
  }

  const payload = (await response.json().catch(() => ({}))) as
    | BenhNhanTaoMoiResponse
    | ApiErrorResponse;

  if (!response.ok) {
    const message = 'message' in payload && payload.message
      ? payload.message
      : response.status === 401
        ? 'Phiên đăng nhập đã hết hạn. Hãy đăng nhập lại.'
        : response.status === 403
          ? 'Tài khoản hiện tại không có quyền tạo hồ sơ bệnh nhân.'
          : 'Không thể tạo hồ sơ bệnh nhân. Vui lòng thử lại.';
    throw new Error(message);
  }

  return payload as BenhNhanTaoMoiResponse;
}
