
import type {
    GhiNhanSinhHieuRequest,
    CapNhatSinhHieuRequest,
    PhanHoiSinhHieu,
} from "../types/SinhHieu";

const DIA_CHI_API = "/api";

// Xử lý lỗi phản hồi từ backend
async function xuLyLoi(phanHoi: Response, loiMacDinh: string): Promise<never> {
    const noiDung = await phanHoi.text();

    if (phanHoi.status === 401) {
        throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    }

    if (phanHoi.status === 403) {
        throw new Error("Tài khoản không có quyền thực hiện chức năng này.");
    }

    throw new Error(
        noiDung || `${loiMacDinh} (HTTP ${phanHoi.status}).`
    );
}

// UC03 - GHI NHẬN SINH HIỆU
export async function ghiNhanSinhHieu(
    idLuotKham: string,
    duLieu: GhiNhanSinhHieuRequest
): Promise<PhanHoiSinhHieu> {
    let phanHoi: Response;

    try {
        phanHoi = await fetch(
            `${DIA_CHI_API}/sinh-hieu/luot-kham/${encodeURIComponent(idLuotKham)}`,
            {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(duLieu),
            }
        );
    } catch {
        throw new Error(
            "Không thể kết nối backend. Vui lòng kiểm tra máy chủ."
        );
    }

    if (!phanHoi.ok) {
        return xuLyLoi(phanHoi, "Không thể lưu sinh hiệu");
    }

    return (await phanHoi.json()) as PhanHoiSinhHieu;
}

// LẤY SINH HIỆU
export async function laySinhHieu(
    idLuotKham: string
): Promise<PhanHoiSinhHieu | null> {
    let phanHoi: Response;

    try {
        phanHoi = await fetch(
            `${DIA_CHI_API}/sinh-hieu/luot-kham/${encodeURIComponent(idLuotKham)}`,
            {
                method: "GET",
                credentials: "include",
                headers: {
                    Accept: "application/json",
                },
            }
        );
    } catch {
        throw new Error(
            "Không thể kết nối backend. Vui lòng kiểm tra máy chủ."
        );
    }

    if (phanHoi.status === 204) {
        return null;
    }

    if (!phanHoi.ok) {
        return xuLyLoi(phanHoi, "Không thể tải thông tin sinh hiệu");
    }

    return (await phanHoi.json()) as PhanHoiSinhHieu;
}

// UC05 - CẬP NHẬT SINH HIỆU
export async function capNhatSinhHieu(
    idLuotKham: string,
    duLieu: CapNhatSinhHieuRequest
): Promise<PhanHoiSinhHieu> {
    let phanHoi: Response;

    try {
        phanHoi = await fetch(
            `${DIA_CHI_API}/sinh-hieu/luot-kham/${encodeURIComponent(idLuotKham)}`,
            {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(duLieu),
            }
        );
    } catch {
        throw new Error(
            "Không thể kết nối backend. Vui lòng kiểm tra máy chủ."
        );
    }

    if (!phanHoi.ok) {
        return xuLyLoi(phanHoi, "Không thể cập nhật sinh hiệu");
    }

    return (await phanHoi.json()) as PhanHoiSinhHieu;
}
