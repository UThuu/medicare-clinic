export interface GhiNhanSinhHieuRequest {
    maDieuDuong: string;
    huyetApTamThu: number;
    huyetApTamTruong: number;
    canNang: number;
    nhietDo: number;
}

export interface PhanHoiSinhHieu {
    idSinhHieu: string;
    idLuotKham: string;
    maDieuDuong: string;

    huyetApTamThu: number;
    huyetApTamTruong: number;

    canNang: number;
    nhietDo: number;

    thoiDiemDo: string;
}

export interface CapNhatSinhHieuRequest {
    huyetApTamThu: number;
    huyetApTamTruong: number;
    canNang: number;
    nhietDo: number;
}