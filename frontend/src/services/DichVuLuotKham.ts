
import type { BenhNhanCho } from '../types/LuotKham';

const DIA_CHI_API = "/api";

export async function layDanhSachBenhNhanCho(
    ngayKham: string,
): Promise<BenhNhanCho[]> {
    let phanHoi: Response;

    try {
        phanHoi = await fetch(
            `${DIA_CHI_API}/luotkham/cho-kham?ngayKham=${encodeURIComponent(ngayKham)}`,
            {
                method: 'GET',
                credentials: 'include',
                headers: {
                    Accept: 'application/json',
                },
            },
        );
    } catch {
        throw new Error(
            'Không thể kết nối backend. Hãy kiểm tra máy chủ có đang chạy không.',
        );
    }

    if (!phanHoi.ok) {
        if (phanHoi.status === 401) {
            throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }

        if (phanHoi.status === 403) {
            throw new Error('Tài khoản không có quyền xem danh sách bệnh nhân chờ.');
        }

        throw new Error(
            `Không thể tải danh sách bệnh nhân chờ (HTTP ${phanHoi.status}).`,
        );
    }

    return (await phanHoi.json()) as BenhNhanCho[];
}
