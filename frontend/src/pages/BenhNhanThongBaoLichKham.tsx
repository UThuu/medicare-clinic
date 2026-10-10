import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import {
  benhNhanThongBaoLichKhamService,
  BenhNhanThongBaoApiError,
} from '../services/benhNhanThongBaoLichKhamService';
import type {
  BenhNhanThongBaoLichKhamResponse,
  LoaiThongBaoLichKham,
  ThongBaoLichKhamItem,
} from '../types/BenhNhanThongBaoLichKham';
import './benhNhanThongBaoLichKham.css';

interface Props {
  /** Route /dev/uc25 dùng dữ liệu minh họa và không gọi API. */
  isDemo?: boolean;
}

type BoLoc = 'TAT_CA' | LoaiThongBaoLichKham;

const taoDuLieuMinhHoa = (): BenhNhanThongBaoLichKhamResponse => ({
  thoiDiemTruyVan: new Date().toISOString(),
  tongSoThongBao: 3,
  danhSachThongBao: [
    {
      idLichKham: 'LK-DEMO-001',
      loaiThongBao: 'NHAC_LICH_1_NGAY',
      tieuDe: 'Nhắc lịch khám ngày mai',
      noiDung: 'Bạn có lịch khám vào ngày mai. Vui lòng đến sớm 10–15 phút để làm thủ tục tiếp nhận.',
      maBacSi: 'BS001',
      hoTenBacSi: 'Nguyễn Minh Anh',
      ngayKham: ngayCong(1),
      gioKham: '08:30:00',
      trangThaiLichKham: 'DA_DAT',
      thoiDiemNhac: `${ngayCong(0)}T08:30:00`,
    },
    {
      idLichKham: 'LK-DEMO-002',
      loaiThongBao: 'XAC_NHAN_DAT_LICH',
      tieuDe: 'Xác nhận lịch khám',
      noiDung: 'Lịch khám của bạn đã được ghi nhận. Vui lòng kiểm tra lại thời gian khám.',
      maBacSi: 'BS002',
      hoTenBacSi: 'Trần Hoàng Nam',
      ngayKham: ngayCong(3),
      gioKham: '14:00:00',
      trangThaiLichKham: 'DA_DAT',
      thoiDiemNhac: null,
    },
    {
      idLichKham: 'LK-DEMO-003',
      loaiThongBao: 'NHAC_LICH_2_GIO',
      tieuDe: 'Nhắc lịch khám trong 2 giờ tới',
      noiDung: 'Lịch khám của bạn sắp bắt đầu. Hãy chuẩn bị và đến phòng khám đúng giờ.',
      maBacSi: 'BS003',
      hoTenBacSi: 'Lê Thu Hà',
      ngayKham: ngayCong(0),
      gioKham: '16:00:00',
      trangThaiLichKham: 'DA_TIEP_NHAN',
      thoiDiemNhac: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    },
  ],
});

