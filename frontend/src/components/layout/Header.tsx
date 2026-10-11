
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import '../common/shared-ui.css';

export interface HeaderProps {
    doctorName?: string;
    roleLabel?: string;
    hotline?: string;
    onLogout?: () => void;
}

const ROLE_LABELS: Record<string, string> = {
    BAC_SI: 'Bác sĩ',
    DIEU_DUONG: 'Điều dưỡng',
    LE_TAN: 'Lễ tân',
    THU_NGAN: 'Thu ngân',
    BENH_NHAN: 'Bệnh nhân',
};

export function Header({
                           doctorName,
                           roleLabel,
                           hotline = 'Hotline',
                           onLogout,
                       }: HeaderProps) {
    const { user } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Đọc thông tin từ phiên đăng nhập, không dùng tên mẫu của từng trang.
    const userInfo = user as unknown as Record<string, unknown> | null;

    const displayName =
        (typeof userInfo?.hoTen === 'string' && userInfo.hoTen) ||
        (typeof userInfo?.tenNhanVien === 'string' && userInfo.tenNhanVien) ||
        (typeof userInfo?.tenDangNhap === 'string' && userInfo.tenDangNhap) ||
        (typeof userInfo?.username === 'string' && userInfo.username) ||
        doctorName ||
        'Người dùng';

    const displayRole =
        (user?.vaiTro && ROLE_LABELS[user.vaiTro]) ||
        roleLabel ||
        'Người dùng';

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setMenuOpen(false);
            }
        };

        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setMenuOpen(false);
        };

        if (menuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEsc);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEsc);
        };
    }, [menuOpen]);

    return (
        <header className="mc-header">
            <div className="mc-brand">
                <span className="mc-brand__mark" aria-hidden="true">+</span>
                <div>
                    <div className="mc-brand__name">MediCare Clinic</div>
                    <div className="mc-brand__hotline">{hotline}</div>
                </div>
            </div>

            <div
                className="mc-user"
                ref={menuRef}
                style={{ position: 'relative' }}
            >
                <button
                    type="button"
                    className="mc-user-btn"
                    onClick={() => setMenuOpen((open) => !open)}
                    aria-expanded={menuOpen}
                    aria-haspopup="true"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        background: 'none',
                        border: 'none',
                        padding: '4px',
                        cursor: 'pointer',
                        textAlign: 'left',
                    }}
                >
          <span className="mc-avatar mc-avatar--sm" aria-hidden="true">
            {displayName.charAt(0).toUpperCase()}
          </span>

                    <div>
                        <strong>{displayName}</strong>
                        <span
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                            }}
                        >
              {displayRole}
                            <span style={{ fontSize: '10px' }}>▼</span>
            </span>
                    </div>
                </button>

                {menuOpen && (
                    <div
                        className="mc-dropdown-menu"
                        style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            marginTop: '8px',
                            background: '#fff',
                            border: '1px solid #E5EDF2',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(32,48,64,0.1)',
                            minWidth: '160px',
                            zIndex: 100,
                        }}
                    >
                        <button
                            type="button"
                            onClick={() => {
                                setMenuOpen(false);
                                onLogout?.();
                            }}
                            style={{
                                display: 'block',
                                width: '100%',
                                padding: '12px 16px',
                                textAlign: 'left',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#D64545',
                                fontWeight: 600,
                                fontSize: '14px',
                            }}
                            onMouseOver={(event) => {
                                event.currentTarget.style.backgroundColor = '#FDEAEA';
                            }}
                            onMouseOut={(event) => {
                                event.currentTarget.style.backgroundColor = 'transparent';
                            }}
                        >
                            Đăng xuất
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}
