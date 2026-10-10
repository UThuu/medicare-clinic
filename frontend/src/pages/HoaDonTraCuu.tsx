import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert } from '../components/common/Alert';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { Select } from '../components/common/Select';
import { StatusBadge, type StatusTone } from '../components/common/StatusBadge';
import { Table, type TableColumn } from '../components/common/Table';
import { MainLayout } from '../components/layout/MainLayout';
import { useAuth } from '../contexts/AuthContext';
import { ApiError } from '../services/authService';
import { hoaDonService } from '../services/hoaDonService';
import type { ChiTietHoaDonItem, HoaDonItem, HoaDonTraCuuRequest, HoaDonTraCuuResponse, TrangThaiHoaDon } from '../types/HoaDon';
import './HoaDonTraCuu.css';

type InvoiceFilters = {
  idHoaDon: string;
  soDienThoaiBenhNhan: string;
  tuNgay: string;
  denNgay: string;
  trangThai: string;
};

const initialFilters: InvoiceFilters = {
  idHoaDon: '',
  soDienThoaiBenhNhan: '',
  tuNgay: '',
  denNgay: '',
  trangThai: '',
};

const money = (value: number | null | undefined) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value ?? 0);

// Backend LocalDateTime thường trả về yyyy-MM-ddTHH:mm:ss; định dạng trực tiếp để tránh lệch múi giờ.
const formatDateTime = (value?: string | null) => {
  if (!value) return '—';
  const [datePart, timePart = ''] = value.split('T');
  const [year, month, day] = datePart.split('-');
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}${timePart ? ` ${timePart.slice(0, 5)}` : ''}`;
};

const getInvoiceStatus = (status: TrangThaiHoaDon): { label: string; tone: StatusTone } => {
  if (status === 'DA_THANH_TOAN') return { label: 'Đã thanh toán', tone: 'success' };
  return { label: 'Chưa thanh toán', tone: 'warning' };
};

export const HoaDonTraCuu: React.FC = () => {
  const { user, checkSession } = useAuth();
  const navigate = useNavigate();

  const [filters, setFilters] = useState<InvoiceFilters>(initialFilters);
  const [result, setResult] = useState<HoaDonTraCuuResponse | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<HoaDonItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const updateFilter = (key: keyof InvoiceFilters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (filters.tuNgay && filters.denNgay && filters.tuNgay > filters.denNgay) {
      setError('Ngày bắt đầu không được sau ngày kết thúc.');
      return;
    }

    const request: HoaDonTraCuuRequest = {
      idHoaDon: filters.idHoaDon.trim() || undefined,
      soDienThoaiBenhNhan: filters.soDienThoaiBenhNhan.trim() || undefined,
      tuNgay: filters.tuNgay || undefined,
      denNgay: filters.denNgay || undefined,
      trangThai: (filters.trangThai || undefined) as TrangThaiHoaDon | undefined,
    };

    setLoading(true);
    try {
      const response = await hoaDonService.traCuuHoaDon(request);
      setResult(response);
      setHasSearched(true);
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 401) {
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        await checkSession();
        navigate('/login', { replace: true });
      } else if (err instanceof ApiError && err.status === 403) {
        setError('Tài khoản hiện tại không có quyền tra cứu hóa đơn. Chức năng này dành cho thu ngân.');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Không thể tra cứu hóa đơn. Vui lòng thử lại.');
      }
      setResult(null);
      setHasSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFilters(initialFilters);
    setResult(null);
    setError(null);
    setHasSearched(false);
    setSelectedInvoice(null);
  };

  const invoiceColumns: TableColumn<HoaDonItem>[] = [
    {
      key: 'idHoaDon',
      header: 'Mã hóa đơn',
      width: '130px',
      render: (invoice) => <strong>{invoice.idHoaDon}</strong>,
    },
    {
      key: 'benhNhan',
      header: 'Bệnh nhân',
      render: (invoice) => (
        <div>
          <strong style={{ display: 'block' }}>{invoice.hoTenBenhNhan || '—'}</strong>
          <span className="mc-invoice-muted">{invoice.soDienThoaiBenhNhan || 'Chưa có số điện thoại'}</span>
        </div>
      ),
    },
    {
      key: 'ngayTao',
      header: 'Ngày tạo',
      width: '145px',
      render: (invoice) => formatDateTime(invoice.ngayTao),
    },
    {
      key: 'tenBacSi',
      header: 'Bác sĩ',
      render: (invoice) => invoice.tenBacSi || invoice.maBacSi || '—',
    },
    {
      key: 'tongTien',
      header: 'Tổng tiền',
      align: 'right',
      render: (invoice) => <strong>{money(invoice.tongTien)}</strong>,
    },
    {
      key: 'trangThai',
      header: 'Trạng thái',
      render: (invoice) => {
        const status = getInvoiceStatus(invoice.trangThai);
        return <StatusBadge tone={status.tone}>{status.label}</StatusBadge>;
      },
    },
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'right',
      render: (invoice) => (
        <Button variant="secondary" size="sm" onClick={() => setSelectedInvoice(invoice)}>
          Chi tiết
        </Button>
      ),
    },
  ];

  const detailColumns: TableColumn<ChiTietHoaDonItem>[] = [
    { key: 'loaiChiPhi', header: 'Loại chi phí', render: (item) => item.loaiChiPhi || '—' },
    { key: 'moTa', header: 'Mô tả', render: (item) => item.moTa || '—' },
    { key: 'soLuong', header: 'SL', align: 'right', render: (item) => item.soLuong ?? 0 },
    { key: 'donGia', header: 'Đơn giá', align: 'right', render: (item) => money(item.donGia) },
    { key: 'thanhTien', header: 'Thành tiền', align: 'right', render: (item) => money(item.thanhTien) },
  ];

  return (
    <MainLayout
      doctorName={user?.hoTen || ''}
      roleLabel="Thu ngân"
      sidebarItems={[
        { label: 'Dashboard', href: '/staff' },
        { label: 'Tra cứu hóa đơn', href: '/staff/hoadon/tra-cuu', active: true },
      ]}
    >
      <div className="mc-invoice-page">
        <div className="mc-invoice-page__heading">
          <div>
            <h1>Tra cứu hóa đơn</h1>
            <p>Tìm kiếm hóa đơn theo mã hóa đơn, số điện thoại bệnh nhân, thời gian tạo hoặc trạng thái.</p>
          </div>
        </div>

        <Card title="Điều kiện tra cứu">
          <form className="mc-invoice-filters" onSubmit={handleSearch}>
            <Input
              label="Mã hóa đơn"
              value={filters.idHoaDon}
              onChange={(event) => updateFilter('idHoaDon', event.target.value)}
              placeholder="Nhập mã hóa đơn"
              autoComplete="off"
            />
            <Input
              label="Số điện thoại bệnh nhân"
              value={filters.soDienThoaiBenhNhan}
              onChange={(event) => updateFilter('soDienThoaiBenhNhan', event.target.value)}
              placeholder="Nhập số điện thoại"
              inputMode="tel"
              autoComplete="off"
            />
            <Select
              label="Trạng thái hóa đơn"
              value={filters.trangThai}
              onChange={(event) => updateFilter('trangThai', event.target.value)}
              placeholder="Tất cả trạng thái"
              options={[
                { value: 'CHUA_THANH_TOAN', label: 'Chưa thanh toán' },
                { value: 'DA_THANH_TOAN', label: 'Đã thanh toán' },
              ]}
            />
            <Input
              label="Từ ngày tạo"
              type="date"
              value={filters.tuNgay}
              onChange={(event) => updateFilter('tuNgay', event.target.value)}
            />
            <Input
              label="Đến ngày tạo"
              type="date"
              value={filters.denNgay}
              onChange={(event) => updateFilter('denNgay', event.target.value)}
            />
            <div className="mc-invoice-filters__actions">
              <Button type="button" variant="secondary" onClick={handleReset} disabled={loading}>
                Xóa bộ lọc
              </Button>
              <Button type="submit" loading={loading} loadingText="Đang tra cứu...">
                Tra cứu hóa đơn
              </Button>
            </div>
          </form>
        </Card>

        {error && (
          <Alert title="Không thể tra cứu hóa đơn" tone="error">
            {error}
          </Alert>
        )}

        <Card>
          <div className="mc-invoice-result-heading">
            <h2>Kết quả tra cứu</h2>
            {result && <span className="mc-invoice-muted">Tổng số kết quả: {result.tongSoKetQua}</span>}
          </div>
          {!hasSearched ? (
            <p className="mc-invoice-muted">Nhập một hoặc nhiều điều kiện, sau đó chọn “Tra cứu hóa đơn”. Nếu để trống bộ lọc, hệ thống sẽ tìm tất cả hóa đơn theo quy tắc của backend.</p>
          ) : result && result.danhSachHoaDon.length > 0 ? (
            <>
              <p className="mc-invoice-muted" style={{ marginTop: 0 }}>{result.thongBao}</p>
              <Table
                columns={invoiceColumns}
                data={result.danhSachHoaDon}
                rowKey={(invoice) => invoice.idHoaDon}
                emptyText="Không tìm thấy hóa đơn phù hợp."
              />
            </>
          ) : (
            <p className="mc-invoice-muted">{result?.thongBao || 'Không có dữ liệu để hiển thị.'}</p>
          )}
        </Card>
      </div>

      <Modal
        open={selectedInvoice !== null}
        title={selectedInvoice ? `Chi tiết hóa đơn ${selectedInvoice.idHoaDon}` : 'Chi tiết hóa đơn'}
        onClose={() => setSelectedInvoice(null)}
        width="lg"
      >
        {selectedInvoice && (
          <>
            <dl className="mc-invoice-detail-grid">
              <div><dt>Mã hóa đơn</dt><dd>{selectedInvoice.idHoaDon}</dd></div>
              <div><dt>Mã lượt khám</dt><dd>{selectedInvoice.idLuotKham || '—'}</dd></div>
              <div><dt>Bệnh nhân</dt><dd>{selectedInvoice.hoTenBenhNhan || '—'}</dd></div>
              <div><dt>Số điện thoại</dt><dd>{selectedInvoice.soDienThoaiBenhNhan || '—'}</dd></div>
              <div><dt>Bác sĩ</dt><dd>{selectedInvoice.tenBacSi || selectedInvoice.maBacSi || '—'}</dd></div>
              <div><dt>Thu ngân</dt><dd>{selectedInvoice.hoTenThuNgan || '—'}</dd></div>
              <div><dt>Ngày tạo</dt><dd>{formatDateTime(selectedInvoice.ngayTao)}</dd></div>
              <div>
                <dt>Trạng thái</dt>
                <dd>
                  <StatusBadge tone={getInvoiceStatus(selectedInvoice.trangThai).tone}>
                    {getInvoiceStatus(selectedInvoice.trangThai).label}
                  </StatusBadge>
                </dd>
              </div>
            </dl>
            <h3 style={{ margin: '0 0 12px', fontSize: '16px' }}>Các khoản phí</h3>
            <Table
              columns={detailColumns}
              data={selectedInvoice.chiTietHoaDon || []}
              rowKey={(item, index) => `${item.loaiChiPhi}-${item.moTa}-${index}`}
              emptyText="Hóa đơn chưa có chi tiết phí."
            />
            <div className="mc-invoice-total">
              <span>Tổng cộng</span>
              <strong>{money(selectedInvoice.tongTien)}</strong>
            </div>
          </>
        )}
      </Modal>
    </MainLayout>
  );
};
