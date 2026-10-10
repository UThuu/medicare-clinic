import React, { useEffect, useState } from 'react';
import { Header } from './pages/cashier/components/Header';
import { Sidebar } from './pages/cashier/components/Sidebar';
import { TaoHoaDonPage } from './pages/cashier/TaoHoaDonPage';
import { ThanhToanPage } from './pages/cashier/ThanhToanPage';
import { thanhToanService } from './services/thanhToanService';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cho-lap' | 'thanh-toan' | 'da-lap'>('thanh-toan');
  const [unpaidCount, setUnpaidCount] = useState<number>(0);

  useEffect(() => {
    thanhToanService
      .layDanhSachHoaDonChuaThanhToan()
      .then((data) => setUnpaidCount(data.length))
      .catch(() => {});
  }, [activeTab]);

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
          subtitle: 'Thực hiện UC-17 (Thanh toán viện phí) và UC-18 (Thanh toán tiền mặt & tính tiền thối lại)',
        };
      case 'da-lap':
        return {
          title: 'Danh Sách Hóa Đơn Đã Lập',
          subtitle: 'Lịch sử và tra cứu hóa đơn khám chữa bệnh tại phòng khám',
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
          {activeTab === 'thanh-toan' ? (
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

