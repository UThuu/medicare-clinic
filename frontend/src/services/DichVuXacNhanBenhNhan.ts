import type {
    XacNhanBenhNhanRequest,
    PhanHoiXacNhanBenhNhan,
} from "../types/XacNhanBenhNhan";

const DIA_CHI_API = "http://localhost:8080/api";

export async function xacNhanBenhNhan(
    idLuotKham: string,
    duLieu: XacNhanBenhNhanRequest
): Promise<PhanHoiXacNhanBenhNhan> {
    let phanHoi: Response;

    try {
        phanHoi = await fetch(
            `${DIA_CHI_API}/luotkham/${encodeURIComponent(idLuotKham)}/xac-nhan`,
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
            "Không thể kết nối backend. Hãy kiểm tra backend đang chạy và cấu hình CORS."
        );
    }

    if (!phanHoi.ok) {
        const noiDung = await phanHoi.text();

        throw new Error(
            noiDung || `Không thể xác nhận bệnh nhân (HTTP ${phanHoi.status}).`
        );
    }

    return phanHoi.json();
}