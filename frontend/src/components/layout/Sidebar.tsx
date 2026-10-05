import type { ReactNode } from 'react';
import "../common/shared-ui.css";
export interface SidebarItem { label: string; href?: string; icon?: ReactNode; active?: boolean; }
export interface SidebarProps { items?: SidebarItem[]; }

export function Sidebar({ items = [{ label: 'Dashboard' }, { label: 'Lịch khám', active: true }] }: SidebarProps) {
  return (
    <aside className="mc-sidebar" aria-label="Điều hướng chính">
      <nav>
        {items.map((item) => (
          <a key={item.label} href={item.href ?? '#'} className={`mc-sidebar__item ${item.active ? 'is-active' : ''}`}>
            {item.icon && <span className="mc-sidebar__icon">{item.icon}</span>}
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
    </aside>
  );
}
