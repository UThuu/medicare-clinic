import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { Button } from '../components/common/Button';
import { PatientSummary } from '../components/common/PatientSummary';
import { medicalRecordService } from '../services/medicalRecordService';
import { khamBenhService } from '../services/khamBenhService';
import { MedicalRecordResponse } from '../types/MedicalRecord';
import { Card, Alert, Textarea } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { getExaminationBlockReason, getSavedExam } from './examinationState';
import './recordExam.css';

export const RecordExamResult: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const idLuotKham = id || '';
    const navigate = useNavigate();
    const { user } = useAuth();

    const [record, setRecord] = useState<MedicalRecordResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [trieuChung, setTrieuChung] = useState('');
    const [ketQuaKham, setKetQuaKham] = useState('');
    const [chanDoan, setChanDoan] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const restoreFields = (data: MedicalRecordResponse) => {
        const saved = getSavedExam(data);
        setTrieuChung(saved.trieuChung);
        setKetQuaKham(saved.ketQuaKham);
        setChanDoan(saved.chanDoan);
    };

    useEffect(() => {
        let active = true;
        const fetchRecord = async () => {
            setLoading(true);
            setError(null);
            setSaveError(null);
            setSuccess(false);
            try {
                let data = await medicalRecordService.getMedicalRecord(idLuotKham);
                if (!active) return;
                if (!getExaminationBlockReason(data)) {
                    await khamBenhService.startKhamBenh(idLuotKham);
                    data = await medicalRecordService.getMedicalRecord(idLuotKham);
                }
                if (active) {
                    setRecord(data);
                    restoreFields(data);
                }
            } catch (err: unknown) {
                if (active) setError(err instanceof Error ? err.message : 'Không tải được hồ sơ');
            } finally {
                if (active) setLoading(false);
            }
        };
        fetchRecord();
        return () => { active = false; };
    }, [idLuotKham]);

    const blockReason = record ? getExaminationBlockReason(record) : null;
    const canEdit = !loading && !blockReason && record?.luotKhamHienTai?.trangThai === 'DANG_KHAM';

    const handleReset = () => {
        if (record) restoreFields(record);
        setSaveError(null);
        setSuccess(false);
    };

    const handleSave = async () => {
        if (!canEdit || isSaving || !record) return;
        const saved = { trieuChung: trieuChung.trim(), ketQuaKham: ketQuaKham.trim(), chanDoan: chanDoan.trim() };
        if (!saved.trieuChung || !saved.ketQuaKham || !saved.chanDoan) {
            setSaveError('Vui lòng điền đầy đủ triệu chứng, kết quả thăm khám và chẩn đoán.');
            return;
        }
        try {
            setIsSaving(true);
            setSaveError(null);
            setSuccess(false);
            await khamBenhService.saveKetQuaKham({ idLichKham: idLuotKham, ...saved });
            const updated = { ...record, luotKhamHienTai: { ...record.luotKhamHienTai!, ...saved } };
            setRecord(updated);
            restoreFields(updated);
            setSuccess(true);
        } catch (err: unknown) {
            setSaveError(err instanceof Error ? err.message : 'Lưu thất bại. Vui lòng thử lại.');
        } finally {
            setIsSaving(false);
        }
    };

    const layoutProps = {
        doctorName: user?.hoTen || '',
        roleLabel: 'Bác sĩ',
        sidebarItems: [{ label: 'Dashboard', href: '/staff' }, { label: 'Lịch khám', href: '/staff/schedules', active: true }],
    };

    if (loading) {
        return (
            <MainLayout {...layoutProps}>
                <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>
                    Đang tải hồ sơ...
                </div>
            </MainLayout>
        );
    }

    if (error || !record) {
        return (
            <MainLayout {...layoutProps}>
                <div style={{ padding: '2rem', textAlign: 'center', color: '#B91C1C' }}>
                    {error || 'Không tìm thấy hồ sơ bệnh nhân'}
                    <br />
                    <Button variant="secondary" onClick={() => navigate('/staff/schedules')} style={{ marginTop: '1rem' }}>
                        Quay lại
                    </Button>
                </div>
            </MainLayout>
        );
    }

    const { benhNhan, luotKhamHienTai, sinhHieuHienTai } = record;

    const fmtDate = (d?: string) =>
        d ? new Date(d).toLocaleDateString('vi-VN') : '—';

    return (
        <MainLayout {...layoutProps}>
            <div className="re-page">
                {/* Breadcrumb */}
                <nav className="re-breadcrumb">
                    <span className="re-bc-link" onClick={() => navigate('/staff/schedules')}>Lịch khám</span>
                    <span className="re-bc-sep">›</span>
                    <span className="re-bc-link" onClick={() => navigate(`/staff/medical-record/${idLuotKham}`)}>Hồ sơ bệnh nhân</span>
                    <span className="re-bc-sep">›</span>
                    <span className="re-bc-current">Ghi nhận kết quả khám</span>
                </nav>

                {/* PatientSummary – same card as UC07 */}
                <div className="re-patient-card re-card">
                    <PatientSummary
                        idBenhNhan={benhNhan?.idBenhNhan || ''}
                        hoTen={benhNhan?.hoTen || ''}
                        ngaySinh={benhNhan?.ngaySinh || ''}
                        gioiTinh={benhNhan?.gioiTinh || 'NAM'}
                        soDienThoai={benhNhan?.soDienThoai || ''}
                        diaChi={benhNhan?.diaChi || ''}
                        trangThaiLuotKham={luotKhamHienTai?.trangThai}
                    />
                </div>

                {/* Info row: Lượt khám + Sinh hiệu */}
                <div className="re-info-row">
                    {/* Lượt khám */}
                    <Card className="re-info-card re-visit-card">
                        <h3 className="re-card-title">Thông tin lượt khám</h3>
                        <div className="re-info-grid">
                            <div className="re-info-item">
                                <span className="re-info-label">Mã lượt khám</span>
                                <span className="re-info-val">{luotKhamHienTai?.idLuotKham || '—'}</span>
                            </div>
                            <div className="re-info-item">
                                <span className="re-info-label">Ngày / giờ khám</span>
                                <span className="re-info-val">
                                    {fmtDate(record?.lichKhamHienTai?.ngayKham)}
                                    {record?.lichKhamHienTai?.gioKham ? ` / ${record.lichKhamHienTai.gioKham.substring(0, 5)}` : ''}
                                </span>
                            </div>
                            <div className="re-info-item re-span-2">
                                <span className="re-info-label">Lý do khám</span>
                                <span className="re-info-val">{luotKhamHienTai?.lyDoKham || '—'}</span>
                            </div>
                        </div>
                    </Card>

                    {/* Sinh hiệu */}
                    <Card className="re-info-card re-vitals-card">
                        <h3 className="re-card-title">Sinh hiệu lượt khám hiện tại</h3>
                        <div className="re-vitals-row">
                            <div className="re-info-item">
                                <span className="re-info-label">Huyết áp</span>
                                <span className="re-info-val re-vital-val">
                                    {sinhHieuHienTai?.huyetApTamThu && sinhHieuHienTai?.huyetApTamTruong
                                        ? `${sinhHieuHienTai.huyetApTamThu}/${sinhHieuHienTai.huyetApTamTruong}`
                                        : '—'}
                                </span>
                            </div>
                            <div className="re-info-item">
                                <span className="re-info-label">Nhiệt độ</span>
                                <span className="re-info-val re-vital-val">
                                    {sinhHieuHienTai?.nhietDo ? `${sinhHieuHienTai.nhietDo} °C` : '—'}
                                </span>
                            </div>
                            <div className="re-info-item">
                                <span className="re-info-label">Cân nặng</span>
                                <span className="re-info-val re-vital-val">
                                    {sinhHieuHienTai?.canNang ? `${sinhHieuHienTai.canNang} kg` : '—'}
                                </span>
                            </div>
                        </div>
                    </Card>
                </div>

                {blockReason && <Alert tone="warning" title={blockReason} />}
                {success && <Alert tone="success" title="Lưu kết quả khám thành công" />}
                {/* Kết quả thăm khám */}
                <Card className="re-result-card">
                    <h3 className="re-card-title">Kết quả thăm khám</h3>

                    {saveError && (
                        <Alert title={saveError} />
                    )}

                    <div className="re-fields">
                        <Textarea label="Triệu chứng bệnh nhân khai" required className="re-textarea"
                            value={trieuChung} onChange={e => { setTrieuChung(e.target.value); setSuccess(false); }}
                            disabled={!canEdit || isSaving} placeholder="Nhập triệu chứng..." />
                        <Textarea label="Kết quả thăm khám" required className="re-textarea"
                            value={ketQuaKham} onChange={e => { setKetQuaKham(e.target.value); setSuccess(false); }}
                            disabled={!canEdit || isSaving} placeholder="Nhập kết quả thăm khám..." />
                        <Textarea label="Chẩn đoán" required className="re-textarea"
                            value={chanDoan} onChange={e => { setChanDoan(e.target.value); setSuccess(false); }}
                            disabled={!canEdit || isSaving} placeholder="Nhập chẩn đoán..." />
                    </div>

                    <div className="re-actions">
                        <Button variant="ghost" onClick={handleReset} disabled={!canEdit || isSaving}>
                            Đặt lại
                        </Button>
                        <Button variant="primary" onClick={handleSave} disabled={!canEdit || isSaving}>
                            {isSaving ? 'Đang lưu...' : 'Lưu kết quả khám'}
                        </Button>
                    </div>
                </Card>
            </div>
        </MainLayout>
    );
};
