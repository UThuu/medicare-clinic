import React from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  pendingCount?: number;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, pendingCount }) => {
  return (
    <header className="top-navbar" id="app-header">
      <div className="page-title-box">
        <h2 id="header-page-title">{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="top-navbar-actions">
        {pendingCount !== undefined && (
          <div className="badge-counter" id="badge-pending-invoices">
            🔔 {pendingCount} lượt khám chờ lập hóa đơn
          </div>
        )}
        <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
          {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>
    </header>
  );
};
