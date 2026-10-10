import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Alert } from '../components/common/Alert';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { MainLayout } from '../components/layout/MainLayout';
import { useAuth } from '../contexts/AuthContext';
import { ApiError } from '../services/authService';
import { hoaDonTongDoanhThuService } from '../services/hoaDonTongDoanhThuService';
import type {
  HoaDonTongDoanhThuRequest,
  HoaDonTongDoanhThuResponse,
} from '../types/HoaDonDoanhThu';
import './HoaDonTongDoanhThu.css';

const toInputDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const today = new Date();
const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

const formatDate = (value?: string | null): string => {
  if (!value) return '—';
  const [year, month, day] = value.split('-');
  return year && month && day ? `${day}/${month}/${year}` : value;
};

const formatMoney = (value: number | string | null | undefined): string => {
  const numericValue = typeof value === 'string' ? Number(value) : value;
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(numericValue) ? Number(numericValue) : 0);
};

const formatInteger = (value: number | null | undefined): string =>
  new Intl.NumberFormat('vi-VN').format(value ?? 0);

export const HoaDonTongDoanhThu: React.FC = () => {
  const { user, checkSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isPreviewMode = location.pathname === '/dev/uc23';

  const [tuNgay, setTuNgay] = useState(toInputDate(firstDayOfMonth));
  const [denNgay, setDenNgay] = useState(toInputDate(today));
  const [result, setResult] = useState<HoaDonTongDoanhThuResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!tuNgay || !denNgay) {
      setError('Vui lòng chọn cả ngày bắt đầu và ngày kết thúc.');
      return;
    }
    if (tuNgay > denNgay) {
      setError('Ngày bắt đầu không được sau ngày kết thúc.');
      return;
    }

    const request: HoaDonTongDoanhThuRequest = { tuNgay, denNgay };
    setHasSearched(true);

    // Route /dev/uc23 chỉ phục vụ xem thử bố cục UI, không gọi API và không dùng dữ liệu thật.
    if (isPreviewMode) {
      setResult({
        tuNgay,
        denNgay,
        tongDoanhThu: 4850000,
        soHoaDonDaThanhToan: 17,
        thongBao: 'Dữ liệu minh họa cho chế độ xem thử giao diện.',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await hoaDonTongDoanhThuService.xemTongDoanhThu(request);
      setResult(response);
    } catch (err: unknown) {
      setResult(null);
      if (err instanceof ApiError && err.status === 401) {
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        await checkSession();
        navigate('/login', { replace: true });
      } else if (err instanceof ApiError && err.status === 403) {
        setError('Tài khoản hiện tại không có quyền xem doanh thu. Chức năng này dành cho thu ngân.');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Không thể xem tổng doanh thu. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTuNgay(toInputDate(firstDayOfMonth));
    setDenNgay(toInputDate(today));
    setResult(null);
    setError(null);
    setHasSearched(false);
  };

  return (
    <MainLayout
      doctorName={user?.hoTen || (isPreviewMode ? 'Xem thử giao diện' : 'Thu ngân')}
      roleLabel={user?.vaiTro === 'THU_NGAN' ? 'Thu ngân' : isPreviewMode ? 'Chế độ xem thử' : 'Nhân viên'}
      sidebarItems={[
        { label: 'Dashboard', href: '/staff' },
        { label: 'Tra cứu hóa đơn', href: '/staff/hoadon/tra-cuu' },
        { label: 'Xem tổng doanh thu', href: '/staff/hoadon/tong-doanh-thu', active: !isPreviewMode },
      ]}
    >
      <div className="mc-revenue-page">
        {isPreviewMode && (
          <div className="mc-revenue-preview-banner">
            <span className="mc-revenue-preview-banner__dot" aria-hidden="true" />
            Chế độ xem thử giao diện — kết quả là dữ liệu minh họa, không lấy từ backend.
          </div>
        )}

        <header className="mc-revenue-heading">
          <div>
            <span className="mc-revenue-eyebrow">BÁO CÁO TÀI CHÍNH</span>
            <h1>Xem tổng doanh thu</h1>
            <p>Thống kê doanh thu từ các hóa đơn đã thanh toán trong khoảng thời gian đối soát.</p>
          </div>
          <div className="mc-revenue-heading__icon" aria-hidden="true">₫</div>
        </header>

        <Card title="Khoảng thời gian thống kê">
          <form className="mc-revenue-filter" onSubmit={handleSubmit}>
            <Input
              label="Từ ngày"
              type="date"
              value={tuNgay}
              onChange={(event) => setTuNgay(event.target.value)}
              max={denNgay || undefined}
              required
            />
            <div className="mc-revenue-range-separator" aria-hidden="true">đến</div>
            <Input
              label="Đến ngày"
              type="date"
              value={denNgay}
              onChange={(event) => setDenNgay(event.target.value)}
              min={tuNgay || undefined}
              required
            />
            <div className="mc-revenue-filter__actions">
              <Button type="button" variant="secondary" onClick={handleReset} disabled={loading}>
                Đặt lại
              </Button>
              <Button type="submit" loading={loading} loadingText="Đang thống kê...">
                Xem doanh thu
              </Button>
            </div>
          </form>
          <div className="mc-revenue-filter-note">
            <span aria-hidden="true">ⓘ</span>
            Chỉ tính hóa đơn đã thanh toán. Ngày bắt đầu và ngày kết thúc đều được tính vào kỳ thống kê.
          </div>
        </Card>

        {error && <Alert title="Không thể thống kê doanh thu" tone="error">{error}</Alert>}

        <section className="mc-revenue-results" aria-live="polite">
          <div className="mc-revenue-results__heading">
            <div>
              <h2>Kết quả thống kê</h2>
              <p>
                {result
                  ? `${formatDate(result.tuNgay)} – ${formatDate(result.denNgay)}`
                  : 'Chọn khoảng thời gian và nhấn “Xem doanh thu” để bắt đầu.'}
              </p>
            </div>
            {result && <span className="mc-revenue-period-chip">Đã thống kê</span>}
          </div>

          {result ? (
            <div className="mc-revenue-summary-grid">
              <Card className="mc-revenue-stat-card mc-revenue-stat-card--primary" padding="lg">
                <div className="mc-revenue-stat-card__topline">
                  <span className="mc-revenue-stat-card__label">Tổng doanh thu</span>
                  <span className="mc-revenue-stat-card__icon" aria-hidden="true">₫</span>
                </div>
                <div className="mc-revenue-stat-card__value">{formatMoney(result.tongDoanhThu)}</div>
                <div className="mc-revenue-stat-card__foot">Từ hóa đơn đã thanh toán trong kỳ</div>
              </Card>

              <Card className="mc-revenue-stat-card" padding="lg">
                <div className="mc-revenue-stat-card__topline">
                  <span className="mc-revenue-stat-card__label">Số hóa đơn đã thanh toán</span>
                  <span className="mc-revenue-stat-card__icon mc-revenue-stat-card__icon--neutral" aria-hidden="true">✓</span>
                </div>
                <div className="mc-revenue-stat-card__value">{formatInteger(result.soHoaDonDaThanhToan)} <small>hóa đơn</small></div>
                <div className="mc-revenue-stat-card__foot">Các hóa đơn có trạng thái đã thanh toán</div>
              </Card>
            </div>
          ) : (
            <div className="mc-revenue-empty-state">
              <div className="mc-revenue-empty-state__icon" aria-hidden="true">▤</div>
              <strong>{hasSearched ? 'Chưa có kết quả thống kê' : 'Chưa có dữ liệu được truy vấn'}</strong>
              <span>{hasSearched ? 'Kiểm tra thông báo lỗi hoặc chọn khoảng thời gian khác.' : 'Kết quả doanh thu và số hóa đơn sẽ hiển thị tại đây.'}</span>
            </div>
          )}

          {result && (
            <div className="mc-revenue-result-message">
              <span className="mc-revenue-result-message__check" aria-hidden="true">✓</span>
              <div>
                <strong>{isPreviewMode ? 'Dữ liệu xem thử' : result.thongBao || 'Thống kê doanh thu thành công.'}</strong>
                {isPreviewMode && <p>Đây là số liệu mẫu để kiểm tra giao diện. Hãy dùng route chính để kiểm thử API với dữ liệu thật.</p>}
              </div>
            </div>
          )}
        </section>
      </div>
    </MainLayout>
  );
};
