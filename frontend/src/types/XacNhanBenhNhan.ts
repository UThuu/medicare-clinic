import type { TrangThaiLuotKham } from "./LuotKham";

export interface XacNhanBenhNhanRequest {
    idBenhNhan: string;
    idLichKham: string;
}

export interface XacNhanBenhNhanResponse {
    xacNhan: boolean;
    idLuotKham: string;
    idLichKham: string;
    idBenhNhan: string;
    hoTen: string;
    ngaySinh: string;
    gioiTinh: string;
    soDienThoai: string;
    ngayKham: string;
    gioKham: string;
    trangThai: TrangThaiLuotKham;
}