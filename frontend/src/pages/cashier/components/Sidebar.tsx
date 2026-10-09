import React from 'react';

interface SidebarProps {
  activeTab: 'cho-lap' | 'da-lap';
  onTabChange: (tab: 'cho-lap' | 'da-lap') => void;
  pendingCount: number;
  totalInvoiceCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  pendingCount,
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
        <div className="sidebar-menu-title">Nghiệp vụ Hóa đơn (UC-15)</div>

        <div
          id="nav-tab-cho-lap"
          className={`sidebar-nav-item ${activeTab === 'cho-lap' ? 'active' : ''}`}
          onClick={() => onTabChange('cho-lap')}
        >
          <span>📋</span>
          <span style={{ flex: 1 }}>Chờ lập hóa đơn</span>
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
          id="nav-tab-da-lap"
          className={`sidebar-nav-item ${activeTab === 'da-lap' ? 'active' : ''}`}
          onClick={() => onTabChange('da-lap')}
        >
          <span>🧾</span>
          <span style={{ flex: 1 }}>Hóa đơn đã lập</span>
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
