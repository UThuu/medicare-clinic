import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MainLayout } from '../components/layout/MainLayout';
import { Button } from '../components/common/Button';
import { PatientSummary } from '../components/common/PatientSummary';
import { medicalRecordService } from '../services/medicalRecordService';
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
                const data = await medicalRecordService.getMedicalRecord(idLuotKham);
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

    const { benhNhan, lichKhamHienTai, luotKhamHienTai, sinhHieuMoiNhat, diUng, lichSuKham } = record;

    const formatDateTime = (isoStr: string) => {
        if (!isoStr) return '...';
        if (!isoStr.includes('T')) return isoStr;
        const parts = isoStr.split('T');
        return `${parts[1]} ${parts[0]}`;
    };

    const renderHistoryTable = () => (
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
                    lichSuKham.map((ls, idx) => (
                        <tr key={idx}>
                            <td>{ls.ngayKham}</td>
                            <td>{ls.tenBacSi}</td>
                            <td>{ls.lyDoKham}</td>
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
    );

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
                        idBenhNhan={benhNhan?.idBenhNhan || ''}
                        hoTen={benhNhan?.hoTen || ''}
                        ngaySinh={benhNhan?.ngaySinh || ''}
                        gioiTinh={benhNhan?.gioiTinh || 'NAM'}
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
                                        diUng.map((du, idx) => (
                                            <div key={idx} className="allergy-badge">
                                                {du.thanhPhan} - {du.ghiChu}
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
                                                    <div className="vital-box">{sinhHieuMoiNhat.huyetApTamThu}/{sinhHieuMoiNhat.huyetApTamTruong}</div>
                                                    <span className="vital-unit">mmHg</span>
                                                </div>
                                                <div className="vital-item">
                                                    <span className="vital-label">Nhiệt độ</span>
                                                    <div className="vital-box">{sinhHieuMoiNhat.nhietDo}</div>
                                                    <span className="vital-unit">°C</span>
                                                </div>
                                                <div className="vital-item">
                                                    <span className="vital-label">Cân nặng</span>
                                                    <div className="vital-box">{sinhHieuMoiNhat.canNang}</div>
                                                    <span className="vital-unit">kg</span>
                                                </div>
                                            </div>
                                            <div className="vital-time">Đo lúc: {formatDateTime(sinhHieuMoiNhat.thoiDiemDo)}</div>
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
                                                <span className="value-text">{lichKhamHienTai?.ngayKham || '...'}</span>
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
                                    {renderHistoryTable()}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'lich_su' && (
                    <div className="bottom-row">
                        <div className="card history-card" style={{ flex: 1 }}>
                            <div className="card-header">
                                <h3>LỊCH SỬ KHÁM</h3>
                            </div>
                            <div className="card-body">
                                {renderHistoryTable()}
                            </div>
                        </div>
                    </div>
                )}

                                {activeTab === 'sinh_hieu' && (
                    <div className="bottom-row">
                        <div className="card history-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div className="card-header">
                                <h3>THÔNG TIN SINH HIỆU</h3>
                            </div>
                            <div className="card-body" style={{ padding: '1.5rem', display: 'flex', gap: '2rem', overflowY: 'auto' }}>
                                
                                {/* Cột Sinh hiệu hiện tại */}
                                <div style={{ flex: 1, backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <h4 style={{ color: '#0f766e', marginBottom: '1rem', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.5rem' }}>
                                        Sinh hiệu hiện tại
                                        <span style={{ display: 'block', fontSize: '0.75em', color: '#64748b', marginTop: '4px', fontWeight: 'normal' }}>
                                            (Theo lượt khám đang chọn)
                                        </span>
                                    </h4>
                                    
                                    {!record?.sinhHieuHienTai ? (
                                        <div style={{ color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', padding: '2rem 0' }}>
                                            Chưa ghi nhận sinh hiệu cho lượt khám này
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ color: '#475569', fontWeight: '500' }}>Huyết áp:</span>
                                                <span style={{ fontWeight: '600' }}>
                                                    {record.sinhHieuHienTai.huyetApTamThu && record.sinhHieuHienTai.huyetApTamTruong 
                                                        ? `${record.sinhHieuHienTai.huyetApTamThu}/${record.sinhHieuHienTai.huyetApTamTruong} mmHg` 
                                                        : <span style={{ color: '#94a3b8', fontStyle: 'italic', fontWeight: 'normal' }}>Chưa đo</span>}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ color: '#475569', fontWeight: '500' }}>Nhiệt độ:</span>
                                                <span style={{ fontWeight: '600' }}>
                                                    {record.sinhHieuHienTai.nhietDo 
                                                        ? `${record.sinhHieuHienTai.nhietDo} °C` 
                                                        : <span style={{ color: '#94a3b8', fontStyle: 'italic', fontWeight: 'normal' }}>Chưa đo</span>}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ color: '#475569', fontWeight: '500' }}>Cân nặng:</span>
                                                <span style={{ fontWeight: '600' }}>
                                                    {record.sinhHieuHienTai.canNang 
                                                        ? `${record.sinhHieuHienTai.canNang} kg` 
                                                        : <span style={{ color: '#94a3b8', fontStyle: 'italic', fontWeight: 'normal' }}>Chưa đo</span>}
                                                </span>
                                            </div>
                                            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed #cbd5e1', fontSize: '0.85em', color: '#64748b' }}>
                                                <strong>Thời điểm đo: </strong>
                                                {record.sinhHieuHienTai.thoiDiemDo ? formatDateTime(record.sinhHieuHienTai.thoiDiemDo) : 'Chưa ghi nhận'}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Cột Sinh hiệu mới nhất */}
                                <div style={{ flex: 1, backgroundColor: '#f0fdf4', padding: '1.5rem', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                                    <h4 style={{ color: '#166534', marginBottom: '1rem', borderBottom: '1px solid #bbf7d0', paddingBottom: '0.5rem' }}>
                                        Sinh hiệu gần nhất
                                        <span style={{ display: 'block', fontSize: '0.75em', color: '#15803d', marginTop: '4px', fontWeight: 'normal' }}>
                                            (Dữ liệu sinh hiệu mới nhất của bệnh nhân)
                                        </span>
                                    </h4>
                                    
                                    {!record?.sinhHieuMoiNhat ? (
                                        <div style={{ color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', padding: '2rem 0' }}>
                                            Chưa ghi nhận sinh hiệu nào trong lịch sử
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ color: '#475569', fontWeight: '500' }}>Huyết áp:</span>
                                                <span style={{ fontWeight: '600' }}>
                                                    {record.sinhHieuMoiNhat.huyetApTamThu && record.sinhHieuMoiNhat.huyetApTamTruong 
                                                        ? `${record.sinhHieuMoiNhat.huyetApTamThu}/${record.sinhHieuMoiNhat.huyetApTamTruong} mmHg` 
                                                        : <span style={{ color: '#94a3b8', fontStyle: 'italic', fontWeight: 'normal' }}>Chưa đo</span>}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ color: '#475569', fontWeight: '500' }}>Nhiệt độ:</span>
                                                <span style={{ fontWeight: '600' }}>
                                                    {record.sinhHieuMoiNhat.nhietDo 
                                                        ? `${record.sinhHieuMoiNhat.nhietDo} °C` 
                                                        : <span style={{ color: '#94a3b8', fontStyle: 'italic', fontWeight: 'normal' }}>Chưa đo</span>}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ color: '#475569', fontWeight: '500' }}>Cân nặng:</span>
                                                <span style={{ fontWeight: '600' }}>
                                                    {record.sinhHieuMoiNhat.canNang 
                                                        ? `${record.sinhHieuMoiNhat.canNang} kg` 
                                                        : <span style={{ color: '#94a3b8', fontStyle: 'italic', fontWeight: 'normal' }}>Chưa đo</span>}
                                                </span>
                                            </div>
                                            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed #bbf7d0', fontSize: '0.85em', color: '#15803d' }}>
                                                <strong>Thời điểm đo: </strong>
                                                {record.sinhHieuMoiNhat.thoiDiemDo ? formatDateTime(record.sinhHieuMoiNhat.thoiDiemDo) : 'Chưa ghi nhận'}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'don_thuoc' && (
                    <div className="bottom-row">
                        <div className="card history-card" style={{ flex: 1 }}>
                            <div className="card-header">
                                <h3>ĐƠN THUỐC ĐÃ KÊ</h3>
                            </div>
                            <div className="card-body" style={{ padding: '1rem' }}>
                                <p style={{ color: '#64748B' }}>Tính năng hiển thị chi tiết đơn thuốc đang được cập nhật.</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'di_ung' && (
                    <div className="bottom-row">
                        <div className="card history-card" style={{ flex: 1 }}>
                            <div className="card-header">
                                <h3>CHI TIẾT DỊ ỨNG</h3>
                            </div>
                            <div className="card-body" style={{ padding: '1rem' }}>
                                {diUng?.length > 0 ? (
                                    diUng.map((du, idx) => (
                                        <div key={idx} className="allergy-badge" style={{ padding: '1rem', borderBottom: '1px solid #E2E8F0' }}>
                                            <strong>{du.thanhPhan}</strong>: {du.ghiChu}
                                        </div>
                                    ))
                                ) : (
                                    <p style={{ color: '#64748B' }}>Chưa ghi nhận dị ứng</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};
