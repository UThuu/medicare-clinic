import React, { useState } from 'react';
import { Header } from './pages/cashier/components/Header';
import { Sidebar } from './pages/cashier/components/Sidebar';
import { TaoHoaDonPage } from './pages/cashier/TaoHoaDonPage';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cho-lap' | 'da-lap'>('cho-lap');

  return (
    <div className="app-container">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingCount={3}
        totalInvoiceCount={0}
      />
      <div className="main-wrapper">
        <Header
          title="Quản Lý Hóa Đơn Khám Chữa Bệnh"
          subtitle="Thực hiện UC-15 (Tạo hóa đơn) và UC-16 (Tính tổng chi phí)"
        />
        <main className="content-body">
          <TaoHoaDonPage />
        </main>
      </div>
    </div>
  );
};

export default App;
