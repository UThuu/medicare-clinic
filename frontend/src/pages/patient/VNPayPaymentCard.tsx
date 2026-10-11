import { useState } from 'react';
import '../cashier/billing.css';
import '../cashier/uc21Billing.css';

export function VNPayPaymentCard() {
  const [copiedKey, setCopiedKey] = useState('');
  const [copyError, setCopyError] = useState('');
  const sandbox = import.meta.env.VITE_VNPAY_SANDBOX !== 'false';
  const handleSaoChep = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      setCopyError('');
    } catch {
      setCopyError('Không thể sao chép tự động. Bạn có thể chọn và sao chép thông tin thẻ.');
    }
  };
  return <div className="mc-billing">
<div className="vnpay-payment-box" id="box-thanh-toan-vnpay">
                <div className="vnpay-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="vnpay-brand-badge">VNPAY GATEWAY</span>
                    <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '15px' }}>
                      Cổng thanh toán trực tuyến
                    </span>
                  </div>
                  {sandbox && <span className="vnpay-sandbox-badge">SANDBOX TEST</span>}
                </div>

                <div className="vnpay-info-card">
                  <div style={{ fontSize: '13px', color: '#334155', lineHeight: 1.6 }}>
                    Hệ thống sẽ kết nối an toàn với <strong>Cổng VNPay Gateway</strong>. Bệnh nhân có thể thanh toán qua:
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '10px', flexWrap: 'wrap' }}>
                    <span className="badge badge-info" style={{ padding: '4px 10px' }}>🏦 40+ Ngân hàng Nội địa (ATM)</span>
                    <span className="badge badge-info" style={{ padding: '4px 10px' }}>💳 Thẻ Quốc tế (Visa / Master / JCB)</span>
                    <span className="badge badge-info" style={{ padding: '4px 10px' }}>📱 Ví điện tử VNPAY</span>
                  </div>
                </div>

                {/* Thông tin thẻ thử nghiệm VNPay Sandbox */}
                {sandbox && <div className="vnpay-test-card" id="card-vnpay-sandbox-info">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#0369a1' }}>
                      🧪 THÔNG TIN THẺ TEST SANDBOX (NCB):
                    </span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Bấm nút chép để điền nhanh</span>
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
                </div>}
</div>
    {copyError && <p role="status">{copyError}</p>}
  </div>;
}