function ngayCong(soNgay: number): string {
  const date = new Date();
  date.setDate(date.getDate() + soNgay);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function dinhDangNgay(value?: string | null): string {
  if (!value) return 'Chưa có thông tin';
  const parts = value.slice(0, 10).split('-');
  if (parts.length !== 3) return value;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function dinhDangGio(value?: string | null): string {
  if (!value) return '—';
  return value.slice(0, 5);
}

function dinhDangThoiDiem(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.replace('T', ' ');
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(date);
}

function nhanLoaiThongBao(type: string): string {
  switch (type) {
    case 'XAC_NHAN_DAT_LICH': return 'Xác nhận đặt lịch';
    case 'NHAC_LICH_1_NGAY': return 'Nhắc trước 1 ngày';
    case 'NHAC_LICH_2_GIO': return 'Nhắc trước 2 giờ';
    default: return 'Thông báo lịch khám';
  }
}

function nhanTrangThai(status: string): string {
  switch (status) {
    case 'DA_DAT': return 'Đã đặt';
    case 'DA_TIEP_NHAN': return 'Đã tiếp nhận';
    case 'DA_HUY': return 'Đã hủy';
    default: return status || 'Không xác định';
  }
}

function bieuTuongLoai(type: string): string {
  if (type === 'NHAC_LICH_1_NGAY') return '24h';
  if (type === 'NHAC_LICH_2_GIO') return '2h';
  return '✓';
}

export const BenhNhanThongBaoLichKham: React.FC<Props> = ({ isDemo = false }) => {
  const navigate = useNavigate();
  const [data, setData] = React.useState<BenhNhanThongBaoLichKhamResponse | null>(
    isDemo ? taoDuLieuMinhHoa() : null,
  );
  const [loading, setLoading] = React.useState<boolean>(!isDemo);
  const [error, setError] = React.useState<string | null>(null);
  const [boLoc, setBoLoc] = React.useState<BoLoc>('TAT_CA');

  const taiThongBao = React.useCallback(async () => {
    if (isDemo) {
      setData(taoDuLieuMinhHoa());
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await benhNhanThongBaoLichKhamService.layThongBaoLichKham();
      setData(result);
    } catch (err: unknown) {
      const message = err instanceof BenhNhanThongBaoApiError
        ? err.message
        : err instanceof Error ? err.message : 'Không thể tải thông báo lịch khám.';
      setError(message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [isDemo]);

  React.useEffect(() => {
    void taiThongBao();
  }, [taiThongBao]);

  const danhSach = (data?.danhSachThongBao ?? []).filter((item) =>
    boLoc === 'TAT_CA' || item.loaiThongBao === boLoc,
  );

  const handleBack = () => navigate(isDemo ? '/' : '/patient');

  return (
    <main className="uc25-page">
      <header className="uc25-header">
        <div className="uc25-heading">
          <button className="uc25-back" type="button" onClick={handleBack} aria-label="Quay lại trang trước">
            ← Quay lại
          </button>
          <p className="uc25-eyebrow">MEDICARE · DÀNH CHO BỆNH NHÂN</p>
          <h1>Thông báo lịch khám</h1>
          <p className="uc25-subtitle">Theo dõi xác nhận đặt lịch và các mốc nhắc lịch khám sắp tới.</p>
        </div>
        <Button onClick={() => void taiThongBao()} loading={loading} loadingText="Đang tải..." variant="secondary">
          ↻ Làm mới
        </Button>
      </header>

      {isDemo && (
        <div className="uc25-demo-note" role="note">
          <strong>Chế độ xem thử</strong>
          <span>Đang hiển thị dữ liệu minh họa. Trang này không gọi API và không thay đổi dữ liệu backend.</span>
        </div>
      )}

      <section className="uc25-summary" aria-label="Tổng quan thông báo">
        <div className="uc25-summary-icon" aria-hidden="true">✉</div>
        <div className="uc25-summary-copy">
          <span className="uc25-summary-label">Tổng số thông báo hiện có</span>
          <strong>{loading && !data ? '—' : data?.tongSoThongBao ?? 0}</strong>
          <span className="uc25-summary-hint">
            {data ? `Cập nhật lúc ${dinhDangThoiDiem(data.thoiDiemTruyVan)}` : 'Thông tin sẽ hiển thị sau khi tải dữ liệu'}
          </span>
        </div>
        <div className="uc25-summary-footnote">Thông báo được tổng hợp từ lịch khám của bạn.</div>
      </section>

      {error && (
        <section className="uc25-error" role="alert">
          <strong>Không thể tải thông báo</strong>
          <p>{error}</p>
          <div className="uc25-error-actions">
            {error.toLowerCase().includes('đăng nhập') || error.toLowerCase().includes('phiên') ? (
              <Button onClick={() => navigate('/login')}>Đăng nhập lại</Button>
            ) : null}
            <Button variant="secondary" onClick={() => void taiThongBao()}>Thử lại</Button>
          </div>
        </section>
      )}

      <section className="uc25-list-section">
        <div className="uc25-list-heading">
          <div>
            <h2>Thông báo của tôi</h2>
            <p>Chọn một loại thông báo để lọc danh sách.</p>
          </div>
          <span className="uc25-count">{danhSach.length} mục</span>
        </div>

        <div className="uc25-filters" role="group" aria-label="Lọc loại thông báo">
          {([
            ['TAT_CA', 'Tất cả'],
            ['XAC_NHAN_DAT_LICH', 'Xác nhận đặt lịch'],
            ['NHAC_LICH_1_NGAY', 'Trước 1 ngày'],
            ['NHAC_LICH_2_GIO', 'Trước 2 giờ'],
          ] as Array<[BoLoc, string]>).map(([value, label]) => (
            <button
              type="button"
              key={value}
              className={`uc25-filter ${boLoc === value ? 'is-active' : ''}`}
              aria-pressed={boLoc === value}
              onClick={() => setBoLoc(value)}
            >
              {label}
            </button>
          ))}
        </div>

        {loading && !data ? (
          <div className="uc25-state-box">
            <span className="uc25-loading-spinner" aria-hidden="true" />
            <strong>Đang tải thông báo lịch khám...</strong>
            <span>Hệ thống đang lấy danh sách từ tài khoản của bạn.</span>
          </div>
        ) : danhSach.length === 0 ? (
          <div className="uc25-state-box uc25-empty">
            <div className="uc25-empty-icon" aria-hidden="true">✓</div>
            <strong>{error ? 'Danh sách chưa khả dụng' : 'Bạn chưa có thông báo trong mục này'}</strong>
            <span>{error ? 'Hãy kiểm tra kết nối rồi thử tải lại.' : 'Khi có lịch khám phù hợp, thông báo sẽ xuất hiện tại đây.'}</span>
          </div>
        ) : (
          <div className="uc25-notification-list">
            {danhSach.map((item) => <ThongBaoCard key={`${item.idLichKham}-${item.loaiThongBao}`} item={item} />)}
          </div>
        )}
      </section>

      <footer className="uc25-footer">
        Thông báo được dựng từ lịch khám đang có trong hệ thống. Đây không phải lịch sử gửi thông báo đã lưu.
      </footer>
    </main>
  );
};

const ThongBaoCard: React.FC<{ item: ThongBaoLichKhamItem }> = ({ item }) => {
  const reminder = item.loaiThongBao !== 'XAC_NHAN_DAT_LICH';
  return (
    <article className={`uc25-notification-card ${reminder ? 'is-reminder' : 'is-confirmation'}`}>
      <div className="uc25-card-marker" aria-hidden="true">{bieuTuongLoai(item.loaiThongBao)}</div>
      <div className="uc25-card-content">
        <div className="uc25-card-topline">
          <span className={`uc25-type-badge ${reminder ? 'is-reminder' : 'is-confirmation'}`}>
            {nhanLoaiThongBao(item.loaiThongBao)}
          </span>
          <span className={`uc25-status-badge status-${String(item.trangThaiLichKham).toLowerCase()}`}>
            {nhanTrangThai(item.trangThaiLichKham)}
          </span>
        </div>
        <h3>{item.tieuDe}</h3>
        <p className="uc25-card-message">{item.noiDung}</p>
        <div className="uc25-appointment-details">
          <div><span>Bác sĩ</span><strong>{item.hoTenBacSi || item.maBacSi || 'Chưa cập nhật'}</strong></div>
          <div><span>Ngày khám</span><strong>{dinhDangNgay(item.ngayKham)}</strong></div>
          <div><span>Giờ khám</span><strong>{dinhDangGio(item.gioKham)}</strong></div>
          <div><span>Mã lịch khám</span><strong>{item.idLichKham || '—'}</strong></div>
        </div>
        {item.thoiDiemNhac && (
          <div className="uc25-reminder-time">
            Thời điểm nhắc dự kiến: <strong>{dinhDangThoiDiem(item.thoiDiemNhac)}</strong>
          </div>
        )}
      </div>
    </article>
  );
};
