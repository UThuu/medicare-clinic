
export interface PatientInfo {
    idBenhNhan: string;
    hoTen: string;
    ngaySinh: string;
    gioiTinh: 'NAM' | 'NU';
    soDienThoai: string;
    diaChi: string;
}

export interface CurrentScheduleInfo {
    idLichKham: string;
    ngayKham: string;
    gioKham: string;
    trangThai: string;
}

export interface CurrentVisitInfo {
    idLuotKham: string;
    trangThai: string;
    lyDoKham: string;
    trieuChung: string;
    chanDoan: string;
    ketQuaKham: string;
}

export interface VitalsInfo {
    idLuotKhamNguon?: string;
    huyetApTamThu: number;
    huyetApTamTruong: number;
    canNang: number;
    nhietDo: number;
    thoiDiemDo: string;
}

export interface AllergyInfo {
    thanhPhan: string;
    ghiChu: string;
}

export interface VisitHistoryInfo {
    idLuotKham: string;
    ngayKham: string;
    tenBacSi: string;
    lyDoKham: string;
    trangThai: string;
    chanDoan: string;
    ketQuaKham: string;
    coDonThuoc: boolean;
    idDonThuoc: string;
}

export interface MedicalRecordResponse {
    benhNhan: PatientInfo;
    lichKhamHienTai: CurrentScheduleInfo;
    luotKhamHienTai: CurrentVisitInfo | null;
    sinhHieuHienTai: VitalsInfo | null;
    sinhHieuMoiNhat: VitalsInfo | null;
    lichSuSinhHieu: VitalsInfo[];
    diUng: AllergyInfo[];
    lichSuKham: VisitHistoryInfo[];
}
