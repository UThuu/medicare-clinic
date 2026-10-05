import type { ReactNode } from 'react';
import { Header, type HeaderProps } from './Header';
import { Sidebar, type SidebarProps } from './Sidebar';
import '../common/shared-ui.css';

export interface MainLayoutProps extends HeaderProps {
  children: ReactNode;
  sidebarItems?: SidebarProps['items'];
}

export function MainLayout({ children, sidebarItems, ...headerProps }: MainLayoutProps) {
  return (
    <div className="mc-app">
      <Header {...headerProps} />
      <div className="mc-shell">
        <Sidebar items={sidebarItems} />
        <main className="mc-main">{children}</main>
      </div>
    </div>
  );
}
