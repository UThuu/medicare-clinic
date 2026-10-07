import type {
    GhiNhanSinhHieuRequest,
    CapNhatSinhHieuRequest,
    PhanHoiSinhHieu,
} from "../types/SinhHieu";

const DIA_CHI_API = "http://localhost:8080/api";

// =========================================================
// UC03 - GHI NHẬN SINH HIỆU
// =========================================================

export async function ghiNhanSinhHieu(
    idLuotKham: string,
    duLieu: GhiNhanSinhHieuRequest
): Promise<PhanHoiSinhHieu> {

    const phanHoi = await fetch(
        `${DIA_CHI_API}/sinh-hieu/luot-kham/${encodeURIComponent(idLuotKham)}`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify(duLieu),
        }
    );

    if (!phanHoi.ok) {

        const noiDung = await phanHoi.text();

        throw new Error(
            noiDung || "Không thể lưu sinh hiệu."
        );
    }

    return phanHoi.json();
}

// =========================================================
// LẤY SINH HIỆU
// =========================================================

export async function laySinhHieu(
    idLuotKham: string
): Promise<PhanHoiSinhHieu | null> {

    const phanHoi = await fetch(
        `${DIA_CHI_API}/sinh-hieu/luot-kham/${encodeURIComponent(idLuotKham)}`
    );

    if (phanHoi.status === 204) {
        return null;
    }

    if (!phanHoi.ok) {

        throw new Error(
            "Không thể tải thông tin sinh hiệu."
        );
    }

    return phanHoi.json();
}

// =========================================================
// UC05 - CẬP NHẬT SINH HIỆU
// =========================================================

export async function capNhatSinhHieu(
    idLuotKham: string,
    duLieu: CapNhatSinhHieuRequest
): Promise<PhanHoiSinhHieu> {

    const phanHoi = await fetch(
        `${DIA_CHI_API}/sinh-hieu/luot-kham/${encodeURIComponent(idLuotKham)}`,
        {
            method: "PUT",

            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify(duLieu),
        }
    );

    if (!phanHoi.ok) {

        const noiDung = await phanHoi.text();

        throw new Error(
            noiDung || "Không thể cập nhật sinh hiệu."
        );
    }

    return phanHoi.json();
}