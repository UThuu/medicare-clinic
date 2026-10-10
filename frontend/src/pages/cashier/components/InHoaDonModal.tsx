import React, { useEffect, useState } from 'react';
import { hoaDonService } from '../../../services/hoaDonService';
import { InHoaDonResponse } from '../../../types/billing';
import { Button } from './Button';

interface InHoaDonModalProps {
  isOpen: boolean;
  onClose: () => void;
  idHoaDon: string | null;
}

export const InHoaDonModal: React.FC<InHoaDonModalProps> = ({
  isOpen,
  onClose,
  idHoaDon,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<InHoaDonResponse | null>(null);

  useEffect(() => {
    if (isOpen && idHoaDon) {
      loadData(idHoaDon);
    } else {
      setData(null);
      setError(null);
    }
  }, [isOpen, idHoaDon]);

  const loadData = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await hoaDonService.getThongTinInHoaDon(id);
      setData(res);
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Không thể tải thông tin bản in hóa đơn';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" id="in-hoadon-modal-overlay" onClick={onClose}>
      <div
        className="modal-content print-modal-content"
        id="in-hoadon-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '850px', maxHeight: '92vh', overflowY: 'auto' }}
      >
        {/* Modal Header */}
        <div className="modal-header no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.25rem' }}>🧾</span>
            <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Xem Trước & In Hóa Đơn Viện Phí</h3>
          </div>
          <button className="modal-close-btn" id="btn-close-print-modal" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {loading && (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <div className="spinner" style={{ margin: '0 auto 1rem' }} />
              <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem' }}>
                Đang chuẩn bị mẫu in hóa đơn y tế...
              </p>
            </div>
          )}

          {error && !loading && (
            <div
              style={{
                backgroundColor: '#fff1f2',
                border: '1px solid #fecdd3',
                borderRadius: '8px',
                padding: '1.5rem',
                textAlign: 'center',
                margin: '1rem 0',
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⚠️</div>
              <h4 style={{ color: '#be123c', marginBottom: '0.5rem', fontSize: '1.05rem' }}>
                Không thể tạo bản in hóa đơn
              </h4>
              <p style={{ color: '#9f1239', fontWeight: 500, fontSize: '0.95rem', marginBottom: '1.25rem' }}>
                {error}
              </p>
              <p style={{ color: 'var(--slate-600)', fontSize: '0.85rem' }}>
                * Quy định nghiệp vụ: Chỉ những hóa đơn đã hoàn tất thanh toán (ĐÃ THANH TOÁN) mới được phép in chứng từ thanh quyết toán viện phí.
              </p>
            </div>
          )}

          {data && !loading && (
            <div className="invoice-print-area" id="printable-invoice-content">
              {/* Header Cơ sở Y tế */}
              <div className="invoice-header-section">
                <div className="clinic-info">
                  <div className="clinic-logo-row">
                    <span className="clinic-icon">🏥</span>
                    <span className="clinic-name">{data.tenPhongKham}</span>
                  </div>
                  <div className="clinic-detail-item">📍 {data.diaChiPhongKham}</div>
                  <div className="clinic-detail-item">
                    ☎️ Hotline: <strong>{data.hotline}</strong> | ✉️ {data.email}
                  </div>
                  <div className="clinic-detail-item">🌐 Website: {data.website}</div>
                </div>

                <div className="invoice-meta-card">
                  <div className="invoice-code-badge">MÃ HÓA ĐƠN</div>
                  <div className="invoice-code-text">{data.idHoaDon}</div>
                  <div className="invoice-date-row">
                    <span>Ngày lập:</span>
                    <strong>{data.ngayLap ? new Date(data.ngayLap).toLocaleString('vi-VN') : '—'}</strong>
                  </div>
                  <div className="invoice-date-row">
                    <span>Thanh toán:</span>
                    <strong>{data.ngayThanhToan ? new Date(data.ngayThanhToan).toLocaleString('vi-VN') : '—'}</strong>
                  </div>
                  <div className="invoice-paid-stamp">
                    ✓ ĐÃ THANH TOÁN
                  </div>
                </div>
              </div>

              <div className="invoice-divider" />

              {/* Tiêu đề hóa đơn */}
              <div className="invoice-title-block">
                <h2 className="invoice-main-title">HÓA ĐƠN THANH TOÁN VIỆN PHÍ</h2>
                <div className="invoice-sub-title">(PHIẾU THU TIỀN KHÁM BỆNH & THUỐC ĐIỀU TRỊ)</div>
              </div>

              {/* Thông tin Bệnh nhân & Khám bệnh */}
              <div className="patient-info-grid">
                <div className="patient-info-column">
                  <div className="info-row">
                    <span className="info-label">Họ tên bệnh nhân:</span>
                    <span className="info-value patient-name-bold">{data.tenBenhNhan}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Mã bệnh nhân:</span>
                    <span className="info-value font-mono">{data.maBenhNhan || '—'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Giới tính / Tuổi:</span>
                    <span className="info-value">
                      {data.gioiTinh || '—'} {data.tuoi !== null && data.tuoi !== undefined ? `(${data.tuoi} tuổi)` : ''}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Số điện thoại:</span>
                    <span className="info-value">{data.soDienThoai || '—'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Địa chỉ:</span>
                    <span className="info-value">{data.diaChi || 'Chưa cập nhật'}</span>
                  </div>
                </div>

                <div className="patient-info-column">
                  <div className="info-row">
                    <span className="info-label">Mã lượt khám:</span>
                    <span className="info-value font-mono">{data.idLuotKham}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Bác sĩ khám:</span>
                    <span className="info-value">{data.bacSiKham}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Chuyên khoa:</span>
                    <span className="info-value">{data.chuyenKhoa || 'Đa khoa'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Chẩn đoán y tế:</span>
                    <span className="info-value">{data.chanDoan || 'Khám lâm sàng'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Lý do khám:</span>
                    <span className="info-value">{data.lyDoKham || 'Kiểm tra sức khỏe'}</span>
                  </div>
                </div>
              </div>

              {/* Bảng Kê Chi Tiết Chi Phí */}
              <div className="table-responsive" style={{ marginTop: '1.25rem' }}>
                <table className="invoice-table">
                  <thead>
                    <tr>
                      <th style={{ width: '45px', textAlign: 'center' }}>STT</th>
                      <th>Nội dung chi phí / Tên thuốc & Dịch vụ</th>
                      <th style={{ width: '75px', textAlign: 'center' }}>ĐVT</th>
                      <th style={{ width: '60px', textAlign: 'center' }}>SL</th>
                      <th style={{ width: '120px', textAlign: 'right' }}>Đơn giá (đ)</th>
                      <th style={{ width: '130px', textAlign: 'right' }}>Thành tiền (đ)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.danhSachKhoanThu && data.danhSachKhoanThu.length > 0 ? (
                      data.danhSachKhoanThu.map((item, index) => (
                        <tr key={index}>
                          <td style={{ textAlign: 'center' }}>{index + 1}</td>
                          <td>
                            <div style={{ fontWeight: 600, color: 'var(--slate-800)' }}>
                              {item.tenKhoanThu}
                            </div>
                            {item.huongDan && (
                              <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '2px' }}>
                                💊 {item.huongDan}
                              </div>
                            )}
                          </td>
                          <td style={{ textAlign: 'center' }}>{item.donViTinh || 'Lần'}</td>
                          <td style={{ textAlign: 'center', fontWeight: 600 }}>{item.soLuong}</td>
                          <td style={{ textAlign: 'right' }}>{item.donGia.toLocaleString('vi-VN')}</td>
                          <td style={{ textAlign: 'right', fontWeight: 600 }}>
                            {item.thanhTien.toLocaleString('vi-VN')}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '1rem', color: 'var(--slate-500)' }}>
                          Không có khoản thu chi tiết
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Bảng Tổng Hợp Chi Phí */}
              <div className="invoice-summary-box">
                <div className="summary-left">
                  <div className="payment-method-box">
                    <div style={{ fontSize: '0.82rem', color: 'var(--slate-600)', marginBottom: '3px' }}>
                      Hình thức thanh toán:
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--slate-800)' }}>
                      💳 {data.tenPhuongThuc || data.phuongThucThanhToan}
                    </div>
                    {data.maGiaoDich && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '4px' }}>
                        Mã tham chiếu: <span className="font-mono">{data.maGiaoDich}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="summary-right">
                  <div className="summary-row">
                    <span>Tiền khám bệnh:</span>
                    <span>{data.phiKham.toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="summary-row">
                    <span>Tiền thuốc theo đơn:</span>
                    <span>{data.tienThuoc.toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="summary-row total-row">
                    <span>TỔNG CỘNG THANH TOÁN:</span>
                    <span className="total-amount-highlight">
                      {data.tongTien.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                </div>
              </div>

              {/* Số tiền bằng chữ */}
              <div className="words-amount-box">
                <span className="words-label">Số tiền viết bằng chữ: </span>
                <span className="words-content">“ {data.tongTienBangChu} ”</span>
              </div>

              {/* Ghi chú & Lời dặn */}
              {data.ghiChu && (
                <div className="invoice-note">
                  ℹ️ <em>Ghi chú: {data.ghiChu}</em>
                </div>
              )}

              {/* Chữ Ký Chứng Từ */}
              <div className="signature-grid">
                <div className="signature-column">
                  <div className="signature-role">BỆNH NHÂN / NGƯỜI NỘP</div>
                  <div className="signature-sub">(Ký và ghi rõ họ tên)</div>
                  <div className="signature-spacing" />
                  <div className="signature-name">{data.tenBenhNhan}</div>
                </div>

                <div className="signature-column">
                  <div className="signature-date">
                    Ngày {new Date(data.ngayThanhToan || data.ngayLap).getDate()} tháng{' '}
                    {new Date(data.ngayThanhToan || data.ngayLap).getMonth() + 1} năm{' '}
                    {new Date(data.ngayThanhToan || data.ngayLap).getFullYear()}
                  </div>
                  <div className="signature-role">NGƯỜI LẬP PHIẾU / THU NGÂN</div>
                  <div className="signature-sub">(Ký, đóng dấu và ghi rõ họ tên)</div>
                  <div className="signature-spacing" />
                  <div className="signature-name">{data.thuNganThu || 'Nguyễn Thị Thu Ngân'}</div>
                </div>
              </div>

              {/* Footer cảm ơn */}
              <div className="invoice-footer-msg">
                Phòng khám Đa khoa MediCare trân trọng cảm ơn Quý khách. Chúc Quý khách nhiều sức khỏe!
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer (Các nút bấm - tự động ẩn khi in) */}
        <div className="modal-footer no-print">
          <Button variant="secondary" onClick={onClose}>
            Đóng
          </Button>
          {data && (
            <Button
              variant="primary"
              id="btn-trigger-print"
              onClick={handlePrint}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: 'var(--primary-600)',
                color: '#fff',
              }}
            >
              <span>🖨️</span>
              <span>In Hóa Đơn / Lưu PDF</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
