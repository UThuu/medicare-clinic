export type TrangThaiLuotKham =
    | "CHO_KHAM"
    | "DANG_KHAM"
    | "HOAN_TAT";

export interface BenhNhanCho {
    idLuotKham: string;
    idLichKham: string;
    idBenhNhan: string;

    hoTen: string;
    ngaySinh: string;
    gioiTinh: string;
    soDienThoai: string;

    ngayKham: string;
    gioKham: string;

    lyDoKham?: string;
    trieuChung?: string;

    trangThai: TrangThaiLuotKham;
}