import React, { useEffect, useState } from 'react';
import { hoaDonService } from '../../services/hoaDonService';
import {
  ChiPhiKhamPreviewResponse,
  HoaDonResponse,
  LuotKhamChoHoaDonResponse,
} from '../../types/billing';
import { Button } from './components/Button';
import { StatusBadge } from './components/StatusBadge';
import { Modal } from './components/Modal';

export const TaoHoaDonPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cho-lap' | 'da-lap'>('cho-lap');
  const [danhSachChoLap, setDanhSachChoLap] = useState<LuotKhamChoHoaDonResponse[]>([]);
  const [danhSachHoaDon, setDanhSachHoaDon] = useState<HoaDonResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // State Modal Lập hóa đơn (UC-15, UC-16)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [previewData, setPreviewData] = useState<ChiPhiKhamPreviewResponse | null>(null);
  const [loadingPreview, setLoadingPreview] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [ghiChu, setGhiChu] = useState<string>('');

  // State Modal Xem chi tiết hóa đơn đã lập
  const [selectedInvoice, setSelectedInvoice] = useState<HoaDonResponse | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [choLapRes, hoaDonRes] = await Promise.all([
        hoaDonService.getDanhSachChoLapHoaDon(),
        hoaDonService.getDanhSachTatCaHoaDon(),
      ]);
      setDanhSachChoLap(choLapRes);
      setDanhSachHoaDon(hoaDonRes);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Không thể kết nối đến máy chủ backend (http://localhost:8080). Vui lòng đảm bảo backend đang chạy.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Mở modal lập hóa đơn và xem trước chi phí (UC-16)
  const handleOpenCreateInvoiceModal = async (idLuotKham: string) => {
    setLoadingPreview(true);
    try {
      const preview = await hoaDonService.getChiPhiDuKien(idLuotKham);
      setPreviewData(preview);
      setGhiChu('');
      setIsModalOpen(true);
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Không thể tải bảng kê chi phí!';
      showToast(msg, 'error');
    } finally {
      setLoadingPreview(false);
    }
  };

  // Xác nhận tạo hóa đơn (UC-15)
  const handleConfirmCreateInvoice = async () => {
    if (!previewData) return;

    setSubmitting(true);
    try {
      const res = await hoaDonService.taoHoaDon({
        idLuotKham: previewData.idLuotKham,
        maThuNgan: 'TN-001',
        ghiChu: ghiChu,
      });

      showToast(` Tạo hóa đơn thành công! Mã: ${res.idHoaDon}`, 'success');
      setIsModalOpen(false);
      setPreviewData(null);
      // Reload danh sách và chuyển sang tab hóa đơn đã lập
      await loadData();
      setActiveTab('da-lap');
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Lỗi khi tạo hóa đơn!';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Toast Notification */}
      {toastMsg && (
        <div className={`toast-msg ${toastMsg.type === 'success' ? 'toast-success' : 'toast-error'}`} id="app-toast">
          <span>{toastMsg.type === 'success' ? '✅' : '⚠️'}</span>
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Summary Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' }}>
        <div className="med-card" style={{ margin: 0, padding: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
            Lượt khám chờ lập hóa đơn
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#0284c7', marginTop: '4px' }}>
            {danhSachChoLap.length}
          </div>
          <div style={{ fontSize: '12px', color: '#059669', marginTop: '4px' }}>
            Đã hoàn tất khám và kê đơn
          </div>
        </div>

        <div className="med-card" style={{ margin: 0, padding: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
            Tổng số hóa đơn đã tạo
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#334155', marginTop: '4px' }}>
            {danhSachHoaDon.length}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            Lưu trong cơ sở dữ liệu
          </div>
        </div>

        <div className="med-card" style={{ margin: 0, padding: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
            Tổng giá trị hóa đơn đã lập
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#0d9488', marginTop: '6px' }}>
            {formatVND(danhSachHoaDon.reduce((acc, cur) => acc + (cur.tongTien || 0), 0))}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            Tiền khám + Tiền thuốc
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <button
          id="btn-tab-cho-lap"
          className={`tab-btn ${activeTab === 'cho-lap' ? 'active' : ''}`}
          onClick={() => setActiveTab('cho-lap')}
        >
          <span>📋 Chờ lập hóa đơn</span>
          <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '1px 8px', borderRadius: '12px', fontSize: '12px' }}>
            {danhSachChoLap.length}
          </span>
        </button>
        <button
          id="btn-tab-da-lap"
          className={`tab-btn ${activeTab === 'da-lap' ? 'active' : ''}`}
          onClick={() => setActiveTab('da-lap')}
        >
          <span>🧾 Danh sách hóa đơn đã lập</span>
          <span style={{ background: '#f1f5f9', color: '#475569', padding: '1px 8px', borderRadius: '12px', fontSize: '12px' }}>
            {danhSachHoaDon.length}
          </span>
        </button>
      </div>

      {/* Error state */}
      {errorMsg && (
        <div style={{ padding: '16px', background: '#ffe4e6', color: '#9f1239', borderRadius: '8px', marginBottom: '20px' }}>
          ⚠️ {errorMsg}
          <div style={{ marginTop: '8px' }}>
            <Button size="sm" variant="secondary" onClick={loadData}>Thử lại</Button>
          </div>
        </div>
      )}

      {/* TAB 1: Danh sách chờ lập hóa đơn (UC-15 Trigger) */}
      {activeTab === 'cho-lap' && (
        <div className="med-card">
          <div className="med-card-header">
            <div className="med-card-title">
              <span>🩺</span>
              <span>Bệnh nhân hoàn tất khám - Chờ thu ngân lập hóa đơn</span>
            </div>
            <Button variant="secondary" size="sm" onClick={loadData} loading={loading} id="btn-refresh-cho-lap">
              🔄 Làm mới
            </Button>
          </div>
          <div className="med-table-wrapper">
            <table className="med-table" id="table-luot-kham-cho-lap">
              <thead>
                <tr>
                  <th>Mã lượt khám</th>
                  <th>Bệnh nhân</th>
                  <th>Số điện thoại</th>
                  <th>Bác sĩ phụ trách</th>
                  <th>Chẩn đoán</th>
                  <th>Đơn thuốc</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                      ⏳ Đang tải danh sách lượt khám...
                    </td>
                  </tr>
                ) : danhSachChoLap.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                      ✨ Hiện không có lượt khám nào đang chờ lập hóa đơn.
                    </td>
                  </tr>
                ) : (
                  danhSachChoLap.map((item) => (
                    <tr key={item.idLuotKham} id={`row-luot-kham-${item.idLuotKham}`}>
                      <td style={{ fontWeight: 600, color: '#0369a1' }}>{item.idLuotKham}</td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.tenBenhNhan}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Mã BN: {item.maBenhNhan}</div>
                      </td>
                      <td>{item.soDienThoai}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{item.bacSiKham}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{item.chuyenKhoa}</div>
                      </td>
                      <td style={{ maxWidth: '240px' }}>
                        <div style={{ fontSize: '13px' }}>{item.chanDoan || item.lyDoKham || 'Chưa ghi chú'}</div>
                      </td>
                      <td>
                        {item.daCoDonThuoc ? (
                          <span style={{ color: '#059669', fontSize: '12px', fontWeight: 600 }}>💊 Đã có đơn</span>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '12px' }}>Không kê thuốc</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Button
                          id={`btn-lap-hoa-don-${item.idLuotKham}`}
                          size="sm"
                          variant="primary"
                          onClick={() => handleOpenCreateInvoiceModal(item.idLuotKham)}
                          loading={loadingPreview}
                        >
                          ➕ Lập hóa đơn
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Danh sách hóa đơn đã lập */}
      {activeTab === 'da-lap' && (
        <div className="med-card">
          <div className="med-card-header">
            <div className="med-card-title">
              <span>🧾</span>
              <span>Lịch sử các hóa đơn đã tạo</span>
            </div>
            <Button variant="secondary" size="sm" onClick={loadData} loading={loading} id="btn-refresh-da-lap">
              🔄 Làm mới
            </Button>
          </div>
          <div className="med-table-wrapper">
            <table className="med-table" id="table-hoa-don-da-lap">
              <thead>
                <tr>
                  <th>Mã hóa đơn</th>
                  <th>Bệnh nhân</th>
                  <th>Thu ngân lập</th>
                  <th>Ngày lập</th>
                  <th>Tiền khám</th>
                  <th>Tiền thuốc</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                      ⏳ Đang tải danh sách hóa đơn...
                    </td>
                  </tr>
                ) : danhSachHoaDon.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                      Chưa có hóa đơn nào được tạo trong hệ thống.
                    </td>
                  </tr>
                ) : (
                  danhSachHoaDon.map((hd) => (
                    <tr key={hd.idHoaDon} id={`row-hoa-don-${hd.idHoaDon}`}>
                      <td style={{ fontWeight: 700, color: '#0284c7' }}>{hd.idHoaDon}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{hd.tenBenhNhan}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{hd.soDienThoai}</div>
                      </td>
                      <td>{hd.thuNganLap}</td>
                      <td style={{ fontSize: '12px' }}>
                        {new Date(hd.ngayTao).toLocaleString('vi-VN')}
                      </td>
                      <td>{formatVND(hd.phiKham)}</td>
                      <td>{formatVND(hd.tienThuoc)}</td>
                      <td style={{ fontWeight: 800, color: '#0369a1', fontSize: '15px' }}>
                        {formatVND(hd.tongTien)}
                      </td>
                      <td>
                        <StatusBadge status={hd.trangThai} />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Button
                          id={`btn-xem-hd-${hd.idHoaDon}`}
                          size="sm"
                          variant="secondary"
                          onClick={() => setSelectedInvoice(hd)}
                        >
                          👁️ Xem
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL LẬP HÓA ĐƠN & TÍNH TỔNG CHI PHÍ (UC-15 & UC-16) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Lập Hóa Đơn Khám Chữa Bệnh (UC-15)"
        footer={
          <>
            <Button
              id="btn-cancel-create-invoice"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={submitting}
            >
              Hủy bỏ
            </Button>
            <Button
              id="btn-confirm-create-invoice"
              variant="primary"
              onClick={handleConfirmCreateInvoice}
              loading={submitting}
            >
              💾 Xác nhận tạo hóa đơn
            </Button>
          </>
        }
      >
        {previewData && (
          <div>
            {/* Thẻ bệnh nhân */}
            <div className="invoice-patient-card">
              <div className="info-item">
                <span className="info-label">Họ và tên bệnh nhân</span>
                <span className="info-value" id="modal-patient-name">{previewData.tenBenhNhan}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Số điện thoại</span>
                <span className="info-value">{previewData.soDienThoai || 'Chưa cập nhật'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Bác sĩ khám</span>
                <span className="info-value">{previewData.bacSiKham} ({previewData.chuyenKhoa})</span>
              </div>
              <div className="info-item">
                <span className="info-label">Chẩn đoán</span>
                <span className="info-value" style={{ color: '#0369a1' }}>{previewData.chanDoan || 'Không có'}</span>
              </div>
            </div>

            {/* Bảng kê chi tiết chi phí */}
            <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px', color: '#334155' }}>
              Bảng Kê Chi Phí Dịch Vụ & Đơn Thuốc
            </h4>
            <table className="med-table" style={{ border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <thead>
                <tr>
                  <th>Khoản thu</th>
                  <th>ĐVT</th>
                  <th>SL</th>
                  <th>Đơn giá</th>
                  <th style={{ textAlign: 'right' }}>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {previewData.danhSachKhoanThu.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.tenKhoanThu}</div>
                      {item.huongDan && (
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{item.huongDan}</div>
                      )}
                    </td>
                    <td>{item.donViTinh || '-'}</td>
                    <td>{item.soLuong}</td>
                    <td>{formatVND(item.donGia)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      {formatVND(item.thanhTien)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Khối tổng kết chi phí (UC-16 Tính tổng chi phí) */}
            <div className="bill-summary-box">
              <div className="bill-summary-row">
                <span>Phí khám lâm sàng:</span>
                <span style={{ fontWeight: 600 }}>{formatVND(previewData.phiKham)}</span>
              </div>
              <div className="bill-summary-row">
                <span>Tổng tiền thuốc:</span>
                <span style={{ fontWeight: 600 }}>{formatVND(previewData.tienThuoc)}</span>
              </div>
              <div className="bill-total-row">
                <span>TỔNG CỘNG THANH TOÁN (UC-16):</span>
                <span className="bill-total-amount" id="modal-total-amount">
                  {formatVND(previewData.tongTien)}
                </span>
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                Ghi chú hóa đơn (tùy chọn):
              </label>
              <input
                id="input-invoice-note"
                type="text"
                placeholder="Nhập ghi chú cho bệnh nhân hoặc quầy thu ngân..."
                value={ghiChu}
                onChange={(e) => setGhiChu(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                }}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL XEM CHI TIẾT HÓA ĐƠN ĐÃ LẬP */}
      <Modal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        title={`Chi Tiết Hóa Đơn: ${selectedInvoice?.idHoaDon}`}
        footer={
          <Button variant="secondary" onClick={() => setSelectedInvoice(null)}>
            Đóng
          </Button>
        }
      >
        {selectedInvoice && (
          <div>
            <div className="invoice-patient-card">
              <div className="info-item">
                <span className="info-label">Mã hóa đơn</span>
                <span className="info-value" style={{ color: '#0284c7' }}>{selectedInvoice.idHoaDon}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Trạng thái</span>
                <span className="info-value">
                  <StatusBadge status={selectedInvoice.trangThai} />
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Bệnh nhân</span>
                <span className="info-value">{selectedInvoice.tenBenhNhan}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Thu ngân lập</span>
                <span className="info-value">{selectedInvoice.thuNganLap}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Thời gian tạo</span>
                <span className="info-value">
                  {new Date(selectedInvoice.ngayTao).toLocaleString('vi-VN')}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Bác sĩ khám</span>
                <span className="info-value">{selectedInvoice.bacSiKham}</span>
              </div>
            </div>

            <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px' }}>
              Danh mục các khoản đã tính vào hóa đơn:
            </h4>
            <table className="med-table" style={{ border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <thead>
                <tr>
                  <th>Mục</th>
                  <th>ĐVT</th>
                  <th>SL</th>
                  <th>Đơn giá</th>
                  <th style={{ textAlign: 'right' }}>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {selectedInvoice.danhSachChiTiet.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.tenKhoanThu}</div>
                      {item.huongDan && <div style={{ fontSize: '11px', color: '#64748b' }}>{item.huongDan}</div>}
                    </td>
                    <td>{item.donViTinh || '-'}</td>
                    <td>{item.soLuong}</td>
                    <td>{formatVND(item.donGia)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatVND(item.thanhTien)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="bill-summary-box">
              <div className="bill-total-row" style={{ borderTop: 'none', padding: 0 }}>
                <span>TỔNG TIỀN HÓA ĐƠN:</span>
                <span className="bill-total-amount">{formatVND(selectedInvoice.tongTien)}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
