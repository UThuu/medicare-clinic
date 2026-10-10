import type { MedicalRecordResponse } from '../types/MedicalRecord';

export function getExaminationBlockReason(record: MedicalRecordResponse): string | null {
    const visit = record.luotKhamHienTai;
    if (!visit) return 'Bệnh nhân chưa được tiếp nhận.';
    if (!['CHO_KHAM', 'DANG_KHAM'].includes(visit.trangThai)) return 'Lượt khám đã hoàn tất hoặc không thể chỉnh sửa.';
    const vitals = record.sinhHieuHienTai;
    if (!vitals || vitals.idLuotKhamNguon !== visit.idLuotKham) {
        return 'Cần ghi nhận sinh hiệu của lượt khám hiện tại trước khi khám.';
    }
    if (![vitals.huyetApTamThu, vitals.huyetApTamTruong, vitals.canNang, vitals.nhietDo]
        .every(value => Number.isFinite(value) && value > 0)) return 'Sinh hiệu lượt khám hiện tại chưa đầy đủ.';
    return null;
}

export function getSavedExam(record: MedicalRecordResponse) {
    return {
        trieuChung: record.luotKhamHienTai?.trieuChung || '',
        ketQuaKham: record.luotKhamHienTai?.ketQuaKham || '',
        chanDoan: record.luotKhamHienTai?.chanDoan || '',
    };
}
