import type {
    XacNhanBenhNhanRequest,
    PhanHoiXacNhanBenhNhan,
} from "../types/XacNhanBenhNhan";

const DIA_CHI_API = "/api";

export async function xacNhanBenhNhan(
    idLuotKham: string,
    duLieu: XacNhanBenhNhanRequest
): Promise<PhanHoiXacNhanBenhNhan> {

    const phanHoi = await fetch(
        `${DIA_CHI_API}/luotkham/${encodeURIComponent(idLuotKham)}/xac-nhan`,
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
            noiDung || "Không thể xác nhận bệnh nhân."
        );
    }

    return phanHoi.json();
}