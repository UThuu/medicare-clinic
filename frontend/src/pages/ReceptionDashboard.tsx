import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/common/Button';
import { ReceptionLayout, ReceptionIcon } from '../components/layout/ReceptionLayout';

export function ReceptionDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const today = new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date());

  return (
    <ReceptionLayout>
      <div className="mc-reception-dashboard">
        <div className="mc-reception-heading">
          <h1>Tổng quan hôm nay</h1>
          <p>Xin chào, {user?.hoTen || user?.tenDangNhap}</p>
        </div>
        <div className="mc-reception-functions">
          <section className="mc-reception-card mc-reception-function">
            <div className="mc-reception-function__heading">
              <span className="mc-reception-icon"><ReceptionIcon kind="patient" /></span>
              <div><h2>Tiếp nhận bệnh nhân</h2><p>Tìm hồ sơ hiện có. Các bước tạo hồ sơ và xác nhận tiếp nhận chưa khả dụng.</p></div>
            </div>
            <Button size="lg" onClick={() => navigate('/staff/patient-search')}>Tiếp nhận</Button>
          </section>
          <section className="mc-reception-card mc-reception-function is-unavailable" aria-disabled="true">
            <div className="mc-reception-function__heading">
              <span className="mc-reception-icon"><ReceptionIcon kind="calendar" /></span>
              <div><h2>Đặt lịch</h2><p>Chọn bác sĩ và thời gian khám phù hợp.</p></div>
            </div>
            <Button size="lg" disabled>Chưa khả dụng</Button>
          </section>
          <section className="mc-reception-card mc-reception-function is-unavailable" aria-disabled="true">
            <div className="mc-reception-function__heading">
              <span className="mc-reception-icon"><ReceptionIcon kind="queue" /></span>
              <div><h2>Danh sách chờ</h2><p>Theo dõi bệnh nhân chờ đo sinh hiệu.</p></div>
            </div>
            <Button size="lg" disabled>Chưa khả dụng</Button>
          </section>
        </div>
        <section className="mc-reception-card mc-reception-appointments" aria-labelledby="reception-appointments-title">
          <div className="mc-reception-appointments__heading">
            <div><h2 id="reception-appointments-title">Lịch hẹn trong ngày</h2><p>Danh sách bệnh nhân dự kiến đến khám</p></div>
            <div className="mc-reception-date" aria-label="Ngày hiện tại"><ReceptionIcon kind="calendar" /><time>{today}</time></div>
          </div>
          <div className="mc-reception-table-scroll" tabIndex={0} aria-label="Lịch hẹn trong ngày">
            <table className="mc-table">
              <thead><tr>{['Giờ hẹn', 'Bệnh nhân', 'Bác sĩ', 'Trạng thái', 'Thao tác'].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead>
            </table>
            <div className="mc-reception-table-message" role="status">
              <ReceptionIcon kind="calendar" />
              <strong>Chức năng đang được hoàn thiện</strong>
              <p>Lịch hẹn trong ngày chưa khả dụng cho lễ tân.</p>
            </div>
          </div>
        </section>
        <section className="mc-reception-card mc-reception-process">
          <span className="mc-reception-icon"><ReceptionIcon kind="document" /></span>
          <div><h2>Quy trình tiếp nhận</h2><p>Tìm hồ sơ → Tạo mới nếu chưa có → Xác nhận lịch hẹn → Tiếp nhận → Chờ đo sinh hiệu</p>
            <small>Hiện có bước tìm hồ sơ. Các bước tiếp theo chưa khả dụng.</small>
          </div>
        </section>
      </div>
    </ReceptionLayout>
  );
}
