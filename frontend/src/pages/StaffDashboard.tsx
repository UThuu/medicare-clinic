import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/common/Button';
import { DoctorDashboard } from './DoctorDashboard';
import { CashierBillingPage } from './cashier/CashierBillingPage';
import { ReceptionDashboard } from './ReceptionDashboard';
import { NurseDashboard } from './NurseDashboard';

export const StaffDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const [error, setError] = React.useState<string | null>(null);
    const [isLoggingOut, setIsLoggingOut] = React.useState(false);

    if (user?.vaiTro === 'BAC_SI') {
        return <DoctorDashboard />;
    }

    if (user?.vaiTro === 'THU_NGAN') {
        return <CashierBillingPage />;
    }

    if (user?.vaiTro === 'LE_TAN') {
        return <ReceptionDashboard />;
    }

    if (user?.vaiTro === 'DIEU_DUONG') {
        return <NurseDashboard />;
    }

    const vaiTro = user?.vaiTro;

    const handleLogout = async () => {
        if (isLoggingOut) return;

        setError(null);
        setIsLoggingOut(true);

        try {
            await logout();
        } catch (err: unknown) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Đăng xuất thất bại'
            );
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <main
            style={{
                padding: '2rem',
                maxWidth: '800px',
                margin: '0 auto',
                color: '#172b4d',
            }}
        >
            <h1>Trang Nhân Viên</h1>

            {error && (
                <div
                    role="alert"
                    style={{
                        color: '#c62828',
                        marginBottom: '1rem',
                    }}
                >
                    {error}
                </div>
            )}

            <section
                style={{
                    margin: '1.5rem 0',
                    padding: '1.25rem',
                    border: '1px solid #dbe5e7',
                    borderRadius: '10px',
                }}
            >
                <p>
                    <strong>Xin chào:</strong>{' '}
                    {user?.hoTen || user?.tenDangNhap || 'Nhân viên'}
                </p>

                <p>
                    <strong>Vai trò:</strong>{' '}
                    {vaiTro || 'Chưa xác định'}
                </p>
            </section>

            <p>
                Vai trò hiện tại chưa có danh sách chức năng được cấu hình tại trang này.
            </p>

            <div style={{ marginTop: '1.5rem' }}>
                <Button
                    onClick={handleLogout}
                    variant="secondary"
                    disabled={isLoggingOut}
                >
                    {isLoggingOut
                        ? 'Đang đăng xuất...'
                        : 'Đăng xuất'}
                </Button>
            </div>
        </main>
    );
};