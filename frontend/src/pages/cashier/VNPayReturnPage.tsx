import React, { useEffect, useState } from 'react';
import { thanhToanService } from '../../services/thanhToanService';
import { VNPayCallbackResponse } from '../../types/billing';
import { Button } from './components/Button';

interface VNPayReturnPageProps {
  onBackToBilling: () => void;
}

export const VNPayReturnPage: React.FC<VNPayReturnPageProps> = ({ onBackToBilling }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [result, setResult] = useState<VNPayCallbackResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
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
                Quay lại Quầy Thu Ngân
              </Button>
            </div>
          </div>
        ) : result ? (
          <div>
            <div className={`vnpay-return-header ${result.thanhCong ? 'success' : 'error'}`}>
              <div className={`vnpay-return-icon ${result.thanhCong ? 'success' : 'error'}`}>
                {result.thanhCong ? '✓' : '✕'}
              </div>
              <div style={{ marginBottom: '8px' }}>
                <span className={`badge ${result.thanhCong ? 'badge-completed' : 'badge-cancelled'}`} style={{ fontSize: '13px', padding: '6px 14px' }}>
                  {result.thanhCong ? 'GIAO DỊCH THÀNH CÔNG' : 'GIAO DỊCH KHÔNG THÀNH CÔNG'}
                </span>
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: result.thanhCong ? '#15803d' : '#b91c1c', marginBottom: '6px' }}>
                {result.thanhCong ? 'Thanh Toán Viện Phí Hoàn Tất' : 'Thanh Toán Bị Hủy Hoặc Thất Bại'}
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
                    <td style={{ textAlign: 'right', fontWeight: 800, fontSize: '18px', color: result.thanhCong ? '#059669' : '#b91c1c' }}>
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
                    <td style={{ color: '#64748b', fontWeight: 600 }}>Thời gian phản hồi:</td>
                    <td style={{ textAlign: 'right', color: '#64748b' }}>{result.thoiGian}</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#64748b', fontWeight: 600 }}>Mã phản hồi (vnp_ResponseCode):</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>
                      <span className="badge badge-info">{result.maPhanHoi}</span>
                    </td>
                  </tr>
                </tbody>
              </table>

              <div style={{ marginTop: '28px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <Button variant="primary" onClick={onBackToBilling}>
                  {result.thanhCong ? 'Quay lại Quản Lý Thu Ngân' : 'Quay lại Thử Lại Thanh Toán'}
                </Button>
                {result.thanhCong && (
                  <Button variant="secondary" onClick={() => window.print()}>
                    🖨️ In Biên Lai
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
