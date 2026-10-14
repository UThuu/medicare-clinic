import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PatientLayout } from '../components/layout/PatientLayout';
import { useAppointmentNotifications } from '../hooks/useAppointmentNotifications';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Alert } from '../components/common/Alert';
import { layHoSoYTeCaNhan } from '../services/hoSoYTeService';
import type { HoSoYTeCaNhanResponse, LichSuKham } from '../types/hoSoYTe';
import './hoSoYTeCaNhan.css';

export function HoSoYTeCaNhanPage() {
  const { user } = useAuth();
  const notifications = useAppointmentNotifications();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<HoSoYTeCaNhanResponse | null>(null);

  // Chế độ phóng to cỡ chữ (20px)
  const [isLargeFont, setIsLargeFont] = useState<boolean>(false);

  // Đợt khám đang mở xem chi tiết đơn thuốc
  const [expandedVisitId, setExpandedVisitId] = useState<string | null>(null);

  const fetchRecord = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await layHoSoYTeCaNhan();
      setData(res);
      // Mặc định mở đơn thuốc của đợt khám gần nhất nếu có đơn thuốc
      const latestWithPrescription = res.lichSuKham.find(v => v.donThuoc !== null);
      if (latestWithPrescription) {
        setExpandedVisitId(latestWithPrescription.idLuotKham);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải hồ sơ y tế.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchRecord();
  }, []);

  const togglePrescription = (idLuotKham: string) => {
    setExpandedVisitId(prev => (prev === idLuotKham ? null : idLuotKham));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <PatientLayout active="record" notifications={notifications}>
      <div className={`mc-record-page ${isLargeFont ? 'is-large-font' : ''}`}>
        
        {/* Header trang (sạch sẽ, không còn thanh công cụ thô kệch) */}
        <div className="mc-patient-heading mc-print-hide">
          <h1>Hồ sơ y tế cá nhân</h1>
          <p>Lịch sử khám chữa bệnh, chỉ số sinh hiệu và đơn thuốc của bạn</p>
        </div>

        {/* Loading state */}
        {loading && (
          <Card className="mc-loading-panel" padding="lg">
            <div style={{ textAlign: 'center', padding: '30px 0' }}>
              <p style={{ margin: 0, fontSize: '16px', color: '#64748b' }}>Đang tải thông tin hồ sơ y tế cá nhân...</p>
            </div>
          </Card>
        )}

        {/* Error state */}
        {error && (
          <Card padding="md">
            <Alert title="Không thể tải hồ sơ y tế" tone="error">
              <p style={{ margin: '4px 0 12px' }}>{error}</p>
              <Button variant="primary" onClick={() => void fetchRecord()}>Thử lại</Button>
            </Alert>
          </Card>
        )}

        {/* Loaded Data Content */}
        {!loading && !error && data && (
          <>
            {/* Grid Thông tin bệnh nhân & Tiền sử dị ứng */}
            <div className="mc-record-profile-grid">
              <Card className="mc-patient-profile-card" padding="lg">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                  <h2 style={{ margin: 0, fontSize: '18px' }}>👤 Thông tin hành chính</h2>
                  <span style={{ fontSize: '13px', background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
                    Mã BN: {data.benhNhan.idBenhNhan}
                  </span>
                </div>

                <div className="mc-profile-details">
                  <div className="mc-profile-field">
                    <span>Họ và tên</span>
                    <strong>{data.benhNhan.hoTen || user?.hoTen}</strong>
                  </div>
                  <div className="mc-profile-field">
                    <span>Ngày sinh</span>
                    <strong>{data.benhNhan.ngaySinh ? data.benhNhan.ngaySinh.split('-').reverse().join('/') : 'Chưa cập nhật'}</strong>
                  </div>
                  <div className="mc-profile-field">
                    <span>Giới tính</span>
                    <strong>{data.benhNhan.gioiTinh === 'NAM' ? 'Nam' : data.benhNhan.gioiTinh === 'NU' ? 'Nữ' : 'Khác'}</strong>
                  </div>
                  <div className="mc-profile-field">
                    <span>Số điện thoại</span>
                    <strong>{data.benhNhan.soDienThoai || 'Chưa cập nhật'}</strong>
                  </div>
                  <div className="mc-profile-field" style={{ gridColumn: '1 / -1' }}>
                    <span>Địa chỉ</span>
                    <strong>{data.benhNhan.diaChi || 'Chưa cập nhật'}</strong>
                  </div>
                </div>
              </Card>

              {/* Thẻ tiền sử dị ứng */}
              <Card className="mc-allergy-card" padding="lg">
                <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                  <h2 style={{ margin: 0, fontSize: '18px', color: data.diUng.length > 0 ? '#b91c1c' : '#1e293b' }}>
                    ⚠️ Tiền sử dị ứng thuốc
                  </h2>
                </div>

                {data.diUng.length === 0 ? (
                  <div className="mc-allergy-safe" style={{ marginTop: '14px' }}>
                    <span>✓</span>
                    <span>Không ghi nhận tiền sử dị ứng thuốc nào.</span>
                  </div>
                ) : (
                  <div className="mc-allergy-list">
                    {data.diUng.map((item, idx) => (
                      <div key={idx} className="mc-allergy-item">
                        <span className="mc-allergy-icon">⚠️</span>
                        <div>
                          <strong>{item.thanhPhan}</strong>
                          {item.ghiChu && <div style={{ fontSize: '13px', marginTop: '2px' }}>{item.ghiChu}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Chỉ số sinh hiệu gần nhất */}
            {data.sinhHieu.length > 0 && (
              <Card padding="md">
                <h2 style={{ margin: '0 0 4px', fontSize: '18px' }}>💓 Chỉ số sinh hiệu gần nhất</h2>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                  Đo lúc: {new Date(data.sinhHieu[0].thoiDiemDo).toLocaleString('vi-VN')}
                </p>

                <div className="mc-vitals-grid">
                  <div className="mc-vital-box">
                    <span>Huyết áp</span>
                    <strong>
                      {data.sinhHieu[0].huyetApTamThu && data.sinhHieu[0].huyetApTamTruong
                        ? `${data.sinhHieu[0].huyetApTamThu} / ${data.sinhHieu[0].huyetApTamTruong} mmHg`
                        : 'Chưa đo'}
                    </strong>
                    <small>Tâm thu / Tâm trương</small>
                  </div>

                  <div className="mc-vital-box">
                    <span>Thân nhiệt</span>
                    <strong>
                      {data.sinhHieu[0].nhietDo ? `${data.sinhHieu[0].nhietDo} °C` : 'Chưa đo'}
                    </strong>
                    <small>Nhiệt độ cơ thể</small>
                  </div>

                  <div className="mc-vital-box">
                    <span>Cân nặng</span>
                    <strong>
                      {data.sinhHieu[0].canNang ? `${data.sinhHieu[0].canNang} kg` : 'Chưa đo'}
                    </strong>
                    <small>Trọng lượng cơ thể</small>
                  </div>
                </div>
              </Card>
            )}

            {/* Danh sách các đợt khám & Đơn thuốc */}
            <Card padding="lg">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '20px' }}>📋 Lịch sử khám bệnh & Đơn thuốc</h2>
                </div>
                <span style={{ fontSize: '14px', color: '#64748b' }}>
                  Tổng cộng: <strong>{data.lichSuKham.length}</strong> đợt khám
                </span>
              </div>

              {data.lichSuKham.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
                  <p>Bạn chưa có lịch sử khám bệnh nào tại phòng khám.</p>
                </div>
              ) : (
                <div className="mc-history-list">
                  {data.lichSuKham.map((visit: LichSuKham) => {
                    const isExpanded = expandedVisitId === visit.idLuotKham;
                    const hasPrescription = visit.donThuoc !== null && (visit.donThuoc.chiTiet || []).length > 0;
                    const isCompleted = visit.trangThai === 'HOAN_TAT';

                    return (
                      <article key={visit.idLuotKham} className="mc-history-item">
                        {/* Header của đợt khám */}
                        <div className="mc-history-header">
                          <div className="mc-history-date">
                            <span style={{ fontSize: '20px' }}>🗓️</span>
                            <div>
                              <strong>
                                Ngày {visit.ngayKham ? visit.ngayKham.split('-').reverse().join('/') : ''}
                                {visit.gioKham ? ` · ${visit.gioKham.slice(0, 5)}` : ''}
                              </strong>
                              <div style={{ fontSize: '14px', color: '#475569', marginTop: '2px' }}>
                                Bác sĩ: <strong>BS. {visit.tenBacSi || 'Phụ trách'}</strong>
                                {visit.chuyenKhoa ? ` (${visit.chuyenKhoa})` : ''}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span className={`mc-history-badge mc-history-badge--${visit.trangThai.toLowerCase()}`}>
                              {isCompleted ? '✓ Đã hoàn tất khám' : visit.trangThai === 'CHO_KHAM' ? '⏳ Đang chờ khám' : '🩺 Đang khám'}
                            </span>

                            {hasPrescription && (
                              <Button
                                variant={isExpanded ? 'primary' : 'secondary'}
                                onClick={() => togglePrescription(visit.idLuotKham)}
                                aria-expanded={isExpanded}
                                className="mc-print-hide"
                              >
                                {isExpanded ? 'Thu gọn đơn thuốc ▲' : 'Xem đơn thuốc ▼'}
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Nội dung kết quả khám */}
                        <div className="mc-history-body">
                          <div className="mc-exam-details-grid">
                            {visit.lyDoKham && (
                              <div className="mc-exam-block">
                                <h4>Lý do khám</h4>
                                <p>{visit.lyDoKham}</p>
                              </div>
                            )}

                            {visit.trieuChung && (
                              <div className="mc-exam-block">
                                <h4>Triệu chứng ghi nhận</h4>
                                <p>{visit.trieuChung}</p>
                              </div>
                            )}

                            <div className="mc-exam-block" style={{ borderLeftColor: '#10b981' }}>
                              <h4 style={{ color: '#047857' }}>Chẩn đoán của bác sĩ</h4>
                              <p style={{ fontWeight: 700, fontSize: '16px', color: '#065f46' }}>
                                {visit.chanDoan || 'Chưa ghi nhận chẩn đoán'}
                              </p>
                            </div>

                            {visit.ketQuaKham && (
                              <div className="mc-exam-block" style={{ borderLeftColor: '#8b5cf6' }}>
                                <h4>Kết luận & Hướng điều trị</h4>
                                <p>{visit.ketQuaKham}</p>
                              </div>
                            )}
                          </div>

                          {/* ========================================================
                             MÀN HÌNH ĐƠN THUỐC (REQ-019 & REQ-014)
                             Chữ tối thiểu 16px, hỗ trợ phóng to 20px
                             ======================================================== */}
                          {hasPrescription && isExpanded && visit.donThuoc && (
                            <section className="mc-prescription-section" aria-label="Chi tiết đơn thuốc">
                              <div className="mc-prescription-header">
                                <h3>
                                  <span>💊</span> Đơn thuốc điều trị (Mã: {visit.donThuoc.idDonThuoc})
                                </h3>

                                {/* Nút công cụ đặt ngay tại tiêu đề đơn thuốc */}
                                <div className="mc-prescription-actions mc-print-hide">
                                  <button
                                    type="button"
                                    className={`mc-font-size-toggle ${isLargeFont ? 'is-active' : ''}`}
                                    onClick={() => setIsLargeFont(prev => !prev)}
                                    title="Phóng to hoặc thu nhỏ cỡ chữ đơn thuốc"
                                    aria-label="Phóng to hoặc thu nhỏ chữ đơn thuốc"
                                  >
                                    <span style={{ fontSize: '15px', fontWeight: 'bold' }}>🔍</span>
                                    {isLargeFont ? 'Thu nhỏ' : 'Phóng to'}
                                  </button>

                                  <Button variant="secondary" onClick={handlePrint} title="In đơn thuốc">
                                    🖨️ In đơn thuốc
                                  </Button>
                                </div>
                              </div>

                              <div style={{ marginBottom: '12px', fontSize: '0.9em', color: '#0f766e' }}>
                                Ngày kê đơn: <strong>{visit.donThuoc.ngayKe ? visit.donThuoc.ngayKe.split('-').reverse().join('/') : ''}</strong>
                              </div>

                              {visit.donThuoc.ghiChu && (
                                <div className="mc-prescription-note">
                                  <strong>Lời dặn của bác sĩ:</strong> {visit.donThuoc.ghiChu}
                                </div>
                              )}

                              <div className="mc-prescription-table-wrap">
                                <table className="mc-prescription-table" aria-label="Danh sách thuốc">
                                  <thead>
                                    <tr>
                                      <th style={{ width: '40px', textAlign: 'center' }}>STT</th>
                                      <th>Tên thuốc</th>
                                      <th style={{ width: '130px', textAlign: 'center' }}>Số lượng</th>
                                      <th>Liều lượng</th>
                                      <th>Hướng dẫn sử dụng</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {visit.donThuoc.chiTiet.map((item, idx) => (
                                      <tr key={item.idThuoc || idx}>
                                        <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{idx + 1}</td>
                                        <td>
                                          <div className="mc-med-name">{item.tenThuoc}</div>
                                          <small style={{ color: '#64748b' }}>
                                            Đơn vị: {item.donViTinh}
                                          </small>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                          <span className="mc-med-qty">
                                            {item.soLuong} {item.donViTinh}
                                          </span>
                                        </td>
                                        <td>
                                          <span className="mc-med-dosage">{item.lieuLuong}</span>
                                        </td>
                                        <td>
                                          <span className="mc-med-instructions">
                                            {item.huongDanSuDung || 'Uống theo chỉ định của bác sĩ'}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </section>
                          )}

                          {/* Không có đơn thuốc */}
                          {!hasPrescription && (
                            <div style={{ fontSize: '14px', color: '#64748b', fontStyle: 'italic', marginTop: '6px' }}>
                              {isCompleted
                                ? '(Đợt khám này không kê đơn thuốc hoặc điều trị không dùng thuốc)'
                                : '(Đợt khám đang chờ bác sĩ thăm khám và ghi nhận kết luận)'}
                            </div>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </PatientLayout>
  );
}

export default HoSoYTeCaNhanPage;
