import { useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Header, type HeaderProps } from './Header';
import { Sidebar, type SidebarProps } from './Sidebar';
import '../common/shared-ui.css';

export interface MainLayoutProps extends HeaderProps {
  children: ReactNode;
  sidebarItems?: SidebarProps['items'];
}

export function MainLayout({ children, sidebarItems, ...headerProps }: MainLayoutProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    try {
      setIsLoggingOut(true);
      await logout();
      navigate('/login', { replace: true });
    } catch (err: any) {
      alert(err.message || 'Đăng xuất thất bại. Vui lòng thử lại.');
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="mc-app">
      <Header {...headerProps} onLogout={handleLogout} />
      <div className="mc-shell">
        <Sidebar items={sidebarItems} />
        <main className="mc-main">{children}</main>
      </div>
    </div>
  );
}
