import { useAppointmentNotifications } from '../hooks/useAppointmentNotifications';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PatientLayout, PatientIcon, type IconKind } from '../components/layout/PatientLayout';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { PatientInvoicesCard } from './patient/PatientInvoicesCard';

const functions: { kind: IconKind; title: string; description: string; action: string; available?: boolean }[] = [
  { kind: 'calendar', title: 'Đặt lịch khám', description: 'Chọn bác sĩ và thời gian phù hợp', action: 'Đặt lịch', available: true },
  { kind: 'bell', title: 'Thông báo', description: 'Xác nhận lịch hẹn và nhắc lịch khám', action: 'Xem thông báo', available: true },
  { kind: 'record', title: 'Hồ sơ y tế', description: 'Lịch sử khám, chẩn đoán và đơn thuốc', action: 'Xem hồ sơ', available: true },
  { kind: 'payment', title: 'Thanh toán', description: 'Xem hóa đơn và thanh toán trực tuyến', action: 'Xem hóa đơn', available: true },
];

export function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const notifications = useAppointmentNotifications();
  const { data, loading, error, refresh } = notifications;
  const upcoming = (data?.danhSachThongBao ?? []).filter(x => x.loaiThongBao === 'XAC_NHAN_DAT_LICH');
  const reminders = (data?.danhSachThongBao ?? []).filter(x => x.loaiThongBao !== 'XAC_NHAN_DAT_LICH');
  const name = user?.hoTen || user?.tenDangNhap || '';
  return (
    <PatientLayout active="overview" notifications={notifications}>
      <div className="mc-patient-dashboard">
        <div className="mc-patient-heading"><h1>Tổng quan</h1><p>Xin chào, {name}</p></div>
        <div className="mc-patient-functions">
          {functions.map(item => (
            <Card key={item.kind} className={`mc-patient-function mc-patient-tone--${item.kind}`}>
              <div className="mc-patient-function__heading"><span className="mc-patient-icon"><PatientIcon kind={item.kind} /></span>
                <div><h2>{item.title}</h2><p>{item.description}</p></div>
              </div>
              <div className="mc-patient-function__action">
                <Button variant={item.available ? 'primary' : 'secondary'} disabled={!item.available}
                  onClick={item.available ? () => navigate(
                    item.kind === 'calendar' ? '/patient/dat-lich-kham' :
                    item.kind === 'payment' ? '/patient/payment' :
                    item.kind === 'record' ? '/patient/ho-so-y-te' :
                    '/patient/thong-bao-lich-kham'
                  ) : undefined}>{item.action}</Button>
                {!item.available && <small>Chưa khả dụng</small>}
              </div>
            </Card>
          ))}
        </div>
        <div className="mc-patient-details">
          <Card className="mc-patient-panel">
            <div className="mc-patient-panel__heading"><h2>Lịch hẹn sắp tới</h2><button type="button" disabled>Xem chi tiết →</button></div>
            <div className="mc-patient-upcoming" aria-live="polite">
              {loading && !data && <p>Đang tải lịch hẹn...</p>}
              {error ? <div role="alert"><p>{error}</p><Button variant="secondary" onClick={() => void refresh()} loading={loading}>Thử lại</Button></div>
                : data && upcoming.length === 0 ? <p>Bạn chưa có lịch khám sắp tới.</p>
                : upcoming.map(item => <article key={item.idLichKham} className="mc-patient-appointment">
                  <div className="mc-patient-date" aria-hidden="true"><strong>{item.ngayKham.slice(8, 10)}</strong><span>THÁNG {Number(item.ngayKham.slice(5, 7))}</span></div>
                  <div className="mc-patient-appointment__details"><strong>{item.gioKham.slice(0, 5)} · {item.ngayKham.split('-').reverse().join('/')}</strong>
                    <p>BS. {item.hoTenBacSi || item.maBacSi}</p>
                    <span className="mc-patient-appointment__status">{item.trangThaiLichKham === 'DA_DAT' ? 'Đã đặt' : item.trangThaiLichKham === 'DA_TIEP_NHAN' ? 'Đã tiếp nhận' : item.trangThaiLichKham}</span>
                  </div>
                </article>)}
            </div>
            <div className="mc-patient-note"><span aria-hidden="true">i</span><p>Vui lòng đến trước giờ hẹn 15 phút.</p></div>
          </Card>
          <Card className="mc-patient-panel mc-patient-tone--bell">
            <div className="mc-patient-panel__heading"><h2>Thông báo mới</h2><button type="button" onClick={() => navigate('/patient/thong-bao-lich-kham')}>Xem tất cả →</button></div>
            <div className="mc-patient-reminders" aria-live="polite">
              {loading && !data && <p>Đang tải thông báo...</p>}
              {error ? <div role="alert"><p>{error}</p><Button variant="secondary" onClick={() => void refresh()} loading={loading}>Thử lại</Button></div>
                : data && reminders.length === 0 ? <p>Chưa có lời nhắc đến hạn.</p>
                : reminders.map(item => <article key={`${item.idLichKham}-${item.loaiThongBao}`} className="mc-patient-reminder">
                  <span className="mc-patient-icon"><PatientIcon kind="bell" /></span>
                  <div><strong>{item.tieuDe}</strong><p>{item.noiDung}</p><small>Bác sĩ: {item.hoTenBacSi || item.maBacSi}</small></div>
                </article>)}
            </div>
            <div className="mc-patient-note"><span aria-hidden="true">i</span><p>Nhắc trước 1 ngày và 2 giờ tại chuông thông báo.</p></div>
          </Card>
        </div>
        <PatientInvoicesCard />
      </div>
    </PatientLayout>
  );
}