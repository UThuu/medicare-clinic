import type { ReactNode } from 'react';
import { MainLayout } from './MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import '../../pages/cashier/billing.css';
export function CashierLayout({ active, children }: { active: 'billing' | 'payment' | 'search'; children: ReactNode }) {
  const { user } = useAuth();
  return <div className="mc-billing-app"><MainLayout doctorName={user?.hoTen || user?.tenDangNhap || ''} roleLabel="Thu ngân" sidebarLogout
    sidebarItems={[
      {label:'Lập hóa đơn',href:'/staff/billing',active:active==='billing'},
      {label:'Thanh toán',href:'/staff/billing?tab=thanh-toan',active:active==='payment'},
      {label:'Tra cứu hóa đơn',href:'/staff/hoadon/tra-cuu',active:active==='search'}
    ]}>{children}</MainLayout></div>;
}
