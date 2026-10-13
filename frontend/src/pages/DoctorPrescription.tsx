import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Alert } from '../components/common/Alert';
import { PatientSummary } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { donThuocService } from '../services/donThuocService';
import { InDonThuocModal } from '../components/donThuoc/InDonThuocModal';
import type {
  DonThuocResponse,
  ThuocItem,
  ChiTietDonThuocInput,
  TaoDonThuocRequest,
  CanhBaoDiUng,
} from '../types/donThuoc';
import './doctorPrescription.css';

export const DoctorPrescription: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const idLuotKham = id || '';
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Dữ liệu lượt khám & đơn thuốc từ server
  const [recordData, setRecordData] = useState<DonThuocResponse | null>(null);
  // Danh mục thuốc toàn hệ thống
  const [danhMucThuoc, setDanhMucThuoc] = useState<ThuocItem[]>([]);

  // State các dòng thuốc đang kê trên màn hình
  const [medRows, setMedRows] = useState<ChiTietDonThuocInput[]>([]);
  // Ghi chú đơn thuốc
  const [ghiChu, setGhiChu] = useState<string>('');

  // Modal in đơn thuốc (UC-14)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  // Load ban đầu
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [resData, resThuoc] = await Promise.all([
        donThuocService.getThongTinKeDon(idLuotKham),
        donThuocService.getDanhMucThuoc(),
      ]);

      setRecordData(resData);
      setDanhMucThuoc(resThuoc);
      setGhiChu(resData.ghiChu || '');

      // Nếu đơn thuốc đã lưu trước đó (UC-12), load danh sách chi tiết
      if (resData.chiTietDonThuoc && resData.chiTietDonThuoc.length > 0) {
        const loadedRows: ChiTietDonThuocInput[] = resData.chiTietDonThuoc.map(ct => ({
          tempId: ct.id || Math.random().toString(),
          idThuoc: ct.idThuoc,
          tenThuoc: ct.tenThuoc,
          donViTinh: ct.donViTinh,
          soLuong: ct.soLuong,
          lieuLuong: ct.lieuLuong,
          huongDanSuDung: ct.huongDanSuDung || '',
          donGia: ct.donGia || 0,
          lyDoBoQuaCanhBao: ct.lyDoBoQuaCanhBao || '',
          canhBaoDiUng: null,
          daXacNhanTiepTuc: Boolean(ct.lyDoBoQuaCanhBao),
        }));
        setMedRows(loadedRows);
      } else {
        setMedRows([]);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể tải thông tin đơn thuốc.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (idLuotKham) {
      void loadData();
    }
  }, [idLuotKham]);

  // Thêm 1 dòng thuốc mới
  const handleAddMedRow = () => {
    const newRow: ChiTietDonThuocInput = {
      tempId: 'new-' + Date.now() + '-' + Math.random(),
      idThuoc: '',
      tenThuoc: '',
      donViTinh: '',
      soLuong: 1,
      lieuLuong: '',
      huongDanSuDung: '',
      donGia: 0,
      lyDoBoQuaCanhBao: '',
      canhBaoDiUng: null,
      daXacNhanTiepTuc: false,
    };
    setMedRows(prev => [...prev, newRow]);
    setSaveSuccess(null);
    setSaveError(null);
  };

  // Xóa một dòng thuốc
  const handleRemoveMedRow = (tempId: string) => {
    setMedRows(prev => prev.filter(r => r.tempId !== tempId));
    setSaveSuccess(null);
  };

  // Chọn thuốc và kiểm tra cảnh báo dị ứng ngay lập tức (UC-13)
  const handleSelectMedicine = async (tempId: string, idThuoc: string) => {
    const chosen = danhMucThuoc.find(t => t.idThuoc === idThuoc);
    if (!chosen) {
      setMedRows(prev =>
        prev.map(r =>
          r.tempId === tempId
            ? { ...r, idThuoc: '', tenThuoc: '', donViTinh: '', donGia: 0, canhBaoDiUng: null, daXacNhanTiepTuc: false }
            : r
        )
      );
      return;
    }

    // Kiểm tra dị ứng thuốc qua API (UC-13)
    let warning: CanhBaoDiUng | null = null;
    try {
      const checkRes = await donThuocService.kiemTraDiUng(idLuotKham, [chosen.idThuoc]);
      if (checkRes && checkRes.length > 0 && checkRes[0].coCanhBao) {
        warning = checkRes[0];
      }
    } catch {
      // Fallback kiểm tra client nếu API có trục trặc
      if (recordData?.diUngs && recordData.diUngs.length > 0) {
        for (const du of recordData.diUngs) {
          const matched = (chosen.thanhPhans || []).some(tp =>
            tp.toLowerCase().includes(du.thanhPhan.toLowerCase())
          ) || chosen.tenThuoc.toLowerCase().includes(du.thanhPhan.toLowerCase());

          if (matched) {
            warning = {
              idThuoc: chosen.idThuoc,
              tenThuoc: chosen.tenThuoc,
              thanhPhanTrung: du.thanhPhan,
              ghiChuDiUng: du.ghiChu || 'Có tiền sử dị ứng với thành phần này',
              coCanhBao: true,
            };
            break;
          }
        }
      }
    }

    setMedRows(prev =>
      prev.map(r =>
        r.tempId === tempId
          ? {
              ...r,
              idThuoc: chosen.idThuoc,
              tenThuoc: chosen.tenThuoc,
              donViTinh: chosen.donViTinh,
              donGia: chosen.donGia,
              canhBaoDiUng: warning,
              daXacNhanTiepTuc: false,
              lyDoBoQuaCanhBao: '',
            }
          : r
      )
    );
  };

  // Cập nhật giá trị trường trong dòng
  const handleUpdateField = (tempId: string, field: keyof ChiTietDonThuocInput, val: unknown) => {
    setMedRows(prev =>
      prev.map(r => (r.tempId === tempId ? { ...r, [field]: val } : r))
    );
  };

  // UC13: Bác sĩ chọn "Đổi thuốc" khi có cảnh báo -> Xóa thuốc khỏi đơn
  const handleChangeMedicine = (tempId: string) => {
    handleRemoveMedRow(tempId);
  };

  // UC13: Bác sĩ xác nhận tiếp tục kê và lưu lý do
  const handleConfirmOverride = (tempId: string) => {
    setMedRows(prev =>
      prev.map(r => {
        if (r.tempId === tempId) {
          if (!r.lyDoBoQuaCanhBao || r.lyDoBoQuaCanhBao.trim() === '') {
            return r;
          }
          return { ...r, daXacNhanTiepTuc: true };
        }
        return r;
      })
    );
  };

  // Đặt lại (Reset)
  const handleReset = () => {
    void loadData();
    setSaveError(null);
    setSaveSuccess(null);
  };

  // Ràng buộc nghiệp vụ: Bắt buộc phải có chẩn đoán trước khi kê đơn
  const chuaCoChanDoan = !recordData?.chanDoan || recordData.chanDoan.trim() === '';

  // Kiểm tra tính hợp lệ trước khi hoàn tất / lưu đơn
  const hasActiveUnconfirmedAllergy = medRows.some(
    r => r.canhBaoDiUng && (!r.daXacNhanTiepTuc || !r.lyDoBoQuaCanhBao || r.lyDoBoQuaCanhBao.trim() === '')
  );

  const isFormValid =
    !chuaCoChanDoan &&
    medRows.length > 0 &&
    medRows.every(r => r.idThuoc && r.soLuong > 0 && r.lieuLuong.trim()) &&
    !hasActiveUnconfirmedAllergy;

  // Lưu đơn thuốc (UC-11 Tạo mới hoặc UC-12 Cập nhật)
  const handleSubmit = async () => {
    if (chuaCoChanDoan) {
      setSaveError('Lượt khám chưa có chẩn đoán. Vui lòng ghi nhận kết quả khám và chẩn đoán trước khi kê đơn.');
      return;
    }
    if (!isFormValid || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setSaveError(null);
      setSaveSuccess(null);

      const payload: TaoDonThuocRequest = {
        idLuotKham: recordData?.idLuotKham || idLuotKham,
        ghiChu: ghiChu.trim() || undefined,
        chiTietDonThuoc: medRows.map(r => ({
          idThuoc: r.idThuoc,
          soLuong: Number(r.soLuong),
          lieuLuong: r.lieuLuong.trim(),
          huongDanSuDung: r.huongDanSuDung.trim(),
          donGia: r.donGia,
          lyDoBoQuaCanhBao: r.daXacNhanTiepTuc && r.lyDoBoQuaCanhBao ? r.lyDoBoQuaCanhBao.trim() : undefined,
        })),
      };

      let res: DonThuocResponse;
      if (recordData?.idDonThuoc) {
        // UC12: Cập nhật đơn thuốc đã lưu
        res = await donThuocService.capNhatDonThuoc(recordData.idDonThuoc, payload);
        setSaveSuccess('Cập nhật đơn thuốc thành công!');
      } else {
        // UC11: Tạo đơn thuốc mới
        res = await donThuocService.taoDonThuoc(payload);
        setSaveSuccess('Tạo đơn thuốc điều trị thành công!');
      }

      setRecordData(res);
      // Reload lại danh sách chi tiết sau khi lưu
      if (res.chiTietDonThuoc) {
        setMedRows(
          res.chiTietDonThuoc.map(ct => ({
            tempId: ct.id || Math.random().toString(),
            idThuoc: ct.idThuoc,
            tenThuoc: ct.tenThuoc,
            donViTinh: ct.donViTinh,
            soLuong: ct.soLuong,
            lieuLuong: ct.lieuLuong,
            huongDanSuDung: ct.huongDanSuDung || '',
            donGia: ct.donGia || 0,
            lyDoBoQuaCanhBao: ct.lyDoBoQuaCanhBao || '',
            canhBaoDiUng: null,
            daXacNhanTiepTuc: Boolean(ct.lyDoBoQuaCanhBao),
          }))
        );
      }
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Lưu đơn thuốc thất bại. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const layoutProps = {
    doctorName: user?.hoTen || (recordData?.tenBacSi ? `BS. ${recordData.tenBacSi}` : 'BS. Nguyễn Minh'),
    roleLabel: 'Bác sĩ',
    sidebarItems: [
      { label: 'Dashboard', href: '/staff' },
      { label: 'Lịch khám', href: '/staff/schedules', active: true },
    ],
  };

  if (loading) {
    return (
      <MainLayout {...layoutProps}>
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
          Đang tải thông tin đơn thuốc...
        </div>
      </MainLayout>
    );
  }

  if (error || !recordData) {
    return (
      <MainLayout {...layoutProps}>
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
          <Alert tone="error" title="Không thể tải thông tin">
            <p>{error || 'Không tìm thấy dữ liệu lượt khám.'}</p>
            <Button variant="secondary" onClick={() => navigate('/staff/schedules')} style={{ marginTop: '12px' }}>
              Quay lại lịch khám
            </Button>
          </Alert>
        </div>
      </MainLayout>
    );
  }

  const isSavedPrescription = Boolean(recordData.idDonThuoc);

  return (
    <MainLayout {...layoutProps}>
      <style dangerouslySetInnerHTML={{ __html: ".mc-shell { height: calc(100vh - 64px); overflow: hidden; } .mc-main { padding: 0 !important; display: flex; flex-direction: column; overflow: hidden; height: 100%; background-color: #F8FAFC !important; }" }}></style>
      <div className="dp-page">
        {/* Navigation Row */}
        <div className="dp-nav-row">
          <nav className="dp-breadcrumb" aria-label="Breadcrumb">
            <span className="dp-bc-link" onClick={() => navigate('/staff/schedules')}>
              Lịch khám
            </span>
            <span className="dp-bc-sep">›</span>
            <span className="dp-bc-link" onClick={() => navigate(`/staff/medical-record/${idLuotKham}`)}>
              Hồ sơ bệnh nhân
            </span>
            <span className="dp-bc-sep">›</span>
            <span
              className="dp-bc-link"
              onClick={() => navigate(`/staff/medical-record/${idLuotKham}/record-exam`)}
            >
              Ghi nhận kết quả khám
            </span>
            <span className="dp-bc-sep">›</span>
            <span className="dp-bc-current">Đơn thuốc</span>
          </nav>

          <button
            className="dp-back-btn"
            onClick={() => navigate(`/staff/medical-record/${idLuotKham}/record-exam`)}
          >
            ← Ghi nhận kết quả khám
          </button>
        </div>

        {/* Thông báo trạng thái lưu & Hành động sau khi lưu */}
        {saveSuccess && (
          <div className="dp-success-banner" role="status" aria-live="polite">
            <div className="dp-success-content">
              <span className="dp-success-icon">✓</span>
              <div>
                <h4 className="dp-success-title">{saveSuccess}</h4>
                <p className="dp-success-desc">
                  {recordData.trangThaiLuotKham === 'HOAN_TAT'
                    ? 'Lượt khám đã hoàn tất. Bác sĩ có thể in đơn thuốc hoặc tiếp tục khám ca tiếp theo.'
                    : 'Thông tin đơn thuốc đã được lưu vào hệ thống thành công.'}
                </p>
              </div>
            </div>
            <div className="dp-success-actions">
              <button
                type="button"
                className="dp-banner-btn-print"
                onClick={() => setIsPrintModalOpen(true)}
              >
                🖨️ In đơn thuốc (PDF)
              </button>
              <button
                type="button"
                className="dp-banner-btn-next"
                onClick={() => navigate('/staff/schedules')}
              >
                Tiếp tục khám bệnh nhân khác →
              </button>
            </div>
          </div>
        )}
        {saveError && (
          <div style={{ marginBottom: '16px' }}>
            <Alert tone="error" title={saveError} />
          </div>
        )}

        {/* Card 1: Thông tin bệnh nhân (Dùng chung PatientSummary đồng bộ chuẩn hệ thống) */}
        <div className="dp-patient-summary-wrapper">
          <PatientSummary
            idBenhNhan={recordData.idBenhNhan || ''}
            hoTen={recordData.hoTenBenhNhan || 'Chưa cập nhật'}
            ngaySinh={recordData.ngaySinhBenhNhan || ''}
            gioiTinh={recordData.gioiTinhBenhNhan || 'NAM'}
            soDienThoai={recordData.soDienThoaiBenhNhan || '—'}
            diaChi={recordData.diaChiBenhNhan || '—'}
            trangThaiLuotKham={recordData.trangThaiLuotKham || undefined}
          />
        </div>

        {/* 2 Columns: Thông tin lâm sàng + Tiền sử dị ứng đã ghi nhận */}
        <div className="dp-two-cols">
          <Card className="dp-info-card">
            <span className="dp-section-badge dp-section-badge--clinical">
              ⓘ THÔNG TIN LÂM SÀNG
            </span>
            <div className="dp-clinical-item">
              <strong>Lý do khám</strong>
              <span>{recordData.lyDoKham || 'Không ghi nhận'}</span>
            </div>
            <div className="dp-clinical-item">
              <strong>Chẩn đoán</strong>
              <span style={{ fontWeight: 600, color: '#0f766e' }}>
                {recordData.chanDoan || 'Chưa có chẩn đoán'}
              </span>
            </div>
          </Card>

          <Card className="dp-info-card">
            <span className="dp-section-badge dp-section-badge--allergy">
              ⚠️ DỊ ỨNG ĐÃ GHI NHẬN
            </span>
            {recordData.diUngs && recordData.diUngs.length > 0 ? (
              <div className="dp-allergy-tags">
                {recordData.diUngs.map((du, idx) => (
                  <span key={idx} className="dp-allergy-tag" title={du.ghiChu || ''}>
                    {du.thanhPhan}
                  </span>
                ))}
              </div>
            ) : (
              <p className="dp-allergy-empty">Không ghi nhận tiền sử dị ứng thuốc nào.</p>
            )}
          </Card>
        </div>

        {/* Cảnh báo khi chưa có chẩn đoán */}
        {chuaCoChanDoan && (
          <div style={{ marginBottom: '16px' }}>
            <Alert tone="warning" title="Chưa có chẩn đoán kết quả khám">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginTop: '6px' }}>
                <span style={{ fontSize: '14px', color: '#854D0E' }}>
                  Lượt khám này chưa có kết luận chẩn đoán. Theo quy định khám bệnh, bác sĩ cần hoàn tất kết quả khám và chẩn đoán trước khi kê đơn thuốc.
                </span>
                <Button
                  variant="primary"
                  onClick={() => navigate(`/staff/medical-record/${idLuotKham}/record-exam`)}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  ← Đi đến Ghi nhận kết quả khám
                </Button>
              </div>
            </Alert>
          </div>
        )}

        {/* Card 3: Chi tiết đơn thuốc */}
        <Card className="dp-prescription-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <span className="dp-section-badge dp-section-badge--prescription">
                ĐƠN THUỐC {recordData.idDonThuoc ? `(MÃ: ${recordData.idDonThuoc})` : ''}
              </span>
              <h2 className="dp-prescription-title">Chi tiết đơn thuốc</h2>
            </div>

            {/* Nút in đơn thuốc (UC-14) khi đơn thuốc đã lưu */}
            {isSavedPrescription && (
              <Button
                variant="secondary"
                onClick={() => setIsPrintModalOpen(true)}
                title="Xem trước và in đơn thuốc PDF"
              >
                🖨️ Xem trước & In đơn thuốc
              </Button>
            )}
          </div>

          {/* EMPTY STATE (Photo 2) */}
          {medRows.length === 0 ? (
            <div className="dp-empty-box">
              <div className="dp-empty-icon">+</div>
              <h3 className="dp-empty-title">Chưa có thuốc nào trong đơn</h3>
              <p className="dp-empty-desc">
                {chuaCoChanDoan
                  ? 'Vui lòng hoàn tất chẩn đoán khám bệnh trước khi bắt đầu kê đơn.'
                  : 'Nhấn "+ Thêm thuốc" để bắt đầu kê đơn.'}
              </p>
              <button
                type="button"
                className="dp-add-med-btn"
                onClick={handleAddMedRow}
                disabled={chuaCoChanDoan}
                style={chuaCoChanDoan ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
                title={chuaCoChanDoan ? 'Cần ghi nhận chẩn đoán trước khi thêm thuốc' : undefined}
              >
                + Thêm thuốc
              </button>
            </div>
          ) : (
            /* POPULATED STATE (Photo 1 & Photo 4) */
            <>
              {/* Header của bảng cố định, không nằm trong scroll */}
              <div className="dp-table-header">
                <div>Thuốc</div>
                <div>Số lượng</div>
                <div>Đơn vị tính</div>
                <div>Liều lượng</div>
                <div>Hướng dẫn sử dụng</div>
                <div></div>
              </div>

              {/* PHẠM VI SCROLL: Danh sách dòng thuốc + Nút thêm thuốc (Ảnh thứ 4) */}
              <div className="dp-med-scroll-area">
                <div className="dp-med-list">

                {medRows.map(row => {
                  const hasWarning = Boolean(row.canhBaoDiUng);

                  return (
                    <div key={row.tempId} className="dp-med-row">
                      <div className="dp-med-inputs">
                        {/* Cột 1: Chọn thuốc */}
                        <div>
                          <select
                            className={`dp-input ${hasWarning ? 'dp-input--warning' : ''}`}
                            value={row.idThuoc}
                            onChange={e => void handleSelectMedicine(row.tempId, e.target.value)}
                          >
                            <option value="">-- Chọn thuốc --</option>
                            {danhMucThuoc.map(t => (
                              <option key={t.idThuoc} value={t.idThuoc}>
                                {t.tenThuoc}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Cột 2: Số lượng */}
                        <div>
                          <input
                            type="number"
                            min="1"
                            className="dp-input"
                            value={row.soLuong}
                            onChange={e => handleUpdateField(row.tempId, 'soLuong', Math.max(1, parseInt(e.target.value) || 1))}
                          />
                        </div>

                        {/* Cột 3: Đơn vị tính */}
                        <div>
                          <div className="dp-unit-box">{row.donViTinh || '—'}</div>
                        </div>

                        {/* Cột 4: Liều lượng */}
                        <div>
                          <input
                            type="text"
                            placeholder="1 viên/lần, ngày 2 lần"
                            className="dp-input"
                            value={row.lieuLuong}
                            onChange={e => handleUpdateField(row.tempId, 'lieuLuong', e.target.value)}
                          />
                        </div>

                        {/* Cột 5: Hướng dẫn sử dụng */}
                        <div>
                          <input
                            type="text"
                            placeholder="Uống sau ăn"
                            className="dp-input"
                            value={row.huongDanSuDung}
                            onChange={e => handleUpdateField(row.tempId, 'huongDanSuDung', e.target.value)}
                          />
                        </div>

                        {/* Cột 6: Nút Xóa */}
                        <div style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            className="dp-del-btn"
                            onClick={() => handleRemoveMedRow(row.tempId)}
                          >
                            Xóa
                          </button>
                        </div>
                      </div>

                      {/* BOX CẢNH BÁO DỊ ỨNG (UC-13 - Đúng chuẩn Photo 1) */}
                      {hasWarning && (
                        <div className="dp-warning-box">
                          <div className="dp-warning-top">
                            <span className="dp-warning-icon">!</span>
                            <div>
                              <h4 className="dp-warning-heading">Cảnh báo dị ứng tại thuốc này</h4>
                              <p className="dp-warning-desc">
                                <strong>{row.tenThuoc}</strong> có thành phần liên quan đến dị ứng{' '}
                                <strong>{row.canhBaoDiUng?.thanhPhanTrung}</strong> đã ghi nhận của bệnh nhân.
                              </p>
                            </div>
                          </div>

                          <div className="dp-warning-form">
                            <label className="dp-warning-label">Lý do tiếp tục kê *</label>
                            <div className="dp-warning-actions">
                              <input
                                type="text"
                                className="dp-input dp-reason-input"
                                placeholder="Nhập lý do nếu bác sĩ vẫn muốn tiếp tục kê thuốc này..."
                                value={row.lyDoBoQuaCanhBao || ''}
                                onChange={e => handleUpdateField(row.tempId, 'lyDoBoQuaCanhBao', e.target.value)}
                              />
                              <button
                                type="button"
                                className="dp-btn-change-med"
                                onClick={() => handleChangeMedicine(row.tempId)}
                              >
                                Đổi thuốc
                              </button>
                              <button
                                type="button"
                                className="dp-btn-confirm-override"
                                disabled={!row.lyDoBoQuaCanhBao || row.lyDoBoQuaCanhBao.trim() === ''}
                                onClick={() => handleConfirmOverride(row.tempId)}
                              >
                                {row.daXacNhanTiepTuc ? '✓ Đã xác nhận' : 'Xác nhận tiếp tục kê'}
                              </button>
                            </div>

                            {row.daXacNhanTiepTuc ? (
                              <div className="dp-warning-badge-resolved">
                                ✓ Đã xác nhận lý do tiếp tục kê: "{row.lyDoBoQuaCanhBao}"
                              </div>
                            ) : (
                              <p className="dp-warning-note">
                                Sau khi xác nhận tiếp tục kê và lưu lý do, cảnh báo sẽ được đánh dấu là đã xử lý và nút Hoàn tất đơn sẽ được bật.
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                </div>

                {/* Nút thêm thuốc nằm trong phạm vi scroll */}
                <button
                  type="button"
                  className="dp-add-med-btn"
                  onClick={handleAddMedRow}
                  disabled={chuaCoChanDoan}
                  style={chuaCoChanDoan ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
                  title={chuaCoChanDoan ? 'Cần ghi nhận chẩn đoán trước khi thêm thuốc' : undefined}
                >
                  + Thêm thuốc
                </button>
              </div>
            </>
          )}

          {/* Footer Ghi chú & Actions */}
          <div className="dp-footer-section">
            <div className="dp-note-wrap">
              <label className="dp-note-label">Ghi chú đơn thuốc</label>
              <input
                type="text"
                className="dp-note-input"
                placeholder="Nhập ghi chú nếu có..."
                value={ghiChu}
                onChange={e => setGhiChu(e.target.value)}
              />
            </div>

            <div className="dp-footer-actions">
              <button type="button" className="dp-btn-reset" onClick={handleReset} disabled={isSubmitting}>
                Đặt lại
              </button>
              <button
                type="button"
                className="dp-btn-submit"
                disabled={!isFormValid || isSubmitting || chuaCoChanDoan}
                style={chuaCoChanDoan ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
                title={chuaCoChanDoan ? 'Cần ghi nhận chẩn đoán trước khi kê đơn' : undefined}
                onClick={() => void handleSubmit()}
              >
                {isSubmitting
                  ? 'Đang lưu...'
                  : isSavedPrescription
                  ? 'Cập nhật đơn thuốc'
                  : 'Hoàn tất đơn'}
              </button>
            </div>
          </div>
        </Card>

        {/* Modal xem trước & In đơn thuốc PDF (UC-14) */}
        <InDonThuocModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          data={recordData}
        />
      </div>
    </MainLayout>
  );
};
