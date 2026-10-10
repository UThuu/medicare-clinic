import React, { useEffect, useState } from 'react';
import { thanhToanService } from '../../services/thanhToanService';
import { ThongTinThanhToanResponse, HoaDonResponse } from '../../types/billing';
import { Button } from '../cashier/components/Button';
import { StatusBadge } from '../cashier/components/StatusBadge';

export const ThanhToanOnlinePage: React.FC = () => {
  const [maHoaDonInput, setMaHoaDonInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const [thongTin, setThongTin] = useState<ThongTinThanhToanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Danh sách gợi ý hóa đơn chưa thanh toán để bệnh nhân / tester tiện chọn
  const [dsChuaThanhToan, setDsChuaThanhToan] = useState<HoaDonResponse[]>([]);

  useEffect(() => {
    thanhToanService
      .layDanhSachHoaDonChuaThanhToan()
      .then((data) => {
        setDsChuaThanhToan(data);
        if (data.length > 0) {
          setMaHoaDonInput(data[0].idHoaDon);
        }
      })
      .catch(() => {});
  }, []);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => {
      setToastMsg(null);
    }, 4500);
  };

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handleTraCuu = async (id?: string) => {
    const idTraCuu = (id || maHoaDonInput).trim();
    if (!idTraCuu) {
      setError('Vui lòng nhập mã hóa đơn cần tra cứu!');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await thanhToanService.layThongTinThanhToan(idTraCuu);
      setThongTin(data);
      setMaHoaDonInput(idTraCuu);
    } catch (err: any) {
      setThongTin(null);
      setError(err.response?.data?.error || err.message || 'Không tìm thấy hóa đơn!');
    } finally {
      setLoading(false);
    }
  };

  const handleThanhToanVNPay = async () => {
    if (!thongTin || !thongTin.idHoaDon) return;
    try {
      setProcessing(true);
      const res = await thanhToanService.taoGiaoDichVNPay(thongTin.idHoaDon);
      if (res.paymentUrl) {
        sessionStorage.setItem('vnpay_source_role', 'patient');
        showToast('Đang chuyển hướng sang Cổng thanh toán VNPay...', 'success');
        window.location.href = res.paymentUrl;
      } else {
        showToast('Không lấy được URL thanh toán từ VNPay!', 'error');
        setProcessing(false);
      }
    } catch (err: any) {
      showToast('Khởi tạo giao dịch VNPay thất bại: ' + (err.response?.data?.error || err.message), 'error');
      setProcessing(false);
    }
  };

  const handleSaoChep = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast(`Đã sao chép: ${text}`, 'success');
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Toast */}
      {toastMsg && (
        <div
          className={`toast-msg ${toastMsg.type === 'success' ? 'toast-success' : 'toast-error'}`}
          id="patient-toast"
        >
          <span>{toastMsg.type === 'success' ? '✅' : '⚠️'}</span>
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Hero Banner Dành Cho Bệnh Nhân */}
      <div
        className="med-card"
        style={{
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          color: '#ffffff',
          padding: '28px 32px',
          borderRadius: '16px',
          marginBottom: '24px',
          boxShadow: '0 10px 25px -5px rgba(2, 132, 199, 0.3)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, marginBottom: '10px' }}>
              <span>👤 ACTOR: BỆNH NHÂN</span>
              <span>•</span>
              <span>USE CASE 20</span>
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '6px' }}>
              Cổng Tra Cứu & Thanh Toán Viện Phí Trực Tuyến
            </h2>
            <p style={{ fontSize: '14px', opacity: 0.9, maxWidth: '650px' }}>
              Dành riêng cho bệnh nhân chủ động xem chi tiết chi phí khám chữa bệnh và thanh toán trực tuyến từ xa qua Cổng VNPay Gateway.
            </p>
          </div>
          <div style={{ fontSize: '48px', opacity: 0.85 }}>🌐</div>
        </div>
      </div>

      {/* Khối Tra cứu hóa đơn */}
      <div className="med-card" style={{ marginBottom: '24px', padding: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '14px' }}>
          🔍 Tra cứu hóa đơn của bạn
        </h3>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <input
              type="text"
              className="custom-input"
              placeholder="Nhập mã hóa đơn (ví dụ: HD-BA903BFB, HD-6C831458...)"
              value={maHoaDonInput}
              onChange={(e) => setMaHoaDonInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTraCuu()}
              style={{ fontSize: '15px' }}
            />
          </div>
          <Button variant="primary" onClick={() => handleTraCuu()} loading={loading}>
            🔎 Tra cứu ngay
          </Button>
        </div>

        {/* Hóa đơn gợi ý */}
        {dsChuaThanhToan.length > 0 && (
          <div style={{ marginTop: '14px', fontSize: '13px', color: '#64748b' }}>
            <span style={{ fontWeight: 600 }}>Hóa đơn đang chờ thanh toán: </span>
            {dsChuaThanhToan.map((hd) => (
              <button
                key={hd.idHoaDon}
                type="button"
                onClick={() => handleTraCuu(hd.idHoaDon)}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '3px 10px',
                  marginRight: '8px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#0284c7',
                }}
              >
                {hd.idHoaDon} ({hd.tenBenhNhan} - {formatVND(hd.tongTien)})
              </button>
            ))}
          </div>
        )}

        {error && (
          <div style={{ marginTop: '14px', padding: '12px', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', fontSize: '13px' }}>
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* Hiển thị chi tiết hóa đơn */}
      {loading ? (
        <div className="med-card" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          ⏳ Đang tải thông tin hóa đơn...
        </div>
      ) : thongTin ? (
        <div className="med-card" style={{ padding: '28px' }}>
          {/* Header hóa đơn */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>MÃ HÓA ĐƠN VIỆN PHÍ</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>{thongTin.idHoaDon}</div>
            </div>
            <div>
              <StatusBadge status={thongTin.trangThaiHoaDon} />
            </div>
          </div>

          {/* Thông tin bệnh nhân & đợt khám */}
          <div className="invoice-patient-card" style={{ marginBottom: '20px' }}>
            <div className="info-item">
              <span className="info-label">Bệnh nhân</span>
              <span className="info-value">{thongTin.tenBenhNhan}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Mã bệnh nhân</span>
              <span className="info-value">{thongTin.maBenhNhan}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Bác sĩ khám</span>
              <span className="info-value">{thongTin.bacSiKham} ({thongTin.chuyenKhoa})</span>
            </div>
            <div className="info-item">
              <span className="info-label">Chẩn đoán</span>
              <span className="info-value" style={{ color: '#0369a1' }}>
                {thongTin.chanDoan || 'Không có'}
              </span>
            </div>
          </div>

          {/* Bảng chi tiết chi phí */}
          <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px', color: '#334155' }}>
            Chi Tiết Các Khoản Viện Phí & Thuốc Kê Đơn
          </h4>
          <table className="med-table" style={{ border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '20px' }}>
            <thead>
              <tr>
                <th>Khoản thu</th>
                <th style={{ textAlign: 'center' }}>Số lượng</th>
                <th style={{ textAlign: 'right' }}>Đơn giá</th>
                <th style={{ textAlign: 'right' }}>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {thongTin.danhSachChiTiet.map((item, idx) => (
                <tr key={idx}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{item.tenKhoanThu}</div>
                    {item.huongDan && (
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                        {item.huongDan}
                      </div>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>{item.soLuong} {item.donViTinh}</td>
                  <td style={{ textAlign: 'right' }}>{formatVND(item.donGia)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatVND(item.thanhTien)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Tổng tiền */}
          <div className="payment-total-banner" style={{ marginBottom: '24px' }}>
            <div className="total-label">TỔNG VIỆN PHÍ BỆNH NHÂN CẦN THANH TOÁN:</div>
            <div className="total-amount">
              {formatVND(thongTin.tongTien)}
            </div>
          </div>

          {/* Nếu đã thanh toán */}
          {thongTin.trangThaiHoaDon === 'DA_THANH_TOAN' ? (
            <div style={{ padding: '20px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', marginBottom: '6px' }}>✅</div>
              <div style={{ fontWeight: 700, color: '#065f46', fontSize: '16px' }}>
                Hóa đơn này đã được thanh toán hoàn tất!
              </div>
              <div style={{ fontSize: '13px', color: '#047857', marginTop: '4px' }}>
                Cảm ơn bạn đã sử dụng dịch vụ tại phòng khám MediCare Clinic.
              </div>
            </div>
          ) : (
            /* Khối thanh toán VNPay Gateway Sandbox dành cho Bệnh nhân */
            <div className="vnpay-payment-box">
              <div className="vnpay-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="vnpay-brand-badge">VNPAY GATEWAY</span>
                  <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '15px' }}>
                    Thanh Toán Trực Tuyến Từ Xa (UC-20)
                  </span>
                </div>
                <span className="vnpay-sandbox-badge">SANDBOX TEST</span>
              </div>

              <div className="vnpay-info-card">
                <div style={{ fontSize: '13px', color: '#334155', lineHeight: 1.6 }}>
                  Bệnh nhân sẽ được chuyển tiếp an toàn sang <strong>Cổng VNPay Gateway</strong> để thực hiện thanh toán trực tuyến qua thẻ ATM nội địa, thẻ Visa/Mastercard hoặc ví VNPAY.
                </div>
              </div>

              {/* Thông tin thẻ thử nghiệm NCB Sandbox */}
              <div className="vnpay-test-card" id="patient-card-vnpay-sandbox-info">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#0369a1' }}>
                    🧪 THÔNG TIN THẺ TEST SANDBOX (NCB) ĐỂ BẠN THỬ NGHIỆM:
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Bấm nút để chép nhanh</span>
                </div>

                <div className="vnpay-test-grid">
                  <div className="vnpay-test-item">
                    <span><strong>Ngân hàng:</strong> NCB</span>
                    <button
                      type="button"
                      className={`qr-copy-btn ${copiedKey === 'ncb' ? 'copied' : ''}`}
                      onClick={() => handleSaoChep('ncb', 'NCB')}
                    >
                      {copiedKey === 'ncb' ? '✓' : '📋'}
                    </button>
                  </div>

                  <div className="vnpay-test-item">
                    <span><strong>Số thẻ:</strong> 9704198526191432198</span>
                    <button
                      type="button"
                      className={`qr-copy-btn ${copiedKey === 'sothe' ? 'copied' : ''}`}
                      onClick={() => handleSaoChep('sothe', '9704198526191432198')}
                    >
                      {copiedKey === 'sothe' ? '✓' : '📋'}
                    </button>
                  </div>

                  <div className="vnpay-test-item">
                    <span><strong>Chủ thẻ:</strong> NGUYEN VAN A</span>
                    <button
                      type="button"
                      className={`qr-copy-btn ${copiedKey === 'chuthe' ? 'copied' : ''}`}
                      onClick={() => handleSaoChep('chuthe', 'NGUYEN VAN A')}
                    >
                      {copiedKey === 'chuthe' ? '✓' : '📋'}
                    </button>
                  </div>

                  <div className="vnpay-test-item">
                    <span><strong>Ngày PH:</strong> 07/15 | <strong>OTP:</strong> 123456</span>
                    <button
                      type="button"
                      className={`qr-copy-btn ${copiedKey === 'otp' ? 'copied' : ''}`}
                      onClick={() => handleSaoChep('otp', '123456')}
                    >
                      {copiedKey === 'otp' ? '✓' : '📋'}
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '20px' }}>
                <button
                  type="button"
                  className="vnpay-btn-primary"
                  id="btn-patient-pay-vnpay"
                  onClick={handleThanhToanVNPay}
                  disabled={processing}
                >
                  <span>
                    {processing
                      ? '⏳ Đang kết nối Cổng VNPay...'
                      : `💳 Bệnh Nhân Thanh Toán Trực Tuyến Qua VNPay (${formatVND(thongTin.tongTien)})`}
                  </span>
                  {!processing && <span>→</span>}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
