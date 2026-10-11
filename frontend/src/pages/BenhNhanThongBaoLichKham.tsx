import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import type {
  LoaiThongBaoLichKham,
  ThongBaoLichKhamItem,
} from '../types/BenhNhanThongBaoLichKham';
import './benhNhanThongBaoLichKham.css';
import { PatientLayout } from '../components/layout/PatientLayout';
import { useAppointmentNotifications } from '../hooks/useAppointmentNotifications';


type BoLoc = 'TAT_CA' | LoaiThongBaoLichKham;

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
  const date = new Date(/(?:Z|[+-]\d{2}:\d{2})$/.test(value) ? value : `${value}+07:00`);
  if (Number.isNaN(date.getTime())) return value.replace('T', ' ');
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Ho_Chi_Minh',
  }).format(date);
}

function nhanLoaiThongBao(type: string): string {
  switch (type) {
    case 'XAC_NHAN_DAT_LICH': return 'Xác nhận đặt lịch';
    case 'HUY_LICH': return 'Hủy lịch';
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

export const BenhNhanThongBaoLichKham: React.FC = () => {
  const navigate = useNavigate();
  const notifications = useAppointmentNotifications();
  const { data, loading, error, refresh: taiThongBao } = notifications;
  const [boLoc, setBoLoc] = React.useState<BoLoc>('TAT_CA');

  const danhSach = (data?.danhSachThongBao ?? []).filter((item) =>
    boLoc === 'TAT_CA' || item.loaiThongBao === boLoc,
  );

  const handleBack = () => navigate('/patient');

  return (
    <PatientLayout active="notifications" notifications={notifications}><div className="uc25-page">
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
            ['HUY_LICH', 'Hủy lịch'],
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


    </div></PatientLayout>
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
