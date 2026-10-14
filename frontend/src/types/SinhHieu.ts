/** Request cho cả ghi nhận và cập nhật sinh hiệu. */
export interface SinhHieuRequest {
    huyetApTamThu: number;
    huyetApTamTruong: number;
    canNang: number;
    nhietDo: number;
}

export interface SinhHieuResponse {
    idSinhHieu: string;
    idLuotKham: string;
    maDieuDuong: string;
    huyetApTamThu: number;
    huyetApTamTruong: number;
    canNang: number;
    nhietDo: number;
    thoiDiemDo: string;
}
