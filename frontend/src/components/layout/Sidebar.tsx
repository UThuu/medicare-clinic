import type { ReactNode } from 'react';
import "../common/shared-ui.css";
export interface SidebarItem { label: string; href?: string; icon?: ReactNode; active?: boolean; disabled?: boolean; }
export interface SidebarProps { items?: SidebarItem[]; onLogout?: () => void; isLoggingOut?: boolean; }

export function Sidebar({ items = [{ label: 'Dashboard' }, { label: 'Lịch khám', active: true }], onLogout, isLoggingOut = false }: SidebarProps) {
  return (
    <aside className="mc-sidebar" aria-label="Điều hướng chính">
      <nav>
        {items.map((item) => item.disabled ? (
          <button key={item.label} type="button" disabled aria-disabled="true" className="mc-sidebar__item is-disabled">
            {item.icon && <span className="mc-sidebar__icon">{item.icon}</span>}
            <span>{item.label}<small>Chưa khả dụng</small></span>
          </button>
        ) : (
          <a key={item.label} href={item.href ?? '#'} className={`mc-sidebar__item ${item.active ? 'is-active' : ''}`}>
            {item.icon && <span className="mc-sidebar__icon">{item.icon}</span>}
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
      {onLogout && (
        <button type="button" className="mc-sidebar__logout" onClick={onLogout} disabled={isLoggingOut}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M10 4H4v16h6M14 8l4 4-4 4M8 12h10" />
          </svg>
          <span>{isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}</span>
        </button>
      )}
    </aside>
  );
}
