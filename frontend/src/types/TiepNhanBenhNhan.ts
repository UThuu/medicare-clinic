export interface BenhNhanTiepNhan {
    idBenhNhan: string;
    hoTen: string;
    ngaySinh: string;
    gioiTinh: string;
    soDienThoai: string;
    diaChi?: string;
}

export interface LichKhamTiepNhan {
    idLichKham: string;
    idBenhNhan: string;
    hoTen: string;
    maBacSi: string;
    ngayKham: string;
    gioKham: string;
    trangThai: "DA_DAT" | "DA_TIEP_NHAN" | "DA_HUY";
    daCoLuotKham: boolean;
}

export interface TiepNhanBenhNhanRequest {
    idBenhNhan: string;
    idLichKham: string;
}

export interface PhanHoiTiepNhanBenhNhan {
    thanhCong: boolean;
    thongBao: string;

    idLuotKham: string;
    idLichKham: string;

    idBenhNhan: string;
    hoTen: string;

    ngayKham: string;
    gioKham: string;

    maBacSi: string;

    trangThaiLichKham: string;
    trangThaiLuotKham: string;
}