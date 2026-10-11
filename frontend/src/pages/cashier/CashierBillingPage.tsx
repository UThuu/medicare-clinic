import { CashierLayout } from '../../components/layout/CashierLayout';
import { useSearchParams } from 'react-router-dom';
import { TaoHoaDonPage } from './TaoHoaDonPage';
import { ThanhToanPage } from './ThanhToanPage';
import './billing.css';
import './uc21Billing.css';
export function CashierBillingPage() {
  const [params] = useSearchParams();
  const payment = params.get('tab') === 'thanh-toan';
  return <CashierLayout active={payment ? 'payment' : 'billing'}>
    <div className="mc-billing"><h1>{payment ? 'Thanh toán hóa đơn' : 'Quản lý hóa đơn'}</h1>
    {payment ? <ThanhToanPage /> : <TaoHoaDonPage />}</div></CashierLayout>;
}
