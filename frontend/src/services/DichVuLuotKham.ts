import type { BenhNhanCho } from "../types/LuotKham";

const DIA_CHI_API = "http://localhost:8080/api";

export async function layDanhSachBenhNhanCho(
    ngayKham: string
): Promise<BenhNhanCho[]> {

    const phanHoi = await fetch(
        `${DIA_CHI_API}/luotkham/cho-kham?ngayKham=${encodeURIComponent(
            ngayKham
        )}`
    );

    if (!phanHoi.ok) {
        throw new Error(
            "Không thể tải danh sách bệnh nhân chờ."
        );
    }

    return phanHoi.json();
}