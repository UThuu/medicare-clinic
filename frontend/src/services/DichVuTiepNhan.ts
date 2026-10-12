import type {
    BenhNhanTiepNhan,
    LichKhamTiepNhan,
    PhanHoiTiepNhanBenhNhan,
    TiepNhanBenhNhanRequest,
} from "../types/TiepNhanBenhNhan";

const DIA_CHI_API = "/api";

async function goiApi<T>(duongDan: string, options: RequestInit = {}): Promise<T> {
    let phanHoi: Response;

    try {
        phanHoi = await fetch(`${DIA_CHI_API}${duongDan}`, {
            ...options,
            credentials: "include",
            headers: {
                Accept: "application/json",
                ...options.headers,
            },
        });
    } catch {
        throw new Error(
            "Không thể kết nối backend. Hãy kiểm tra backend đang chạy tại cổng 8080 và cấu hình CORS."
        );
    }

    if (!phanHoi.ok) {
        const noiDung = await phanHoi.text();

        throw new Error(
            noiDung || `Yêu cầu thất bại (HTTP ${phanHoi.status}).`
        );
    }

    return phanHoi.json() as Promise<T>;
}

export function timBenhNhanTheoSoDienThoai(
    soDienThoai: string
): Promise<BenhNhanTiepNhan[]> {
    const query = new URLSearchParams({ soDienThoai });

    return goiApi<BenhNhanTiepNhan[]>(
        `/luotkham/tiep-nhan/tim-benh-nhan?${query.toString()}`
    );
}

export function timBenhNhanTheoHoTenVaNgaySinh(
    hoTen: string,
    ngaySinh: string
): Promise<BenhNhanTiepNhan[]> {
    const query = new URLSearchParams({ hoTen, ngaySinh });

    return goiApi<BenhNhanTiepNhan[]>(
        `/luotkham/tiep-nhan/tim-benh-nhan?${query.toString()}`
    );
}

export function layLichKhamHomNay(
    idBenhNhan: string
): Promise<LichKhamTiepNhan[]> {
    return goiApi<LichKhamTiepNhan[]>(
        `/luotkham/tiep-nhan/benh-nhan/${encodeURIComponent(idBenhNhan)}/lich-hom-nay`
    );
}

export function tiepNhanBenhNhan(
    duLieu: TiepNhanBenhNhanRequest
): Promise<PhanHoiTiepNhanBenhNhan> {
    return goiApi<PhanHoiTiepNhanBenhNhan>(
        "/luotkham/tiep-nhan",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(duLieu),
        }
    );
}