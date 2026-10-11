import { MainLayout } from '../../components/layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { TaoHoaDonPage } from './TaoHoaDonPage';
import { ThanhToanPage } from './ThanhToanPage';
import './billing.css';
import './uc21Billing.css';
export function CashierBillingPage() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const payment = params.get('tab') === 'thanh-toan';
  return <div className="mc-billing-app"><MainLayout doctorName={user?.hoTen || user?.tenDangNhap || ''} roleLabel="Thu ngân" sidebarLogout
    sidebarItems={[{label:'Lập hóa đơn', href:'/staff/billing', active:!payment}, {label:'Thanh toán', href:'/staff/billing?tab=thanh-toan', active:payment}]}>
    <div className="mc-billing"><h1>{payment ? 'Thanh toán hóa đơn' : 'Quản lý hóa đơn'}</h1>
    {payment ? <ThanhToanPage /> : <TaoHoaDonPage />}</div></MainLayout></div>;
}
