import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MainLayout } from '../components/layout/MainLayout';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Table } from '../components/common/Table';
import './patientDashboard.css';

type IconKind = 'home' | 'calendar' | 'bell' | 'record' | 'payment';
function PatientIcon({ kind }: { kind: IconKind }) {
  const paths = {
    home: <><path d="m3 10 9-7 9 7v11h-6v-7H9v7H3Z" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4M17 3v4M3 11h18M12 14v4M10 16h4" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" /></>,
    record: <><path d="M6 3h8l4 4v14H6ZM14 3v5h4M9 12h6M9 16h6" /></>,
    payment: <><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 10h20M6 16h3M11 16h2" /></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[kind]}</svg>;
}

const functions: { kind: IconKind; title: string; description: string; action: string; available?: boolean }[] = [
  { kind: 'calendar', title: 'Đặt lịch khám', description: 'Chọn bác sĩ và thời gian phù hợp', action: 'Đặt lịch', available: true },
  { kind: 'bell', title: 'Thông báo', description: 'Xác nhận lịch hẹn và nhắc lịch khám', action: 'Xem thông báo' },
  { kind: 'record', title: 'Hồ sơ y tế', description: 'Lịch sử khám, chẩn đoán và đơn thuốc', action: 'Xem hồ sơ' },
  { kind: 'payment', title: 'Thanh toán', description: 'Xem hóa đơn và thanh toán trực tuyến', action: 'Xem hóa đơn' },
];

export function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const name = user?.hoTen || user?.tenDangNhap || '';
  return (
    <MainLayout doctorName={name} roleLabel="Khách hàng" className="mc-patient-app" sidebarLogout
      headerActions={<button type="button" className="mc-patient-notification" disabled aria-label="Thông báo chưa khả dụng" title="Thông báo chưa khả dụng"><PatientIcon kind="bell" /></button>}
      sidebarItems={[
        { label: 'Tổng quan', href: '/patient', icon: <PatientIcon kind="home" />, active: true },
        { label: 'Đặt lịch khám', href: '/patient/dat-lich-kham', icon: <PatientIcon kind="calendar" /> },
        { label: 'Thông báo', icon: <PatientIcon kind="bell" />, disabled: true },
        { label: 'Hồ sơ y tế', icon: <PatientIcon kind="record" />, disabled: true },
        { label: 'Thanh toán', icon: <PatientIcon kind="payment" />, disabled: true },
      ]}
    >
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
                  onClick={item.available ? () => navigate('/patient/dat-lich-kham') : undefined}>{item.action}</Button>
                {!item.available && <small>Chưa khả dụng</small>}
              </div>
            </Card>
          ))}
        </div>
        <div className="mc-patient-details">
          <Card className="mc-patient-panel">
            <div className="mc-patient-panel__heading"><h2>Lịch hẹn sắp tới</h2><button type="button" disabled>Xem chi tiết →</button></div>
            <div className="mc-patient-pending"><span className="mc-patient-icon"><PatientIcon kind="calendar" /></span><strong>Chức năng đang được hoàn thiện</strong><p>Danh sách lịch hẹn sẽ hiển thị khi chức năng được tích hợp.</p></div>
            <div className="mc-patient-note"><span aria-hidden="true">i</span><p>Vui lòng đến trước giờ hẹn 15 phút.</p></div>
          </Card>
          <Card className="mc-patient-panel mc-patient-tone--bell">
            <div className="mc-patient-panel__heading"><h2>Thông báo mới</h2><button type="button" disabled>Xem tất cả →</button></div>
            <div className="mc-patient-pending"><span className="mc-patient-icon"><PatientIcon kind="bell" /></span><strong>Chức năng đang được hoàn thiện</strong><p>Thông báo xác nhận và nhắc lịch chưa khả dụng.</p></div>
            <div className="mc-patient-note"><span aria-hidden="true">i</span><p>Chức năng nhắc trước 1 ngày và 2 giờ đang được hoàn thiện.</p></div>
          </Card>
        </div>
        <Card className="mc-patient-bills"><h2>Hóa đơn cần thanh toán</h2>
          <Table columns={[
            { key: 'id', header: 'Mã hóa đơn' }, { key: 'date', header: 'Ngày lập' },
            { key: 'amount', header: 'Tổng tiền' }, { key: 'status', header: 'Trạng thái' }, { key: 'action', header: 'Thao tác' },
          ]} data={[]} rowKey={(_, i) => i} emptyText="Chức năng đang được hoàn thiện" />
        </Card>
      </div>
    </MainLayout>
  );
}