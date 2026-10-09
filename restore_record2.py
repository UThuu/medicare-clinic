import os

patient_record_content = """import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MainLayout } from '../components/layout/MainLayout';
import { Button } from '../components/common/Button';
import { PatientSummary } from '../components/common/PatientSummary';
import { getMedicalRecordByLichKhamId } from '../services/medicalRecordService';
import { MedicalRecordResponse } from '../types/MedicalRecord';
import './patientRecord.css';

export const PatientRecord: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const idLuotKham = id || '';
    const { user } = useAuth();
    const navigate = useNavigate();

    const [record, setRecord] = useState<MedicalRecordResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('tong_quan');

    useEffect(() => {
        if (!idLuotKham) return;
        const fetchRecord = async () => {
            try {
                setLoading(true);
                const data = await getMedicalRecordByLichKhamId(idLuotKham);
                setRecord(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching record:', err);
                setError('Không thể tải hồ sơ bệnh nhân');
            } finally {
                setLoading(false);
            }
        };
        fetchRecord();
    }, [idLuotKham]);

    if (loading) {
        return (
            <MainLayout
                doctorName={user?.hoTen || ''}
                roleLabel={user?.vaiTro === 'BAC_SI' ? 'Bác sĩ' : user?.vaiTro || ''}
                sidebarItems={[
                    { label: 'Dashboard', href: '/staff' },
                    { label: 'Lịch khám', href: '/staff/schedules', active: true }
                ]}
            >
                <div style={{ padding: '2rem' }}>Đang tải...</div>
            </MainLayout>
        );
    }

    if (error || !record) {
        return (
            <MainLayout
                doctorName={user?.hoTen || ''}
                roleLabel={user?.vaiTro === 'BAC_SI' ? 'Bác sĩ' : user?.vaiTro || ''}
                sidebarItems={[
                    { label: 'Dashboard', href: '/staff' },
                    { label: 'Lịch khám', href: '/staff/schedules', active: true }
                ]}
            >
                <div style={{ padding: '2rem' }}>
                    <p>{error || 'Hồ sơ không tồn tại'}</p>
                    <Button variant="secondary" onClick={() => navigate('/staff/schedules')}>
                        Quay lại
                    </Button>
                </div>
            </MainLayout>
        );
    }

    const { benhNhan, luotKhamHienTai, sinhHieuMoiNhat, diUng, lichSuKham } = record;

    return (
        <MainLayout
            doctorName={user?.hoTen || ''}
            roleLabel={user?.vaiTro === 'BAC_SI' ? 'Bác sĩ' : user?.vaiTro || ''}
            sidebarItems={[
                { label: 'Dashboard', href: '/staff' },
                { label: 'Lịch khám', href: '/staff/schedules', active: true }
            ]}
        >
            <style dangerouslySetInnerHTML={{ __html: ".mc-shell { height: calc(100vh - 64px); overflow: hidden; } .mc-main { padding: 0 !important; display: flex; flex-direction: column; overflow: hidden; height: 100%; }" }}></style>
            <div className="patient-record-container">
                <div className="breadcrumb">
                    <span className="back-link" onClick={() => navigate('/staff/schedules')}>Lịch khám</span>
                    <span className="separator">›</span>
                    <span className="current">Hồ sơ bệnh nhân</span>
                </div>

                <div className="patient-summary-wrapper">
                    <PatientSummary
                        idBenhNhan={benhNhan?.idBenhNhan || benhNhan?.id || ''}
                        hoTen={benhNhan?.hoTen || ''}
                        ngaySinh={benhNhan?.ngaySinh || ''}
                        gioiTinh={benhNhan?.gioiTinh || ''}
                        soDienThoai={benhNhan?.soDienThoai || ''}
                        diaChi={benhNhan?.diaChi || ''}
                    />
                </div>

                <div className="tabs-header">
                    <div className={`tab-item ${activeTab === 'tong_quan' ? 'active' : ''}`} onClick={() => setActiveTab('tong_quan')}>Tổng quan</div>
                    <div className={`tab-item ${activeTab === 'sinh_hieu' ? 'active' : ''}`} onClick={() => setActiveTab('sinh_hieu')}>Sinh hiệu</div>
                    <div className={`tab-item ${activeTab === 'lich_su' ? 'active' : ''}`} onClick={() => setActiveTab('lich_su')}>Lịch sử khám</div>
                    <div className={`tab-item ${activeTab === 'don_thuoc' ? 'active' : ''}`} onClick={() => setActiveTab('don_thuoc')}>Đơn thuốc</div>
                    <div className={`tab-item ${activeTab === 'di_ung' ? 'active' : ''}`} onClick={() => setActiveTab('di_ung')}>Dị ứng</div>
                </div>

                {activeTab === 'tong_quan' && (
                    <>
                        <div className="top-row">
                            <div className="card allergy-card">
                                <div className="card-header">
                                    <h3 style={{ color: diUng?.length > 0 ? '#E11D48' : '#0F8B8D' }}>
                                        {diUng?.length > 0 ? '⚠ DỊ ỨNG ĐÃ GHI NHẬN' : 'DỊ ỨNG'}
                                    </h3>
                                </div>
                                <div className="card-body">
                                    {diUng?.length > 0 ? (
                                        diUng.map((du: any, idx: number) => (
                                            <div key={idx} className="allergy-badge">
                                                {du.tenDiUng || du.tenThanhPhan || du.thanhPhan} - {du.mucDo}
                                            </div>
                                        ))
                                    ) : (
                                        <p style={{ color: '#64748B' }}>Chưa ghi nhận dị ứng</p>
                                    )}
                                </div>
                            </div>

                            <div className="card vitals-card">
                                <div className="card-header">
                                    <h3>SINH HIỆU MỚI NHẤT</h3>
                                </div>
                                <div className="card-body">
                                    {sinhHieuMoiNhat ? (
                                        <>
                                            <div className="vitals-grid">
                                                <div className="vital-item">
                                                    <span className="vital-label">Huyết áp</span>
                                                    <div className="vital-box">{sinhHieuMoiNhat.huyetApTamThu || sinhHieuMoiNhat.huyetAp || 120}/{sinhHieuMoiNhat.huyetApTamTruong || 80}</div>
                                                    <span className="vital-unit">mmHg</span>
                                                </div>
                                                <div className="vital-item">
                                                    <span className="vital-label">Nhiệt độ</span>
                                                    <div className="vital-box">{sinhHieuMoiNhat.nhietDo || 37}</div>
                                                    <span className="vital-unit">°C</span>
                                                </div>
                                                <div className="vital-item">
                                                    <span className="vital-label">Cân nặng</span>
                                                    <div className="vital-box">{sinhHieuMoiNhat.canNang || 60}</div>
                                                    <span className="vital-unit">kg</span>
                                                </div>
                                            </div>
                                            <div className="vital-time">Đo lúc: {sinhHieuMoiNhat.thoiGianDo || sinhHieuMoiNhat.ngayDo || '...'}</div>
                                        </>
                                    ) : (
                                        <p style={{ color: '#64748B' }}>Chưa có sinh hiệu</p>
                                    )}
                                </div>
                            </div>

                            <div className="card visit-card">
                                <div className="card-header">
                                    <h3>LƯỢT KHÁM HIỆN TẠI</h3>
                                </div>
                                <div className="card-body">
                                    {luotKhamHienTai ? (
                                        <div className="lkh-grid">
                                            <div className="form-group-inline">
                                                <label>Mã LK</label>
                                                <span className="value-text">{idLuotKham}</span>
                                            </div>
                                            <div className="form-group-inline">
                                                <label>Thời gian</label>
                                                <span className="value-text">{luotKhamHienTai.thoiGianBatDau || luotKhamHienTai.ngayKham || '...'}</span>
                                            </div>
                                            <div className="form-group-inline">
                                                <label>Lý do</label>
                                                <span className="value-text">{luotKhamHienTai.lyDoKham || '...'}</span>
                                            </div>
                                            <div className="form-group-inline">
                                                <label>Chẩn đoán</label>
                                                <span className="value-text">{luotKhamHienTai.chanDoan || '...'}</span>
                                            </div>
                                            <div className="form-group-inline" style={{ gridColumn: '1 / span 2' }}>
                                                <label>Trạng thái</label>
                                                <span className="value-text" style={{ color: luotKhamHienTai.trangThai === 'HOAN_TAT' ? '#0F8B8D' : '#F59E0B', fontWeight: 600 }}>
                                                    {luotKhamHienTai.trangThai === 'HOAN_TAT' ? 'Hoàn tất' : 'Đang khám'}
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <p style={{ color: '#64748B' }}>Không có thông tin lượt khám hiện tại</p>
                                    )}
                                </div>
                                <div className="card-footer">
                                    <button className="btn-large w-full" disabled style={{ opacity: 0.5 }}>
                                        Ghi nhận kết quả khám
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="bottom-row">
                            <div className="card history-card">
                                <div className="card-header">
                                    <h3>LỊCH SỬ KHÁM GẦN ĐÂY</h3>
                                </div>
                                <div className="card-body">
                                    <table className="mc-table">
                                        <thead>
                                            <tr>
                                                <th>Ngày khám</th>
                                                <th>Bác sĩ</th>
                                                <th>Lý do khám</th>
                                                <th>Chẩn đoán</th>
                                                <th>Trạng thái</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {lichSuKham?.length > 0 ? (
                                                lichSuKham.map((ls: any, idx: number) => (
                                                    <tr key={idx}>
                                                        <td>{ls.ngayKham || ls.thoiGianBatDau}</td>
                                                        <td>{ls.bacSiKham || ls.hoTenBacSi || ls.tenBacSi || '...'}</td>
                                                        <td>{ls.lyDoKham || '...'}</td>
                                                        <td>{ls.chanDoan || 'Không bệnh'}</td>
                                                        <td>
                                                            <span style={{ color: ls.trangThai === 'HOAN_TAT' ? '#0F8B8D' : '#F59E0B', fontWeight: 600 }}>
                                                                {ls.trangThai === 'HOAN_TAT' ? 'Hoàn tất' : 'Đang khám'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr><td colSpan={5} style={{ textAlign: 'center' }}>Không có lịch sử khám</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </MainLayout>
    );
};
"""

with open('frontend/src/pages/PatientRecord.tsx', 'w', encoding='utf-8') as file:
    file.write(patient_record_content)
