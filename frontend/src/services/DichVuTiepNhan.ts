import type {
    BenhNhanTiepNhan,
    LichKhamTiepNhan,
    PhanHoiTiepNhanBenhNhan,
    TiepNhanBenhNhanRequest,
} from "../types/TiepNhanBenhNhan";

const DIA_CHI_API = "http://localhost:8080/api";

export async function timBenhNhanTheoSoDienThoai(
    soDienThoai: string
): Promise<BenhNhanTiepNhan[]> {

    const phanHoi = await fetch(
        `${DIA_CHI_API}/luotkham/tiep-nhan/tim-benh-nhan?soDienThoai=${encodeURIComponent(
            soDienThoai
        )}`
    );

    if (!phanHoi.ok) {
        const noiDung = await phanHoi.text();

        throw new Error(
            noiDung || "Không thể tìm kiếm bệnh nhân."
        );
    }

    return phanHoi.json();
}


export async function timBenhNhanTheoHoTenVaNgaySinh(
    hoTen: string,
    ngaySinh: string
): Promise<BenhNhanTiepNhan[]> {

    const phanHoi = await fetch(
        `${DIA_CHI_API}/luotkham/tiep-nhan/tim-benh-nhan?hoTen=${encodeURIComponent(
            hoTen
        )}&ngaySinh=${encodeURIComponent(ngaySinh)}`
    );

    if (!phanHoi.ok) {
        const noiDung = await phanHoi.text();

        throw new Error(
            noiDung || "Không thể tìm kiếm bệnh nhân."
        );
    }

    return phanHoi.json();
}


export async function layLichKhamHomNay(
    idBenhNhan: string
): Promise<LichKhamTiepNhan[]> {

    const phanHoi = await fetch(
        `${DIA_CHI_API}/luotkham/tiep-nhan/benh-nhan/${encodeURIComponent(
            idBenhNhan
        )}/lich-hom-nay`
    );

    if (!phanHoi.ok) {
        const noiDung = await phanHoi.text();

        throw new Error(
            noiDung || "Không thể kiểm tra lịch khám."
        );
    }

    return phanHoi.json();
}


export async function tiepNhanBenhNhan(
    duLieu: TiepNhanBenhNhanRequest
): Promise<PhanHoiTiepNhanBenhNhan> {

    const phanHoi = await fetch(
        `${DIA_CHI_API}/luotkham/tiep-nhan`,
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
            noiDung || "Không thể tiếp nhận bệnh nhân."
        );
    }

    return phanHoi.json();
}