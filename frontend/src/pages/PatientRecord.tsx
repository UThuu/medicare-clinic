import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MainLayout } from '../components/layout/MainLayout';
import { Button } from '../components/common/Button';
import { PatientSummary } from '../components/common/PatientSummary';
import { medicalRecordService } from '../services/medicalRecordService';
import { MedicalRecordResponse } from '../types/MedicalRecord';
import { Modal } from '../components/common/Modal';
import { khamBenhService } from '../services/khamBenhService';

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

    const [isRecordingModalOpen, setIsRecordingModalOpen] = useState(false);
    const [trieuChung, setTrieuChung] = useState('');
    const [ketQuaKham, setKetQuaKham] = useState('');
    const [chanDoan, setChanDoan] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const handleOpenRecordModal = () => {
        setTrieuChung(record?.luotKhamHienTai?.trieuChung || '');
        setKetQuaKham(record?.luotKhamHienTai?.ketQuaKham || '');
        setChanDoan(record?.luotKhamHienTai?.chanDoan || '');
        setSaveError(null);
        setIsRecordingModalOpen(true);
    };

    const handleSaveRecord = async () => {
        if (!trieuChung.trim() || !ketQuaKham.trim() || !chanDoan.trim()) {
            setSaveError('Vui lòng nhập đầy đủ Triệu chứng, Kết quả khám và Chẩn đoán.');
            return;
        }
        setIsSaving(true);
        setSaveError(null);
        try {
            await khamBenhService.saveKetQuaKham({
                idLichKham: idLuotKham,
                trieuChung,
                ketQuaKham,
                chanDoan
            });
            setIsRecordingModalOpen(false);
            
            // Reload data after save
            try {
                setLoading(true);
                const data = await medicalRecordService.getMedicalRecord(idLuotKham);
                setRecord(data);
                setError(null);
            } catch (err) {
                console.error('Error reloading record:', err);
            } finally {
                setLoading(false);
            }

        } catch (err: any) {
            setSaveError(err.message || 'Có lỗi xảy ra khi lưu kết quả khám.');
        } finally {
            setIsSaving(false);
        }
    };


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
    
            <Modal
                open={isRecordingModalOpen}
                title="Ghi nhận kết quả khám"
                onClose={() => setIsRecordingModalOpen(false)}
                width="lg"
                footer={
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', width: '100%' }}>
                        <Button variant="ghost" onClick={() => setIsRecordingModalOpen(false)} disabled={isSaving}>
                            Hủy bỏ
                        </Button>
                        <Button variant="primary" onClick={handleSaveRecord} disabled={isSaving}>
                            {isSaving ? 'Đang lưu...' : 'Lưu kết quả'}
                        </Button>
                    </div>
                }
            >
                {saveError && (
                    <div style={{ padding: '12px', backgroundColor: '#FEF2F2', color: '#B91C1C', borderRadius: '6px', marginBottom: '16px', border: '1px solid #F87171' }}>
                        {saveError}
                    </div>
                )}
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                        <h4 style={{ margin: '0 0 12px 0', color: '#0F172A', fontSize: '1rem' }}>Thông tin bệnh nhân</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.9rem' }}>
                            <div><strong>Bệnh nhân:</strong> {record?.benhNhan?.hoTen}</div>
                            <div><strong>Mã BN:</strong> {record?.benhNhan?.idBenhNhan}</div>
                            <div><strong>Giới tính:</strong> {record?.benhNhan?.gioiTinh === 'NAM' ? 'Nam' : 'Nữ'}</div>
                            <div><strong>Năm sinh:</strong> {record?.benhNhan?.ngaySinh?.substring(0, 4)}</div>
                        </div>
                    </div>

                    <div className="mc-field">
                        <label className="mc-label">Triệu chứng <span className="mc-required">*</span></label>
                        <textarea 
                            className="mc-input" 
                            style={{ minHeight: '80px', resize: 'vertical' }}
                            value={trieuChung}
                            onChange={(e) => setTrieuChung(e.target.value)}
                            placeholder="Nhập triệu chứng của bệnh nhân..."
                        />
                    </div>
                    
                    <div className="mc-field">
                        <label className="mc-label">Kết quả khám <span className="mc-required">*</span></label>
                        <textarea 
                            className="mc-input" 
                            style={{ minHeight: '120px', resize: 'vertical' }}
                            value={ketQuaKham}
                            onChange={(e) => setKetQuaKham(e.target.value)}
                            placeholder="Nhập kết quả khám lâm sàng..."
                        />
                    </div>
                    
                    <div className="mc-field">
                        <label className="mc-label">Chẩn đoán <span className="mc-required">*</span></label>
                        <textarea 
                            className="mc-input" 
                            style={{ minHeight: '80px', resize: 'vertical' }}
                            value={chanDoan}
                            onChange={(e) => setChanDoan(e.target.value)}
                            placeholder="Nhập kết luận chẩn đoán..."
                        />
                    </div>
                </div>
            </Modal>
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
    
            <Modal
                open={isRecordingModalOpen}
                title="Ghi nhận kết quả khám"
                onClose={() => setIsRecordingModalOpen(false)}
                width="lg"
                footer={
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', width: '100%' }}>
                        <Button variant="ghost" onClick={() => setIsRecordingModalOpen(false)} disabled={isSaving}>
                            Hủy bỏ
                        </Button>
                        <Button variant="primary" onClick={handleSaveRecord} disabled={isSaving}>
                            {isSaving ? 'Đang lưu...' : 'Lưu kết quả'}
                        </Button>
                    </div>
                }
            >
                {saveError && (
                    <div style={{ padding: '12px', backgroundColor: '#FEF2F2', color: '#B91C1C', borderRadius: '6px', marginBottom: '16px', border: '1px solid #F87171' }}>
                        {saveError}
                    </div>
                )}
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                        <h4 style={{ margin: '0 0 12px 0', color: '#0F172A', fontSize: '1rem' }}>Thông tin bệnh nhân</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.9rem' }}>
                            <div><strong>Bệnh nhân:</strong> {record?.benhNhan?.hoTen}</div>
                            <div><strong>Mã BN:</strong> {record?.benhNhan?.idBenhNhan}</div>
                            <div><strong>Giới tính:</strong> {record?.benhNhan?.gioiTinh === 'NAM' ? 'Nam' : 'Nữ'}</div>
                            <div><strong>Năm sinh:</strong> {record?.benhNhan?.ngaySinh?.substring(0, 4)}</div>
                        </div>
                    </div>

                    <div className="mc-field">
                        <label className="mc-label">Triệu chứng <span className="mc-required">*</span></label>
                        <textarea 
                            className="mc-input" 
                            style={{ minHeight: '80px', resize: 'vertical' }}
                            value={trieuChung}
                            onChange={(e) => setTrieuChung(e.target.value)}
                            placeholder="Nhập triệu chứng của bệnh nhân..."
                        />
                    </div>
                    
                    <div className="mc-field">
                        <label className="mc-label">Kết quả khám <span className="mc-required">*</span></label>
                        <textarea 
                            className="mc-input" 
                            style={{ minHeight: '120px', resize: 'vertical' }}
                            value={ketQuaKham}
                            onChange={(e) => setKetQuaKham(e.target.value)}
                            placeholder="Nhập kết quả khám lâm sàng..."
                        />
                    </div>
                    
                    <div className="mc-field">
                        <label className="mc-label">Chẩn đoán <span className="mc-required">*</span></label>
                        <textarea 
                            className="mc-input" 
                            style={{ minHeight: '80px', resize: 'vertical' }}
                            value={chanDoan}
                            onChange={(e) => setChanDoan(e.target.value)}
                            placeholder="Nhập kết luận chẩn đoán..."
                        />
                    </div>
                </div>
            </Modal>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div className="breadcrumb" style={{ margin: 0 }}>
                        <span className="back-link" onClick={() => navigate('/staff/schedules')}>Lịch khám</span>
                        <span className="separator">›</span>
                        <span className="current">Hồ sơ bệnh nhân</span>
                    </div>
                    {record?.luotKhamHienTai && record.luotKhamHienTai.trangThai !== 'HOAN_TAT' && (
                        <Button variant="primary" onClick={handleOpenRecordModal}>
                            Ghi nhận kết quả khám
                        </Button>
                    )}
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
                                <h3>LỊCH SỬ SINH HIỆU</h3>
                            </div>
                            <div className="card-body" style={{ padding: '0', flex: 1, overflowY: 'auto' }}>
                                {!record?.lichSuSinhHieu || record.lichSuSinhHieu.length === 0 ? (
                                    <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontStyle: 'italic' }}>
                                        Chưa ghi nhận sinh hiệu nào trong lịch sử
                                    </div>
                                ) : (
                                    <table className="mc-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f8fafc', zIndex: 1 }}>
                                            <tr>
                                                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>Thời điểm đo</th>
                                                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>Huyết áp (mmHg)</th>
                                                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>Nhiệt độ (°C)</th>
                                                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>Cân nặng (kg)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {record.lichSuSinhHieu.map((sh, idx) => (
                                                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                    <td style={{ padding: '12px 16px' }}>{sh.thoiDiemDo ? formatDateTime(sh.thoiDiemDo) : <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Chưa ghi nhận</span>}</td>
                                                    <td style={{ padding: '12px 16px' }}>
                                                        {sh.huyetApTamThu && sh.huyetApTamTruong 
                                                            ? <strong>{sh.huyetApTamThu}/{sh.huyetApTamTruong}</strong> 
                                                            : <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Chưa đo</span>}
                                                    </td>
                                                    <td style={{ padding: '12px 16px' }}>
                                                        {sh.nhietDo 
                                                            ? <span>{sh.nhietDo}</span> 
                                                            : <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Chưa đo</span>}
                                                    </td>
                                                    <td style={{ padding: '12px 16px' }}>
                                                        {sh.canNang 
                                                            ? <span>{sh.canNang}</span> 
                                                            : <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Chưa đo</span>}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
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

            <Modal
                open={isRecordingModalOpen}
                title="Ghi nhận kết quả khám"
                onClose={() => setIsRecordingModalOpen(false)}
                width="lg"
                footer={
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', width: '100%' }}>
                        <Button variant="ghost" onClick={() => setIsRecordingModalOpen(false)} disabled={isSaving}>
                            Hủy bỏ
                        </Button>
                        <Button variant="primary" onClick={handleSaveRecord} disabled={isSaving}>
                            {isSaving ? 'Đang lưu...' : 'Lưu kết quả'}
                        </Button>
                    </div>
                }
            >
                {saveError && (
                    <div style={{ padding: '12px', backgroundColor: '#FEF2F2', color: '#B91C1C', borderRadius: '6px', marginBottom: '16px', border: '1px solid #F87171' }}>
                        {saveError}
                    </div>
                )}
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                        <h4 style={{ margin: '0 0 12px 0', color: '#0F172A', fontSize: '1rem' }}>Thông tin bệnh nhân</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.9rem' }}>
                            <div><strong>Bệnh nhân:</strong> {record?.benhNhan?.hoTen}</div>
                            <div><strong>Mã BN:</strong> {record?.benhNhan?.idBenhNhan}</div>
                            <div><strong>Giới tính:</strong> {record?.benhNhan?.gioiTinh === 'NAM' ? 'Nam' : 'Nữ'}</div>
                            <div><strong>Năm sinh:</strong> {record?.benhNhan?.ngaySinh?.substring(0, 4)}</div>
                        </div>
                    </div>

                    <div className="mc-field">
                        <label className="mc-label">Triệu chứng <span className="mc-required">*</span></label>
                        <textarea 
                            className="mc-input" 
                            style={{ minHeight: '80px', resize: 'vertical' }}
                            value={trieuChung}
                            onChange={(e) => setTrieuChung(e.target.value)}
                            placeholder="Nhập triệu chứng của bệnh nhân..."
                        />
                    </div>
                    
                    <div className="mc-field">
                        <label className="mc-label">Kết quả khám <span className="mc-required">*</span></label>
                        <textarea 
                            className="mc-input" 
                            style={{ minHeight: '120px', resize: 'vertical' }}
                            value={ketQuaKham}
                            onChange={(e) => setKetQuaKham(e.target.value)}
                            placeholder="Nhập kết quả khám lâm sàng..."
                        />
                    </div>
                    
                    <div className="mc-field">
                        <label className="mc-label">Chẩn đoán <span className="mc-required">*</span></label>
                        <textarea 
                            className="mc-input" 
                            style={{ minHeight: '80px', resize: 'vertical' }}
                            value={chanDoan}
                            onChange={(e) => setChanDoan(e.target.value)}
                            placeholder="Nhập kết luận chẩn đoán..."
                        />
                    </div>
                </div>
            </Modal>
        </MainLayout>

    );
};
