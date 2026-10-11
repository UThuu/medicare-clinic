import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/common/Button';
import { DoctorDashboard } from './DoctorDashboard';

export const StaffDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const [error, setError] = React.useState<string | null>(null);
    const [isLoggingOut, setIsLoggingOut] = React.useState(false);

    if (user?.vaiTro === 'BAC_SI') {
        return <DoctorDashboard />;
    }

    const vaiTro = user?.vaiTro;
    const laDieuDuong = vaiTro === 'DIEU_DUONG';
    const laLeTan = vaiTro === 'LE_TAN';

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

    const linkStyle: React.CSSProperties = {
        display: 'block',
        padding: '12px 16px',
        marginBottom: '10px',
        border: '1px solid #dbe5e7',
        borderRadius: '8px',
        color: '#087f8c',
        textDecoration: 'none',
        background: '#ffffff',
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

            <h2>Chức năng làm việc</h2>

            {laDieuDuong && (
                <nav aria-label="Chức năng điều dưỡng">
                    <Link
                        to="/staff/benh-nhan-cho"
                        style={linkStyle}
                    >
                        Danh sách bệnh nhân chờ khám
                    </Link>

                    <Link
                        to="/staff/ghi-nhan-sinh-hieu"
                        style={linkStyle}
                    >
                        Ghi nhận sinh hiệu
                    </Link>

                    <Link
                        to="/staff/cap-nhat-sinh-hieu"
                        style={linkStyle}
                    >
                        Cập nhật sinh hiệu
                    </Link>
                </nav>
            )}

            {laLeTan && (
                <nav aria-label="Chức năng lễ tân">
                    <Link
                        to="/staff/tiep-nhan"
                        style={linkStyle}
                    >
                        Tiếp nhận bệnh nhân
                    </Link>

                    <Link
                        to="/staff/benh-nhan-cho"
                        style={linkStyle}
                    >
                        Danh sách bệnh nhân chờ
                    </Link>
                </nav>
            )}

            {!laDieuDuong && !laLeTan && (
                <p>
                    Vai trò hiện tại chưa có danh sách chức năng
                    được cấu hình tại trang này.
                </p>
            )}

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