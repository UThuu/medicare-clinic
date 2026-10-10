import React, { useEffect, useState } from 'react';
import { thanhToanService } from '../../services/thanhToanService';
import { VNPayCallbackResponse } from '../../types/billing';
import { Button } from './components/Button';
import { InHoaDonModal } from './components/InHoaDonModal';

interface VNPayReturnPageProps {
  onBackToBilling: () => void;
}

export const VNPayReturnPage: React.FC<VNPayReturnPageProps> = ({ onBackToBilling }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [result, setResult] = useState<VNPayCallbackResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatThoiGian = (timeStr?: string, rawTime?: string) => {
    if (timeStr && timeStr.trim().length > 0) return timeStr;
    if (rawTime && rawTime.length === 14) {
      // yyyyMMddHHmmss -> HH:mm:ss dd/MM/yyyy
      const y = rawTime.substring(0, 4);
      const m = rawTime.substring(4, 6);
      const d = rawTime.substring(6, 8);
      const h = rawTime.substring(8, 10);
      const min = rawTime.substring(10, 12);
      const s = rawTime.substring(12, 14);
      return `${h}:${min}:${s} ${d}/${m}/${y}`;
    }
    return new Date().toLocaleString('vi-VN');
  };

  useEffect(() => {
    const processCallback = async () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const params: Record<string, string> = {};
        searchParams.forEach((val, key) => {
          params[key] = val;
        });

        if (!params['vnp_ResponseCode'] && !params['vnp_TxnRef']) {
          setError('Không tìm thấy thông tin phản hồi từ Cổng thanh toán VNPay.');
          setLoading(false);
          return;
        }

        const data = await thanhToanService.xuLyKetQuaVNPay(params);
        setResult(data);
      } catch (err: any) {
        setError(err.response?.data?.error || err.message || 'Xử lý phản hồi từ VNPay thất bại.');
      } finally {
        setLoading(false);
      }
    };

    processCallback();
  }, []);

  const isSuccess =
    result?.thanhCong === true ||
    result?.trangThai === 'THANH_CONG' ||
    result?.maPhanHoi === '00';

  const sourceRole = sessionStorage.getItem('vnpay_source_role') || 'patient';
  const isPatient = sourceRole === 'patient';

  return (
    <div style={{ padding: '40px 20px', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="vnpay-return-card">
        {loading ? (
          <div style={{ padding: '60px 40px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
              Đang xác thực giao dịch với Cổng VNPay...
            </h3>
            <p style={{ fontSize: '14px', color: '#64748b' }}>
              Vui lòng không tắt hoặc tải lại trang web trong giây lát.
            </p>
          </div>
        ) : error ? (
          <div>
            <div className="vnpay-return-header error">
              <div className="vnpay-return-icon error">⚠️</div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#991b1b', marginBottom: '6px' }}>
                Lỗi Xác Thực Giao Dịch
              </h2>
              <p style={{ fontSize: '14px', color: '#64748b' }}>{error}</p>
            </div>
            <div style={{ padding: '24px', textAlign: 'center' }}>
              <Button variant="primary" onClick={onBackToBilling}>
                {isPatient ? '🏠 Về Cổng Bệnh Nhân' : 'Quay lại Quầy Thu Ngân'}
              </Button>
            </div>
          </div>
        ) : result ? (
          <div>
            <div className={`vnpay-return-header ${isSuccess ? 'success' : 'error'}`}>
              <div className={`vnpay-return-icon ${isSuccess ? 'success' : 'error'}`}>
                {isSuccess ? '✓' : '✕'}
              </div>
              <div style={{ marginBottom: '8px' }}>
                <span className={`badge ${isSuccess ? 'badge-completed' : 'badge-cancelled'}`} style={{ fontSize: '13px', padding: '6px 14px' }}>
                  {isSuccess ? 'GIAO DỊCH THÀNH CÔNG' : 'GIAO DỊCH KHÔNG THÀNH CÔNG'}
                </span>
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: isSuccess ? '#15803d' : '#b91c1c', marginBottom: '6px' }}>
                {isSuccess ? 'Thanh Toán Viện Phí Hoàn Tất' : 'Thanh Toán Bị Hủy Hoặc Thất Bại'}
              </h2>
              <p style={{ fontSize: '14px', color: '#64748b' }}>
                {result.thongBao}
              </p>
            </div>

            <div style={{ padding: '24px 32px' }}>
              <table className="vnpay-receipt-table">
                <tbody>
                  <tr>
                    <td style={{ color: '#64748b', fontWeight: 600 }}>Cổng thanh toán:</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#005baa' }}>
                      VNPay Gateway Sandbox
                    </td>
                  </tr>
                  <tr>
                    <td style={{ color: '#64748b', fontWeight: 600 }}>Mã hóa đơn:</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>{result.idHoaDon}</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#64748b', fontWeight: 600 }}>Số tiền giao dịch:</td>
                    <td style={{ textAlign: 'right', fontWeight: 800, fontSize: '18px', color: isSuccess ? '#059669' : '#b91c1c' }}>
                      {formatVND(result.soTien)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ color: '#64748b', fontWeight: 600 }}>Mã giao dịch phòng khám:</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>
                      {result.maGiaoDich}
                    </td>
                  </tr>
                  {result.maGiaoDichVNPay && (
                    <tr>
                      <td style={{ color: '#64748b', fontWeight: 600 }}>Mã giao dịch VNPay:</td>
                      <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                        {result.maGiaoDichVNPay}
                      </td>
                    </tr>
                  )}
                  {result.nganHang && (
                    <tr>
                      <td style={{ color: '#64748b', fontWeight: 600 }}>Ngân hàng xử lý:</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{result.nganHang}</td>
                    </tr>
                  )}
                  <tr>
                    <td style={{ color: '#64748b', fontWeight: 600 }}>Thời gian giao dịch:</td>
                    <td style={{ textAlign: 'right', color: '#64748b' }}>
                      {formatThoiGian(result.thoiGian, result.thoiGianThanhToan)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ color: '#64748b', fontWeight: 600 }}>Mã phản hồi (vnp_ResponseCode):</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>
                      <span className={`badge ${isSuccess ? 'badge-completed' : 'badge-cancelled'}`}>
                        {result.maPhanHoi}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>

              <div style={{ marginTop: '28px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <Button variant="primary" onClick={onBackToBilling}>
                  {isPatient
                    ? (isSuccess ? '🏠 Về Cổng Bệnh Nhân' : 'Quay lại Cổng Bệnh Nhân')
                    : (isSuccess ? 'Quay lại Quầy Thu Ngân' : 'Quay lại Thử Lại Thanh Toán')}
                </Button>
                {isSuccess && (
                  <Button
                    variant="secondary"
                    id="btn-print-vnpay-receipt"
                    onClick={() => setIsPrintModalOpen(true)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <span>🧾</span>
                    <span>Xem & In Hóa Đơn Viện Phí (UC-21)</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* UC-21: MODAL IN HÓA ĐƠN CHI TIẾT */}
      {result && (
        <InHoaDonModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          idHoaDon={result.idHoaDon}
        />
      )}
    </div>
  );
};
