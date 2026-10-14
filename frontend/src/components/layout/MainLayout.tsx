import { useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Header, type HeaderProps } from './Header';
import { Sidebar, type SidebarProps } from './Sidebar';
import '../common/shared-ui.css';

export interface MainLayoutProps extends HeaderProps {
    children: ReactNode;
    sidebarItems?: SidebarProps['items'];
    className?: string;
    sidebarLogout?: boolean;
}

const TEN_VAI_TRO: Record<string, string> = {
    BENH_NHAN: 'Bệnh nhân',
    BAC_SI: 'Bác sĩ',
    DIEU_DUONG: 'Điều dưỡng',
    LE_TAN: 'Lễ tân',
    THU_NGAN: 'Thu ngân',
};

const DUONG_DAN_MENU: Record<string, string> = {
    Dashboard: '/staff',
    'Tổng quan': '/staff',
    'Lịch khám': '/staff/schedules',
    'Tiếp nhận': '/staff/tiep-nhan',
    'Bệnh nhân chờ': '/staff/benh-nhan-cho',
    'Hàng chờ': '/staff/benh-nhan-cho',
};

const QUYEN_MENU: Record<string, string[]> = {
    '/staff': ['BAC_SI', 'DIEU_DUONG', 'LE_TAN', 'THU_NGAN'],
    '/staff/schedules': ['BAC_SI'],
    '/staff/tiep-nhan': ['LE_TAN'],
    '/staff/benh-nhan-cho': ['DIEU_DUONG', 'LE_TAN'],
};

export function MainLayout({
                               children,
                               sidebarItems = [],
                               className = '',
                               sidebarLogout = false,
                               ...headerProps
                           }: MainLayoutProps) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const vaiTro = user?.vaiTro ?? '';
    const duongDanHienTai = location.pathname;

    const menuDaLoc = sidebarItems
        .map((item) => {
            const href = DUONG_DAN_MENU[item.label] ?? item.href;
            return { ...item, href };
        })
        .filter((item) => {
            if (!item.href || item.href === '#') return false;

            const quyenChoPhep = QUYEN_MENU[item.href];
            if (!quyenChoPhep) return true; // Cho phép nếu là menu tùy biến của vai trò khác

            return quyenChoPhep.includes(vaiTro);
        })
        .map((item) => ({
            ...item,
            active: item.active !== undefined ? item.active : item.href === duongDanHienTai,
        }));

    const handleLogout = async () => {
        if (isLoggingOut) return;

        try {
            setIsLoggingOut(true);
            await logout();
            navigate('/login', { replace: true });
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : 'Đăng xuất thất bại. Vui lòng thử lại.';

            alert(message);
            setIsLoggingOut(false);
        }
    };

    return (
        <div className={`mc-app ${className}`.trim()}>
            <Header
                {...headerProps}
                doctorName={
                    user?.hoTen ||
                    user?.tenDangNhap ||
                    headerProps.doctorName ||
                    'Người dùng'
                }
                roleLabel={
                    TEN_VAI_TRO[vaiTro] ||
                    headerProps.roleLabel ||
                    'Người dùng'
                }
                onLogout={handleLogout}
            />

            <div className="mc-shell">
                <Sidebar
                    items={menuDaLoc}
                    onLogout={sidebarLogout ? handleLogout : undefined}
                    isLoggingOut={isLoggingOut}
                />
                <main className="mc-main">{children}</main>
            </div>
        </div>
    );
}
