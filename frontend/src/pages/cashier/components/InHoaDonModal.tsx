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
    const printArea = document.getElementById('printable-invoice-content');
    if (!printArea) {
      window.print();
      return;
    }

    // Cơ chế Hidden Iframe: Giải pháp chuẩn nhất cho in ấn web
    // Đảm bảo không bị popup blocker của Cốc Cốc/Chrome chặn,
    // và không bị ảnh hưởng bởi Dark Mode hay CSS layout của trang chính.
    let iframe = document.getElementById('invoice-print-frame') as HTMLIFrameElement;
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'invoice-print-frame';
      iframe.style.position = 'fixed';
      iframe.style.top = '-9999px';
      iframe.style.left = '-9999px';
      iframe.style.width = '0px';
      iframe.style.height = '0px';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);
    }

    const iframeDoc = iframe.contentWindow?.document;
    if (!iframeDoc) {
      window.print();
      return;
    }

    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html lang="vi">
        <head>
          <meta charset="UTF-8">
          <title>Hoa_Don_${data?.idHoaDon || 'MediCare'}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            @page {
              size: A4 portrait;
              margin: 10mm 14mm;
            }
            body {
              font-family: 'Plus Jakarta Sans', Arial, Helvetica, sans-serif;
              background-color: #ffffff !important;
              color: #0f172a !important;
              padding: 8mm 12mm;
              font-size: 13px;
              line-height: 1.5;
            }
            .invoice-print-area {
              width: 100%;
              background: #ffffff !important;
            }
            .invoice-header-section {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              gap: 20px;
            }
            .clinic-info {
              flex: 1;
            }
            .clinic-logo-row {
              display: flex;
              align-items: center;
              gap: 8px;
              margin-bottom: 6px;
            }
            .clinic-icon { font-size: 26px; }
            .clinic-name {
              font-size: 17px;
              font-weight: 800;
              color: #0369a1 !important;
            }
            .clinic-detail-item {
              font-size: 12px;
              color: #475569 !important;
              line-height: 1.5;
            }
            .invoice-meta-card {
              text-align: right;
              min-width: 230px;
              padding: 10px 14px;
              background-color: #f8fafc !important;
              border: 1px solid #cbd5e1 !important;
              border-radius: 8px;
            }
            .invoice-code-badge {
              font-size: 11px;
              font-weight: 700;
              color: #64748b !important;
            }
            .invoice-code-text {
              font-family: monospace, Courier, sans-serif;
              font-size: 17px;
              font-weight: 800;
              color: #0284c7 !important;
              margin-bottom: 4px;
            }
            .invoice-date-row {
              font-size: 11.5px;
              color: #475569 !important;
              display: flex;
              justify-content: space-between;
              gap: 8px;
              margin-top: 3px;
            }
            .invoice-paid-stamp {
              display: inline-block;
              margin-top: 8px;
              padding: 4px 12px;
              background-color: #dcfce7 !important;
              color: #15803d !important;
              font-weight: 800;
              font-size: 12px;
              border-radius: 9999px;
              border: 1px dashed #16a34a !important;
            }
            .invoice-divider {
              height: 1px;
              background-color: #cbd5e1 !important;
              margin: 16px 0;
            }
            .invoice-title-block {
              text-align: center;
              margin-bottom: 18px;
            }
            .invoice-main-title {
              font-size: 20px;
              font-weight: 800;
              color: #0f172a !important;
              letter-spacing: 0.5px;
            }
            .invoice-sub-title {
              font-size: 12px;
              font-weight: 600;
              color: #64748b !important;
              text-transform: uppercase;
              margin-top: 4px;
            }
            .patient-info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 12px 24px;
              background-color: #f8fafc !important;
              border: 1px solid #cbd5e1 !important;
              border-radius: 8px;
              padding: 12px 16px;
              margin-bottom: 16px;
            }
            .info-row {
              display: flex;
              font-size: 12.5px;
              line-height: 1.6;
            }
            .info-label {
              color: #64748b !important;
              width: 130px;
              flex-shrink: 0;
            }
            .info-value {
              color: #0f172a !important;
              font-weight: 500;
              flex: 1;
            }
            .patient-name-bold {
              font-weight: 800 !important;
              color: #0284c7 !important;
              text-transform: uppercase;
            }
            .font-mono {
              font-family: monospace, Courier, sans-serif;
            }
            .table-responsive {
              margin-top: 14px;
              overflow: visible;
            }
            .invoice-table {
              width: 100%;
              border-collapse: collapse;
              font-size: 12.5px;
              margin-top: 8px;
            }
            .invoice-table th {
              background-color: #f1f5f9 !important;
              color: #0f172a !important;
              font-weight: 700;
              padding: 9px 10px;
              border: 1px solid #94a3b8 !important;
              text-align: left;
            }
            .invoice-table td {
              padding: 8px 10px;
              border: 1px solid #cbd5e1 !important;
              color: #0f172a !important;
              background-color: #ffffff !important;
            }
            .invoice-summary-box {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              gap: 20px;
              margin-top: 14px;
              padding: 12px 16px;
              background-color: #f8fafc !important;
              border: 1px solid #cbd5e1 !important;
              border-radius: 8px;
            }
            .payment-method-box {
              border-left: 3px solid #0284c7;
              padding-left: 10px;
            }
            .summary-right {
              min-width: 280px;
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              font-size: 13px;
              padding: 3px 0;
              color: #475569 !important;
            }
            .total-row {
              border-top: 2px solid #94a3b8 !important;
              margin-top: 6px;
              padding-top: 6px;
              font-weight: 800;
              color: #0f172a !important;
              font-size: 15px;
            }
            .total-amount-highlight {
              color: #0284c7 !important;
              font-size: 17px;
              font-weight: 800;
            }
            .words-amount-box {
              margin-top: 12px;
              padding: 10px 14px;
              background-color: #f8fafc !important;
              border: 1px dashed #94a3b8 !important;
              border-radius: 6px;
              font-size: 12.5px;
            }
            .words-label {
              font-weight: 700;
              color: #475569 !important;
            }
            .words-content {
              font-weight: 700;
              color: #0f172a !important;
              font-style: italic;
            }
            .invoice-note {
              margin-top: 10px;
              font-size: 11.5px;
              color: #64748b !important;
            }
            .signature-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 24px;
              margin-top: 28px;
              text-align: center;
            }
            .signature-date {
              font-size: 11.5px;
              font-style: italic;
              color: #64748b !important;
              margin-bottom: 4px;
            }
            .signature-role {
              font-weight: 700;
              font-size: 12.5px;
              color: #0f172a !important;
            }
            .signature-sub {
              font-size: 11px;
              color: #64748b !important;
            }
            .signature-spacing {
              height: 55px;
            }
            .signature-name {
              font-weight: 700;
              font-size: 13px;
              color: #0f172a !important;
            }
            .invoice-footer-msg {
              text-align: center;
              font-size: 11.5px;
              font-style: italic;
              color: #64748b !important;
              margin-top: 22px;
              border-top: 1px dotted #cbd5e1 !important;
              padding-top: 10px;
            }
          </style>
        </head>
        <body>
          ${printArea.outerHTML}
        </body>
      </html>
    `);
    iframeDoc.close();

    // Chờ 250ms để nội dung và font render ổn định rồi kích hoạt in
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.error('Lỗi khi kích hoạt in qua iframe:', err);
        window.print();
      }
    }, 250);
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
