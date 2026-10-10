import React from 'react';

interface SidebarProps {
  activeTab: 'cho-lap' | 'thanh-toan' | 'da-lap' | 'benh-nhan-online';
  onTabChange: (tab: 'cho-lap' | 'thanh-toan' | 'da-lap' | 'benh-nhan-online') => void;
  pendingCount: number;
  unpaidCount?: number;
  totalInvoiceCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  pendingCount,
  unpaidCount,
  totalInvoiceCount,
}) => {
  return (
    <aside className="sidebar" id="app-sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">➕</div>
        <div className="sidebar-logo-text">
          <h1>MediCare Clinic</h1>
          <span>Quầy Thu Ngân</span>
        </div>
      </div>

      <div className="sidebar-menu">
        <div className="sidebar-menu-title">Quản Lý Thu Ngân (TV4)</div>

        <div
          id="nav-tab-cho-lap"
          className={`sidebar-nav-item ${activeTab === 'cho-lap' ? 'active' : ''}`}
          onClick={() => onTabChange('cho-lap')}
        >
          <span>📋</span>
          <span style={{ flex: 1 }}>1. Lập hóa đơn (UC-15)</span>
          {pendingCount > 0 && (
            <span
              style={{
                background: '#0284c7',
                color: 'white',
                borderRadius: '10px',
                fontSize: '11px',
                padding: '2px 7px',
                fontWeight: 700,
              }}
            >
              {pendingCount}
            </span>
          )}
        </div>

        <div
          id="nav-tab-thanh-toan"
          className={`sidebar-nav-item ${activeTab === 'thanh-toan' ? 'active' : ''}`}
          onClick={() => onTabChange('thanh-toan')}
        >
          <span>💳</span>
          <span style={{ flex: 1 }}>2. Thanh toán (UC-17, UC-18)</span>
          {unpaidCount !== undefined && unpaidCount > 0 && (
            <span
              style={{
                background: '#d97706',
                color: 'white',
                borderRadius: '10px',
                fontSize: '11px',
                padding: '2px 7px',
                fontWeight: 700,
              }}
            >
              {unpaidCount}
            </span>
          )}
        </div>

        <div
          id="nav-tab-da-lap"
          className={`sidebar-nav-item ${activeTab === 'da-lap' ? 'active' : ''}`}
          onClick={() => onTabChange('da-lap')}
        >
          <span>🧾</span>
          <span style={{ flex: 1 }}>3. Hóa đơn đã lập</span>
          <span
            style={{
              background: '#e2e8f0',
              color: '#334155',
              borderRadius: '10px',
              fontSize: '11px',
              padding: '2px 7px',
              fontWeight: 700,
            }}
          >
            {totalInvoiceCount}
          </span>
        </div>

        <div className="sidebar-menu-title" style={{ marginTop: '20px' }}>
          Cổng Bệnh Nhân (Patient Portal)
        </div>

        <div
          id="nav-tab-benh-nhan-online"
          className={`sidebar-nav-item ${activeTab === 'benh-nhan-online' ? 'active' : ''}`}
          onClick={() => onTabChange('benh-nhan-online')}
        >
          <span>🌐</span>
          <span style={{ flex: 1 }}>Thanh toán online (UC-20)</span>
          <span
            style={{
              background: '#0284c7',
              color: 'white',
              borderRadius: '10px',
              fontSize: '10px',
              padding: '2px 6px',
              fontWeight: 700,
            }}
          >
            Bệnh nhân
          </span>
        </div>
      </div>

      <div className="sidebar-user">
        <div className="user-avatar">TN</div>
        <div className="user-info">
          <div className="user-name">Nguyễn Thị Thu Ngân</div>
          <div className="user-role">Mã: TN-001 (Quầy 1)</div>
        </div>
      </div>
    </aside>
  );
};
