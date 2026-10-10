import React, { useEffect, useState } from 'react';
import { Header } from './pages/cashier/components/Header';
import { Sidebar } from './pages/cashier/components/Sidebar';
import { TaoHoaDonPage } from './pages/cashier/TaoHoaDonPage';
import { ThanhToanPage } from './pages/cashier/ThanhToanPage';
import { ThanhToanOnlinePage } from './pages/patient/ThanhToanOnlinePage';
import { VNPayReturnPage } from './pages/cashier/VNPayReturnPage';
import { thanhToanService } from './services/thanhToanService';

export const App: React.FC = () => {
  const queryParams = new URLSearchParams(window.location.search);
  const tabFromUrl = queryParams.get('tab') as
    | 'cho-lap'
    | 'thanh-toan'
    | 'da-lap'
    | 'benh-nhan-online'
    | null;

  const [activeTab, setActiveTab] = useState<'cho-lap' | 'thanh-toan' | 'da-lap' | 'benh-nhan-online'>(
    tabFromUrl || 'thanh-toan'
  );
  const [unpaidCount, setUnpaidCount] = useState<number>(0);

  // Kiểm tra nếu đang ở trang callback của VNPay Gateway
  const isVNPayCallback =
    window.location.pathname.includes('/payment/vnpay-return') ||
    window.location.search.includes('vnp_ResponseCode');

  useEffect(() => {
    thanhToanService
      .layDanhSachHoaDonChuaThanhToan()
      .then((data) => setUnpaidCount(data.length))
      .catch(() => {});
  }, [activeTab]);

  if (isVNPayCallback) {
    return (
      <div className="app-container" style={{ background: '#f8fafc', minHeight: '100vh' }}>
        <div style={{ flex: 1 }}>
          <VNPayReturnPage
            onBackToBilling={() => {
              const role = sessionStorage.getItem('vnpay_source_role') || 'patient';
              if (role === 'patient') {
                window.location.href = '/?tab=benh-nhan-online';
              } else {
                window.location.href = '/?tab=thanh-toan';
              }
            }}
          />
        </div>
      </div>
    );
  }

  const getHeaderInfo = () => {
    switch (activeTab) {
      case 'cho-lap':
        return {
          title: 'Quản Lý Hóa Đơn Khám Chữa Bệnh',
          subtitle: 'Thực hiện UC-15 (Tạo hóa đơn) và UC-16 (Tính tổng chi phí)',
        };
      case 'thanh-toan':
        return {
          title: 'Thu Ngân & Thanh Toán Hóa Đơn',
          subtitle: 'Thực hiện UC-17 (Thanh toán viện phí), UC-18 (Tiền mặt), UC-19 (QR) & UC-20 (VNPay Gateway)',
        };
      case 'da-lap':
        return {
          title: 'Danh Sách Hóa Đơn Đã Lập',
          subtitle: 'Lịch sử và tra cứu hóa đơn khám chữa bệnh tại phòng khám',
        };
      case 'benh-nhan-online':
        return {
          title: 'Cổng Bệnh Nhân - Thanh Toán Viện Phí Online',
          subtitle: 'Thực hiện UC-20 (Bệnh nhân chủ động thanh toán viện phí từ xa qua Cổng VNPay Gateway)',
        };
    }
  };

  const headerInfo = getHeaderInfo();

  return (
    <div className="app-container">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingCount={0}
        unpaidCount={unpaidCount}
        totalInvoiceCount={3}
      />
      <div className="main-wrapper">
        <Header
          title={headerInfo.title}
          subtitle={headerInfo.subtitle}
        />
        <main className="content-body">
          {activeTab === 'benh-nhan-online' ? (
            <ThanhToanOnlinePage />
          ) : activeTab === 'thanh-toan' ? (
            <ThanhToanPage />
          ) : (
            <TaoHoaDonPage initialTab={activeTab === 'da-lap' ? 'da-lap' : 'cho-lap'} />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;

