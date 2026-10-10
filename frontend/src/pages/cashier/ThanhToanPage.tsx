import React, { useEffect, useState } from 'react';
import { HoaDonResponse, ThongTinThanhToanResponse } from '../../types/billing';
import { thanhToanService } from '../../services/thanhToanService';
import { Button } from './components/Button';
import { Modal } from './components/Modal';
import { StatusBadge } from './components/StatusBadge';

export const ThanhToanPage: React.FC = () => {
  const [danhSachHoaDon, setDanhSachHoaDon] = useState<HoaDonResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modal thanh toán
  const [selectedHoaDonId, setSelectedHoaDonId] = useState<string | null>(null);
  const [thongTinThanhToan, setThongTinThanhToan] = useState<ThongTinThanhToanResponse | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Form thanh toán
  const [phuongThuc, setPhuongThuc] = useState<string>('TIEN_MAT');
  const [ghiChu, setGhiChu] = useState<string>('');
  const [processing, setProcessing] = useState<boolean>(false);

  // Toast thông báo
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchDanhSach = async () => {
    try {
      setLoading(true);
      const data = await thanhToanService.layDanhSachHoaDonChuaThanhToan();
      setDanhSachHoaDon(data);
    } catch (err: any) {
      showToast('Không thể tải danh sách hóa đơn: ' + (err.response?.data?.error || err.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDanhSach();
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

  const handleOpenThanhToan = async (idHoaDon: string) => {
    setSelectedHoaDonId(idHoaDon);
    setIsModalOpen(true);
    setLoadingDetail(true);
    setPhuongThuc('TIEN_MAT');
    setGhiChu('');

    try {
      const data = await thanhToanService.layThongTinThanhToan(idHoaDon);
      setThongTinThanhToan(data);
    } catch (err: any) {
      showToast('Không thể tải chi tiết thanh toán: ' + (err.response?.data?.error || err.message), 'error');
      setIsModalOpen(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleXacNhanThanhToan = async () => {
    if (!selectedHoaDonId || !thongTinThanhToan) return;

    try {
      setProcessing(true);
      const res = await thanhToanService.xacNhanThanhToan({
        idHoaDon: selectedHoaDonId,
        phuongThuc,
        soTien: thongTinThanhToan.tongTien,
        ghiChu: ghiChu.trim() || undefined,
      });

      showToast(`✓ Thanh toán thành công hóa đơn ${res.idHoaDon}! Mã GD: ${res.maGiaoDich}`, 'success');
      setIsModalOpen(false);
      setSelectedHoaDonId(null);
      setThongTinThanhToan(null);
      fetchDanhSach();
    } catch (err: any) {
      showToast('Thanh toán thất bại: ' + (err.response?.data?.error || err.message), 'error');
    } finally {
      setProcessing(false);
    }
  };

  const filteredList = danhSachHoaDon.filter((hd) => {
    const q = searchTerm.toLowerCase();
    return (
      hd.idHoaDon.toLowerCase().includes(q) ||
      hd.tenBenhNhan.toLowerCase().includes(q) ||
      hd.soDienThoai.includes(q)
    );
  });

  const tongTienChoThu = danhSachHoaDon.reduce((acc, cur) => acc + (cur.tongTien || 0), 0);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`toast-msg ${toastMsg.type === 'success' ? 'toast-success' : 'toast-error'}`}
          id="app-toast"
        >
          <span>{toastMsg.type === 'success' ? '✅' : '⚠️'}</span>
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Summary Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' }}>
        <div className="med-card" style={{ margin: 0, padding: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
            Hóa đơn chờ thanh toán (UC-17)
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#0284c7', marginTop: '4px' }}>
            {danhSachHoaDon.length}
          </div>
          <div style={{ fontSize: '12px', color: '#059669', marginTop: '4px' }}>
            Sẵn sàng xử lý thanh toán tại quầy
          </div>
        </div>

        <div className="med-card" style={{ margin: 0, padding: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
            Tổng số tiền chờ thu viện phí
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#d97706', marginTop: '4px' }}>
            {formatVND(tongTienChoThu)}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            Bao gồm tiền khám và thuốc theo đơn
          </div>
        </div>

        <div className="med-card" style={{ margin: 0, padding: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
            Quầy thu ngân đang trực
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginTop: '6px' }}>
            Quầy 1 - TN-001
          </div>
          <div style={{ fontSize: '12px', color: '#0284c7', marginTop: '4px' }}>
            Thu ngân: Nguyễn Thị Thu Ngân
          </div>
        </div>
      </div>

      {/* Bảng danh sách hóa đơn chờ thanh toán */}
      <div className="med-card">
        <div className="med-card-header">
          <div className="med-card-title">
            <span>💳</span>
            <span>Hóa Đơn Chờ Thanh Toán Tại Quầy ({filteredList.length})</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input
              type="text"
              placeholder="🔍 Tìm mã HĐ, tên BN, SĐT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '8px 14px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '13px',
                width: '260px',
                outline: 'none',
              }}
            />
            <Button variant="secondary" size="sm" onClick={fetchDanhSach} loading={loading} id="btn-refresh-thanh-toan">
              🔄 Làm mới
            </Button>
          </div>
        </div>

        <div className="med-table-wrapper">
          <table className="med-table" id="table-hoa-don-cho-thanh-toan">
            <thead>
              <tr>
                <th>Mã HĐ</th>
                <th>Bệnh nhân</th>
                <th>Số điện thoại</th>
                <th>Bác sĩ khám</th>
                <th>Ngày lập</th>
                <th>Phí khám</th>
                <th>Tiền thuốc</th>
                <th style={{ textAlign: 'right' }}>Tổng cộng</th>
                <th style={{ textAlign: 'center' }}>Trạng thái</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                    ⏳ Đang tải danh sách hóa đơn chờ thanh toán...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                    ✨ Không có hóa đơn nào đang chờ thanh toán tại quầy.
                  </td>
                </tr>
              ) : (
                filteredList.map((hd) => (
                  <tr key={hd.idHoaDon} id={`row-hoa-don-${hd.idHoaDon}`}>
                    <td style={{ fontWeight: 700, color: '#0284c7' }}>{hd.idHoaDon}</td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{hd.tenBenhNhan}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Mã BN: {hd.maBenhNhan}</div>
                    </td>
                    <td>{hd.soDienThoai}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{hd.bacSiKham}</div>
                    </td>
                    <td style={{ fontSize: '13px', color: '#475569' }}>
                      {new Date(hd.ngayTao).toLocaleString('vi-VN')}
                    </td>
                    <td>{formatVND(hd.phiKham)}</td>
                    <td>{formatVND(hd.tienThuoc)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: '#0369a1', fontSize: '15px' }}>
                      {formatVND(hd.tongTien)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <StatusBadge status={hd.trangThai} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Button
                        id={`btn-thanh-toan-${hd.idHoaDon}`}
                        variant="primary"
                        size="sm"
                        onClick={() => handleOpenThanhToan(hd.idHoaDon)}
                      >
                        💳 Thanh toán
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL XÁC NHẬN THANH TOÁN (UC-17) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => !processing && setIsModalOpen(false)}
        title={
          thongTinThanhToan
            ? `XÁC NHẬN THANH TOÁN VIỆN PHÍ - ${thongTinThanhToan.idHoaDon}`
            : 'ĐANG TẢI THÔNG TIN THANH TOÁN...'
        }
        footer={
          thongTinThanhToan && (
            <>
              <Button
                variant="secondary"
                onClick={() => setIsModalOpen(false)}
                disabled={processing}
              >
                Hủy bỏ
              </Button>
              <Button
                id="btn-confirm-thanh-toan"
                variant="primary"
                onClick={handleXacNhanThanhToan}
                loading={processing}
              >
                ✓ Xác nhận thanh toán ({formatVND(thongTinThanhToan.tongTien)})
              </Button>
            </>
          )
        }
      >
        {loadingDetail ? (
          <div style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
            ⏳ Đang tải thông tin chi tiết hóa đơn...
          </div>
        ) : thongTinThanhToan ? (
          <div>
            {/* Tóm tắt thông tin bệnh nhân */}
            <div className="invoice-patient-card">
              <div className="info-item">
                <span className="info-label">Họ và tên bệnh nhân</span>
                <span className="info-value">{thongTinThanhToan.tenBenhNhan}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Mã bệnh nhân</span>
                <span className="info-value">{thongTinThanhToan.maBenhNhan}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Bác sĩ khám</span>
                <span className="info-value">{thongTinThanhToan.bacSiKham} ({thongTinThanhToan.chuyenKhoa})</span>
              </div>
              <div className="info-item">
                <span className="info-label">Chẩn đoán</span>
                <span className="info-value" style={{ color: '#0369a1' }}>
                  {thongTinThanhToan.chanDoan || 'Không có'}
                </span>
              </div>
            </div>

            {/* Bảng chi tiết các khoản thu */}
            <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px', color: '#334155' }}>
              Bảng Kê Chi Phí Dịch Vụ & Thuốc
            </h4>
            <table className="med-table" style={{ border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '16px' }}>
              <thead>
                <tr>
                  <th>Khoản thu</th>
                  <th style={{ textAlign: 'center' }}>Số lượng</th>
                  <th style={{ textAlign: 'right' }}>Đơn giá</th>
                  <th style={{ textAlign: 'right' }}>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {thongTinThanhToan.danhSachChiTiet.map((item, idx) => (
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

            {/* Banner Tổng số tiền cần thanh toán */}
            <div className="payment-total-banner">
              <div className="total-label">TỔNG SỐ TIỀN CẦN THANH TOÁN:</div>
              <div className="total-amount">
                {formatVND(thongTinThanhToan.tongTien)}
              </div>
            </div>

            {/* Bộ chọn Phương thức thanh toán (UC-17) */}
            <div className="payment-method-section">
              <h4>Phương thức thanh toán</h4>
              <div className="method-options">
                <label
                  className={`method-card ${
                    phuongThuc === 'TIEN_MAT' ? 'selected' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="TIEN_MAT"
                    checked={phuongThuc === 'TIEN_MAT'}
                    onChange={(e) => setPhuongThuc(e.target.value)}
                  />
                  <span className="method-icon">💵</span>
                  <div className="method-text">
                    <span className="method-title">Tiền mặt</span>
                    <span className="method-desc">Thu tiền trực tiếp tại quầy</span>
                  </div>
                </label>

                <label
                  className={`method-card ${
                    phuongThuc === 'VNPAY_QR' ? 'selected' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="VNPAY_QR"
                    checked={phuongThuc === 'VNPAY_QR'}
                    onChange={(e) => setPhuongThuc(e.target.value)}
                  />
                  <span className="method-icon">📱</span>
                  <div className="method-text">
                    <span className="method-title">Quét mã QR</span>
                    <span className="method-desc">VietQR / VNPay QR</span>
                  </div>
                </label>

                <label
                  className={`method-card ${
                    phuongThuc === 'CHUYEN_KHOAN' ? 'selected' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CHUYEN_KHOAN"
                    checked={phuongThuc === 'CHUYEN_KHOAN'}
                    onChange={(e) => setPhuongThuc(e.target.value)}
                  />
                  <span className="method-icon">🏦</span>
                  <div className="method-text">
                    <span className="method-title">Chuyển khoản</span>
                    <span className="method-desc">Chuyển khoản qua số tài khoản</span>
                  </div>
                </label>

                <label
                  className={`method-card ${
                    phuongThuc === 'TRUC_TUYEN' ? 'selected' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="TRUC_TUYEN"
                    checked={phuongThuc === 'TRUC_TUYEN'}
                    onChange={(e) => setPhuongThuc(e.target.value)}
                  />
                  <span className="method-icon">🌐</span>
                  <div className="method-text">
                    <span className="method-title">Trực tuyến</span>
                    <span className="method-desc">Cổng thanh toán điện tử</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Ghi chú giao dịch */}
            <div style={{ marginTop: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Ghi chú thanh toán (tùy chọn):
              </label>
              <input
                type="text"
                className="custom-input"
                placeholder="Ví dụ: Đã thu đủ tiền tại quầy số 1..."
                value={ghiChu}
                onChange={(e) => setGhiChu(e.target.value)}
              />
            </div>

            {/* Lịch sử các lần thử giao dịch nếu có */}
            {thongTinThanhToan.lichSuGiaoDich && thongTinThanhToan.lichSuGiaoDich.length > 0 && (
              <div className="history-section">
                <h5>Lịch sử giao dịch liên quan</h5>
                <ul className="history-list">
                  {thongTinThanhToan.lichSuGiaoDich.map((gd) => (
                    <li key={gd.idGiaoDich} className="history-item">
                      <span>Mã GD: <strong>{gd.maGiaoDich}</strong></span>
                      <span>{gd.phuongThuc}</span>
                      <span style={{ fontWeight: 700 }}>{formatVND(gd.soTien)}</span>
                      <StatusBadge status={gd.trangThai} />
                      <span style={{ fontSize: '11px', color: '#64748b' }}>
                        {new Date(gd.thoiGian).toLocaleTimeString('vi-VN')}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  );
};
