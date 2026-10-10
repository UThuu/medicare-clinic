import type { ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { MainLayout } from './MainLayout';
import './receptionLayout.css';

const roleLabels: Record<string, string> = {
  LE_TAN: 'Lễ tân', BAC_SI: 'Bác sĩ', DIEU_DUONG: 'Điều dưỡng',
  THU_NGAN: 'Thu ngân', BENH_NHAN: 'Bệnh nhân',
};

export function ReceptionIcon({ kind }: { kind: 'patient' | 'calendar' | 'queue' | 'document' }) {
  const paths = {
    patient: <><circle cx="12" cy="7" r="4" /><path d="M4 21v-2a8 8 0 0 1 16 0v2Z" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4M17 3v4M3 11h18" /></>,
    queue: <><circle cx="9" cy="7" r="4" /><path d="M2 21v-2a7 7 0 0 1 14 0v2ZM17 3a4 4 0 0 1 0 8M18 14a6 6 0 0 1 4 7" /></>,
    document: <><path d="M6 3h8l4 4v14H6ZM14 3v5h4M9 12h6M9 16h6" /></>,
  };
  return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[kind]}</svg>;
}

export function ReceptionLayout({ children, section = 'overview' }: {
  children: ReactNode; section?: 'overview' | 'reception';
}) {
  const { user } = useAuth();
  return (
    <MainLayout
      doctorName={user?.hoTen || user?.tenDangNhap || ''}
      roleLabel={roleLabels[user?.vaiTro || ''] || user?.vaiTro || ''}
      className={`mc-reception-app ${section === 'overview' ? 'mc-reception-app--overview' : ''}`}
      sidebarLogout
      sidebarItems={[
        { label: 'Tổng quan', href: '/staff', active: section === 'overview' },
        { label: 'Tiếp nhận bệnh nhân', href: '/staff/patient-search', active: section === 'reception' },
        { label: 'Đặt lịch', disabled: true },
        { label: 'Danh sách chờ', disabled: true },
      ]}
    >{children}</MainLayout>
  );
}
