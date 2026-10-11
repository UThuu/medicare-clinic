import React from 'react';
import { StatusBadge } from './StatusBadge';

export interface PatientSummaryProps {
    idBenhNhan: string;
    hoTen: string;
    ngaySinh: string;
    gioiTinh: string;
    soDienThoai: string;
    diaChi: string;
    trangThaiLuotKham?: string;
}

export const PatientSummary: React.FC<PatientSummaryProps> = ({
    idBenhNhan, hoTen, ngaySinh, gioiTinh, soDienThoai, diaChi, trangThaiLuotKham
}) => {
    const calculateAge = (dob: string) => {
        const diff_ms = Date.now() - new Date(dob).getTime();
        const age_dt = new Date(diff_ms); 
        return Math.abs(age_dt.getUTCFullYear() - 1970);
    };

    return (
        <div className="mc-patient-summary">
            <div className="mc-patient-summary__header">
                <span className="mc-patient-summary__badge">BỆNH NHÂN</span>
                {trangThaiLuotKham && (
                    <StatusBadge tone={trangThaiLuotKham === "HOAN_TAT" ? "success" : trangThaiLuotKham === "DANG_KHAM" ? "warning" : "info"}>{trangThaiLuotKham === "HOAN_TAT" ? "Hoàn tất" : trangThaiLuotKham === "DANG_KHAM" ? "Đang khám" : trangThaiLuotKham === "CHO_KHAM" ? "Chờ khám" : trangThaiLuotKham === "DA_TIEP_NHAN" ? "Đã tiếp nhận" : "Đã hủy"}</StatusBadge>
                )}
            </div>
            
            <div className="mc-patient-summary__content">
                <div className="mc-patient-summary__avatar">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                </div>
                
                <div className="mc-patient-summary__details">
                    <h2 className="mc-patient-summary__name">{hoTen}</h2>
                    <div className="mc-patient-summary__meta-row">
                        <div className="mc-patient-summary__meta-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <rect x="3" y="4" width="18" height="16" rx="2" ry="2"></rect>
                                <line x1="7" y1="8" x2="11" y2="8"></line>
                                <line x1="7" y1="12" x2="17" y2="12"></line>
                                <line x1="7" y1="16" x2="17" y2="16"></line>
                            </svg>
                            <span>{idBenhNhan}</span>
                        </div>
                        <div className="mc-patient-summary__meta-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <circle cx="12" cy="10" r="4"></circle>
                                <line x1="12" y1="14" x2="12" y2="21"></line>
                                <line x1="9" y1="18" x2="15" y2="18"></line>
                            </svg>
                            <span>{gioiTinh === 'NAM' ? 'Nam' : 'Nữ'}</span>
                        </div>
                        <div className="mc-patient-summary__meta-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            <span>{calculateAge(ngaySinh)} tuổi</span>
                        </div>
                        <div className="mc-patient-summary__meta-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                            </svg>
                            <span>{soDienThoai}</span>
                        </div>
                        <div className="mc-patient-summary__meta-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            <span>{diaChi}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
