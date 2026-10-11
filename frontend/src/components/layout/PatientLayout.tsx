import { useState, type ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { MainLayout } from './MainLayout';
import type { useAppointmentNotifications } from '../../hooks/useAppointmentNotifications';
import '../../pages/patientDashboard.css';
import '../../pages/uc25Dashboard.css';

export type IconKind = 'home' | 'calendar' | 'bell' | 'record' | 'payment';
export function PatientIcon({ kind }: { kind: IconKind }) {
  const paths = {
    home: <><path d="m3 10 9-7 9 7v11h-6v-7H9v7H3Z" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4M17 3v4M3 11h18M12 14v4M10 16h4" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" /></>,
    record: <><path d="M6 3h8l4 4v14H6ZM14 3v5h4M9 12h6M9 16h6" /></>,
    payment: <><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 10h20M6 16h3M11 16h2" /></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[kind]}</svg>;
}

interface PatientLayoutProps {
  children: ReactNode;
  active: 'overview' | 'notifications' | 'payment';
  notifications: ReturnType<typeof useAppointmentNotifications>;
}

/** One customer shell for dashboard and notifications; the caller supplies its existing query state. */
export function PatientLayout({ children, active, notifications }: PatientLayoutProps) {
  const { user } = useAuth();
  const { data, loading, error } = notifications;
  const [open, setOpen] = useState(false);
  const items = data?.danhSachThongBao ?? [];
  return <MainLayout doctorName={user?.hoTen || user?.tenDangNhap || ''} roleLabel="Khách hàng" className={`mc-patient-app${active === 'notifications' ? ' mc-patient-notifications-app' : ''}`} sidebarLogout
    headerActions={<div className="uc25-bell-wrap">
    <button type="button" className="uc25-bell" aria-label={`Thông báo: ${items.length}`} aria-expanded={open} onClick={() => setOpen(x => !x)}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></svg>
      {items.length > 0 && <span>{items.length}</span>}
    </button>
    {open && <section className="uc25-bell-panel" aria-label="Danh sách nhắc lịch">
      <div className="uc25-bell-heading"><h3>Thông báo</h3><button type="button" onClick={() => setOpen(false)}>Đóng</button></div>
      {loading && <p>Đang cập nhật...</p>}
      {error ? <p role="alert">{error}</p> : items.length === 0 ? <p>Chưa có thông báo.</p> : items.map(item => <article className={`uc25-bell-item uc25-bell-item--${item.loaiThongBao.toLowerCase()}`} key={`${item.idLichKham}-${item.loaiThongBao}`}><p>{item.noiDung}</p></article>)}
      <a href="/patient/thong-bao-lich-kham">Xem thông báo</a>
    </section>}
  </div>}
    sidebarItems={[
      { label: 'Tổng quan', href: '/patient', icon: <PatientIcon kind="home" />, active: active === 'overview' },
      { label: 'Đặt lịch khám', href: '/patient/dat-lich-kham', icon: <PatientIcon kind="calendar" /> },
      { label: 'Thông báo', href: '/patient/thong-bao-lich-kham', icon: <PatientIcon kind="bell" />, active: active === 'notifications' },
      { label: 'Hồ sơ y tế', icon: <PatientIcon kind="record" />, disabled: true },
      { label: 'Thanh toán', href: '/patient/payment', icon: <PatientIcon kind="payment" />, active: active === 'payment' },
    ]}>{children}</MainLayout>;
}
