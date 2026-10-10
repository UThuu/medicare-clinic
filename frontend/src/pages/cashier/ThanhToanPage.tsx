import React, { useEffect, useState } from 'react';
import {
  HoaDonResponse,
  ThongTinThanhToanResponse,
  ThongTinQrResponse,
} from '../../types/billing';
import { thanhToanService } from '../../services/thanhToanService';
import { Button } from './components/Button';
import { Modal } from './components/Modal';
import { StatusBadge } from './components/StatusBadge';
import { InHoaDonModal } from './components/InHoaDonModal';

export const ThanhToanPage: React.FC = () => {
  const [danhSachHoaDon, setDanhSachHoaDon] = useState<HoaDonResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modal thanh toán
  const [selectedHoaDonId, setSelectedHoaDonId] = useState<string | null>(null);
  const [thongTinThanhToan, setThongTinThanhToan] = useState<ThongTinThanhToanResponse | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Modal In hóa đơn (UC-21)
  const [printInvoiceId, setPrintInvoiceId] = useState<string | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  // Form thanh toán
  const [phuongThuc, setPhuongThuc] = useState<string>('TIEN_MAT');
  const [tienKhachDuaInput, setTienKhachDuaInput] = useState<string>('');
  const [ghiChu, setGhiChu] = useState<string>('');
  const [processing, setProcessing] = useState<boolean>(false);

  // QR Code & Ngân hàng (UC-19)
  const [thongTinQr, setThongTinQr] = useState<ThongTinQrResponse | null>(null);
  const [loadingQr, setLoadingQr] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

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

  const loadQrCode = async (idHoaDon: string) => {
    try {
      setLoadingQr(true);
      const qrData = await thanhToanService.layThongTinQrThanhToan(idHoaDon);
      setThongTinQr(qrData);
    } catch (err: any) {
      showToast('Không thể tạo mã QR ngân hàng: ' + (err.response?.data?.error || err.message), 'error');
    } finally {
      setLoadingQr(false);
    }
  };

  const handleOpenThanhToan = async (idHoaDon: string) => {
    setSelectedHoaDonId(idHoaDon);
    setIsModalOpen(true);
    setLoadingDetail(true);
    setPhuongThuc('TIEN_MAT');
    setGhiChu('');
    setTienKhachDuaInput('');
    setThongTinQr(null);
    setCopiedKey(null);

    try {
      const data = await thanhToanService.layThongTinThanhToan(idHoaDon);
      setThongTinThanhToan(data);
      // Mặc định gợi ý đúng số tiền
      if (data && data.tongTien) {
        setTienKhachDuaInput(data.tongTien.toString());
      }
    } catch (err: any) {
      showToast('Không thể tải chi tiết thanh toán: ' + (err.response?.data?.error || err.message), 'error');
      setIsModalOpen(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleChonPhuongThuc = (pt: string) => {
    setPhuongThuc(pt);
    if (pt === 'VNPAY_QR' && selectedHoaDonId && !thongTinQr) {
      loadQrCode(selectedHoaDonId);
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

  const tongTien = thongTinThanhToan?.tongTien || 0;
  const tienKhachDuaNumber = parseFloat(tienKhachDuaInput) || 0;
  const tienThoiLai = tienKhachDuaNumber - tongTien;
  const isDuTien = tienKhachDuaNumber >= tongTien;
  const isChuaNhap = !tienKhachDuaInput.trim() || tienKhachDuaNumber === 0;

  const handleXacNhanThanhToan = async () => {
    if (!selectedHoaDonId || !thongTinThanhToan) return;

    if (phuongThuc === 'TIEN_MAT') {
      if (isChuaNhap) {
        showToast('Vui lòng nhập số tiền khách đưa!', 'error');
        return;
      }
      if (!isDuTien) {
        showToast(`Số tiền khách đưa chưa đủ! Còn thiếu: ${formatVND(Math.abs(tienThoiLai))}`, 'error');
        return;
      }

      try {
        setProcessing(true);
        const res = await thanhToanService.thanhToanTienMat({
          idHoaDon: selectedHoaDonId,
          tienKhachDua: tienKhachDuaNumber,
          ghiChu: ghiChu.trim() || undefined,
        });

        showToast(
          `✓ Thanh toán tiền mặt thành công! HĐ: ${res.idHoaDon} | Tiền thối lại: ${formatVND(res.tienThoiLai)}`,
          'success'
        );
        setIsModalOpen(false);
        // UC-21: Tự động mở modal in hóa đơn sau khi thanh toán thành công
        setPrintInvoiceId(res.idHoaDon);
        setIsPrintModalOpen(true);
        setSelectedHoaDonId(null);
        setThongTinThanhToan(null);
        fetchDanhSach();
      } catch (err: any) {
        showToast('Thanh toán tiền mặt thất bại: ' + (err.response?.data?.error || err.message), 'error');
      } finally {
        setProcessing(false);
      }
    } else if (phuongThuc === 'VNPAY_QR') {
      // UC-19: Xác nhận thanh toán QR / Chuyển khoản ngân hàng
      try {
        setProcessing(true);
        const res = await thanhToanService.xacNhanThanhToanQr({
          idHoaDon: selectedHoaDonId,
          ghiChu: ghiChu.trim() || undefined,
        });

        showToast(
          `✓ Thanh toán QR thành công hóa đơn ${res.idHoaDon}! Mã GD: ${res.maGiaoDich}`,
          'success'
        );
        setIsModalOpen(false);
        // UC-21: Tự động mở modal in hóa đơn sau khi thanh toán thành công
        setPrintInvoiceId(res.idHoaDon);
        setIsPrintModalOpen(true);
        setSelectedHoaDonId(null);
        setThongTinThanhToan(null);
        fetchDanhSach();
      } catch (err: any) {
        showToast('Xác nhận thanh toán QR thất bại: ' + (err.response?.data?.error || err.message), 'error');
      } finally {
        setProcessing(false);
      }
    } else if (phuongThuc === 'TRUC_TUYEN') {
      // UC-20: Thanh toán trực tuyến qua Cổng VNPay Gateway
      try {
        setProcessing(true);
        const res = await thanhToanService.taoGiaoDichVNPay(selectedHoaDonId);
        if (res.paymentUrl) {
          sessionStorage.setItem('vnpay_source_role', 'cashier');
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
    } else {
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
        // UC-21: Tự động mở modal in hóa đơn sau khi thanh toán thành công
        setPrintInvoiceId(res.idHoaDon);
        setIsPrintModalOpen(true);
        setSelectedHoaDonId(null);
        setThongTinThanhToan(null);
        fetchDanhSach();
      } catch (err: any) {
        showToast('Thanh toán thất bại: ' + (err.response?.data?.error || err.message), 'error');
      } finally {
        setProcessing(false);
      }
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
            Hóa đơn chờ thanh toán (UC-17, UC-18)
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
                disabled={
                  processing ||
                  (phuongThuc === 'TIEN_MAT' && (!isDuTien || isChuaNhap)) ||
                  (phuongThuc === 'VNPAY_QR' && loadingQr)
                }
              >
                {phuongThuc === 'TIEN_MAT'
                  ? `✓ Xác nhận thu tiền mặt (${formatVND(thongTinThanhToan.tongTien)})`
                  : phuongThuc === 'VNPAY_QR'
                  ? `✓ Xác nhận đã nhận chuyển khoản QR (${formatVND(thongTinThanhToan.tongTien)})`
                  : phuongThuc === 'TRUC_TUYEN'
                  ? `🔗 Chuyển đến Cổng VNPay (${formatVND(thongTinThanhToan.tongTien)})`
                  : `✓ Xác nhận thanh toán (${formatVND(thongTinThanhToan.tongTien)})`}
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

            {/* Bộ chọn Phương thức thanh toán (UC-17, UC-18, UC-19, UC-20) */}
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
                    onChange={(e) => handleChonPhuongThuc(e.target.value)}
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
                  id="tab-method-qr"
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="VNPAY_QR"
                    checked={phuongThuc === 'VNPAY_QR'}
                    onChange={(e) => handleChonPhuongThuc(e.target.value)}
                  />
                  <span className="method-icon">📱</span>
                  <div className="method-text">
                    <span className="method-title">QR / Chuyển khoản</span>
                    <span className="method-desc">VietQR / Vietcombank</span>
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
                    onChange={(e) => handleChonPhuongThuc(e.target.value)}
                  />
                  <span className="method-icon">🌐</span>
                  <div className="method-text">
                    <span className="method-title">Trực tuyến</span>
                    <span className="method-desc">Cổng thanh toán điện tử</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Chi tiết thanh toán tiền mặt (UC-18) */}
            {phuongThuc === 'TIEN_MAT' && (
              <div className="cash-payment-box" id="box-thanh-toan-tien-mat">
                <div className="cash-header">
                  <div className="cash-title">
                    <span>💵</span>
                    <span>Chi Tiết Thu Tiền Mặt (UC-18)</span>
                  </div>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    Tự động tính tiền thối lại cho khách
                  </span>
                </div>

                <div>
                  <label
                    htmlFor="input-tien-khach-dua"
                    style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}
                  >
                    Số tiền khách đưa:
                  </label>
                  <div className="cash-input-wrapper">
                    <input
                      id="input-tien-khach-dua"
                      type="number"
                      className="cash-input-field"
                      placeholder="Nhập số tiền khách đưa..."
                      value={tienKhachDuaInput}
                      onChange={(e) => setTienKhachDuaInput(e.target.value)}
                      min={0}
                      step={1000}
                    />
                    <span className="cash-input-currency">VNĐ</span>
                  </div>

                  {/* Nút gợi ý mệnh giá tiền nhanh */}
                  <div className="quick-cash-row">
                    <button
                      type="button"
                      className={`quick-cash-btn ${tienKhachDuaNumber === tongTien ? 'active' : ''}`}
                      onClick={() => setTienKhachDuaInput(tongTien.toString())}
                      id="btn-quick-exact"
                    >
                      🎯 Đúng số tiền ({formatVND(tongTien)})
                    </button>
                    {[100000, 200000, 500000, 1000000]
                      .filter((val) => val !== tongTien)
                      .map((val) => (
                        <button
                          key={val}
                          type="button"
                          className={`quick-cash-btn ${tienKhachDuaNumber === val ? 'active' : ''}`}
                          onClick={() => setTienKhachDuaInput(val.toString())}
                          id={`btn-quick-${val}`}
                        >
                          {formatVND(val)}
                        </button>
                      ))}
                  </div>
                </div>

                {/* Kết quả tiền thối hoặc cảnh báo thiếu */}
                {isChuaNhap ? (
                  <div className="cash-change-card neutral">
                    <span className="change-label">Vui lòng nhập số tiền khách đưa để tính tiền thối</span>
                    <span className="change-amount">0 đ</span>
                  </div>
                ) : isDuTien ? (
                  <div className="cash-change-card success" id="card-tien-thoi-lai">
                    <div>
                      <div className="change-label">✓ Tiền thối lại cho khách:</div>
                      <div style={{ fontSize: '11px', color: '#166534', marginTop: '2px' }}>
                        Khách đưa: {formatVND(tienKhachDuaNumber)} | Tổng cần thu: {formatVND(tongTien)}
                      </div>
                    </div>
                    <div className="change-amount" id="val-tien-thoi-lai">
                      {formatVND(tienThoiLai)}
                    </div>
                  </div>
                ) : (
                  <div className="cash-change-card warning" id="card-tien-thieu">
                    <div>
                      <div className="change-label">⚠️ Khách đưa chưa đủ tiền!</div>
                      <div style={{ fontSize: '11px', color: '#9f1239', marginTop: '2px' }}>
                        Còn thiếu so với hóa đơn
                      </div>
                    </div>
                    <div className="change-amount" id="val-tien-thieu">
                      - {formatVND(Math.abs(tienThoiLai))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Chi tiết quét mã QR & Chuyển khoản ngân hàng (UC-19) */}
            {phuongThuc === 'VNPAY_QR' && (
              <div className="qr-payment-box" id="box-thanh-toan-qr">
                <div className="qr-header">
                  <div className="qr-header-title">
                    <span>📱</span>
                    <span>Thanh Toán Bằng QR / Chuyển Khoản Ngân Hàng (UC-19)</span>
                  </div>
                  <span className="qr-bank-badge">VIETCOMBANK 24/7</span>
                </div>

                {loadingQr ? (
                  <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    ⏳ Đang khởi tạo mã VietQR từ Vietcombank...
                  </div>
                ) : thongTinQr ? (
                  <div className="qr-content-grid">
                    {/* Cột trái: Ảnh mã VietQR */}
                    <div className="qr-image-card">
                      <div className="qr-image-wrapper">
                        {thongTinQr.qrImageUrl ? (
                          <img
                            id="vietqr-image"
                            src={thongTinQr.qrImageUrl}
                            alt="VietQR Vietcombank"
                            onError={(e) => {
                              // Fallback nếu có lỗi mạng
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div style={{ padding: '20px', color: '#64748b' }}>Mã QR không khả dụng</div>
                        )}
                      </div>
                      <div className="qr-scan-hint">
                        Quét bằng App <strong>Vietcombank</strong> hoặc bất kỳ ngân hàng nào
                      </div>
                    </div>

                    {/* Cột phải: Thông tin chuyển khoản chi tiết */}
                    <div className="qr-details-card">
                      <div className="qr-info-row">
                        <span className="qr-info-label">Ngân hàng:</span>
                        <div className="qr-info-val-group">
                          <span className="qr-info-value" style={{ color: '#008848' }}>
                            {thongTinQr.nganHang} (VCB)
                          </span>
                        </div>
                      </div>

                      <div className="qr-info-row">
                        <span className="qr-info-label">Chủ tài khoản:</span>
                        <div className="qr-info-val-group">
                          <span className="qr-info-value" id="val-ten-chu-tk">
                            {thongTinQr.tenChuTaiKhoan}
                          </span>
                        </div>
                      </div>

                      <div className="qr-info-row">
                        <span className="qr-info-label">Số tài khoản:</span>
                        <div className="qr-info-val-group">
                          <span className="qr-info-value" id="val-so-tai-khoan" style={{ letterSpacing: '0.5px' }}>
                            {thongTinQr.soTaiKhoan}
                          </span>
                          <button
                            type="button"
                            className={`qr-copy-btn ${copiedKey === 'stk' ? 'copied' : ''}`}
                            onClick={() => handleSaoChep('stk', thongTinQr.soTaiKhoan)}
                            id="btn-copy-stk"
                          >
                            {copiedKey === 'stk' ? '✓ Đã chép' : '📋 Chép'}
                          </button>
                        </div>
                      </div>

                      <div className="qr-info-row">
                        <span className="qr-info-label">Số tiền:</span>
                        <div className="qr-info-val-group">
                          <span className="qr-info-value" style={{ color: '#0369a1', fontSize: '15px' }} id="val-so-tien-qr">
                            {formatVND(thongTinQr.soTien)}
                          </span>
                          <button
                            type="button"
                            className={`qr-copy-btn ${copiedKey === 'tien' ? 'copied' : ''}`}
                            onClick={() => handleSaoChep('tien', thongTinQr.soTien.toString())}
                            id="btn-copy-tien"
                          >
                            {copiedKey === 'tien' ? '✓ Đã chép' : '📋 Chép'}
                          </button>
                        </div>
                      </div>

                      <div className="qr-info-row">
                        <span className="qr-info-label">Nội dung CK:</span>
                        <div className="qr-info-val-group">
                          <span className="qr-info-value" style={{ color: '#d97706' }} id="val-noi-dung-qr">
                            {thongTinQr.noiDung}
                          </span>
                          <button
                            type="button"
                            className={`qr-copy-btn ${copiedKey === 'noidung' ? 'copied' : ''}`}
                            onClick={() => handleSaoChep('noidung', thongTinQr.noiDung)}
                            id="btn-copy-noidung"
                          >
                            {copiedKey === 'noidung' ? '✓ Đã chép' : '📋 Chép'}
                          </button>
                        </div>
                      </div>

                      {/* Hướng dẫn quy trình thu ngân */}
                      <div className="qr-guide-box">
                        <span style={{ fontSize: '18px', lineHeight: 1 }}>💡</span>
                        <div style={{ fontSize: '12px', color: '#166534', lineHeight: 1.5 }}>
                          <strong>Quy trình thu ngân:</strong> Hướng dẫn bệnh nhân mở app ngân hàng quét mã VietQR bên cạnh. Sau khi kiểm tra điện thoại/loa quầy báo nhận tiền thành công, bấm nút <strong>"Xác nhận đã nhận chuyển khoản QR"</strong> bên dưới để hoàn tất hóa đơn.
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#ef4444' }}>
                    Không thể hiển thị thông tin QR. Vui lòng thử lại!
                  </div>
                )}
              </div>
            )}

            {/* Chi tiết cổng thanh toán trực tuyến VNPay Gateway (UC-20) */}
            {phuongThuc === 'TRUC_TUYEN' && (
              <div className="vnpay-payment-box" id="box-thanh-toan-vnpay">
                <div className="vnpay-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="vnpay-brand-badge">VNPAY GATEWAY</span>
                    <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '15px' }}>
                      Cổng Thanh Toán Trực Tuyến (UC-20)
                    </span>
                  </div>
                  <span className="vnpay-sandbox-badge">SANDBOX TEST</span>
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
                <div className="vnpay-test-card" id="card-vnpay-sandbox-info">
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
                </div>

                <div style={{ marginTop: '16px' }}>
                  <button
                    type="button"
                    className="vnpay-btn-primary"
                    id="btn-goto-vnpay"
                    onClick={handleXacNhanThanhToan}
                    disabled={processing}
                  >
                    <span>{processing ? '⏳ Đang kết nối Cổng VNPay...' : '🔗 Chuyển Đến Cổng Thanh Toán VNPay'}</span>
                    {!processing && <span>→</span>}
                  </button>
                </div>
              </div>
            )}


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
          </div>
        ) : null}
      </Modal>

      {/* UC-21: MODAL IN HÓA ĐƠN CHI TIẾT */}
      <InHoaDonModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        idHoaDon={printInvoiceId}
      />
    </div>
  );
};
