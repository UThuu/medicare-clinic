import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Alert } from '../components/common/Alert';
import './Login.css';

export const Login: React.FC = () => {
  const { login, sessionError, checkSession, user, isInitializing } = useAuth();
  const [tenDangNhap, setTenDangNhap] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isInitializing && user) {
    if (user.vaiTro === 'BENH_NHAN') {
      return <Navigate to="/patient" replace />;
    } else if (['BAC_SI', 'DIEU_DUONG', 'LE_TAN', 'THU_NGAN'].includes(user.vaiTro)) {
      return <Navigate to="/staff" replace />;
    }
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Tài khoản không có quyền truy cập hệ thống.</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenDangNhap || !matKhau) {
      setError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    try {
      await login({ tenDangNhap, matKhau });
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetrySession = async () => {
    setIsSubmitting(true);
    try {
      await checkSession();
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối máy chủ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <header className="login-header">
        <div className="login-logo">
          <svg className="login-logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" fill="#156F82"/>
            <path d="M8 9H16M12 5V13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div className="login-logo-text">
            <strong>MediCare</strong>
            <span>CLINIC</span>
          </div>
        </div>
        <div className="login-header-right">Hệ thống quản lý phòng khám</div>
      </header>

      <main className="login-main">
        <div className="login-left">
          <div className="login-left-content">
            <p className="login-subtitle">CHĂM SÓC SỨC KHỎE, KẾT NỐI DỄ DÀNG</p>
            <h1 className="login-title">Chào mừng bạn<br/>đến với MediCare.</h1>
            <p className="login-desc">Một nơi kết nối bệnh nhân và đội ngũ phòng khám.</p>
            
            <div className="login-illustration">
              <div className="illust-document">
                <div className="illust-icon-top">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#156F82" strokeWidth="2">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                  </svg>
                </div>
                <div className="illust-line"></div>
                <div className="illust-line"></div>
                <div className="illust-line"></div>
                <div className="illust-icon-bottom-right">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#156F82" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </div>
              </div>
              <div className="illust-icon-bottom-left">
                <svg viewBox="0 0 24 24" fill="none" stroke="#156F82" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </div>
            </div>

            <div className="login-bottom-info">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              Dành cho bệnh nhân và nhân viên
            </div>
          </div>
        </div>
        
        <div className="login-right">
          <div className="login-form-container">
            <p className="login-form-subtitle">TÀI KHOẢN MEDICARE</p>
            <h2 className="login-form-title">Đăng nhập</h2>
            <p className="login-form-desc">Sử dụng tài khoản của bạn để tiếp tục.</p>

            {sessionError && (
              <div style={{ marginBottom: '20px' }}>
                <Alert title="Lỗi kết nối" tone="error">
                  <p>{sessionError}</p>
                  <Button variant="secondary" size="sm" onClick={handleRetrySession} loading={isSubmitting}>
                    Thử lại
                  </Button>
                </Alert>
              </div>
            )}

            {error && !sessionError && (
              <div style={{ marginBottom: '20px' }}>
                <Alert title="Lỗi đăng nhập" tone="error">
                  {error}
                </Alert>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <Input
                label="Tên đăng nhập"
                placeholder="Nhập tên đăng nhập"
                value={tenDangNhap}
                onChange={(e) => setTenDangNhap(e.target.value)}
                autoComplete="username"
                state={error ? 'error' : 'default'}
              />
              
              <div className="login-password-wrapper">
                <Input
                  label="Mật khẩu"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu"
                  value={matKhau}
                  onChange={(e) => setMatKhau(e.target.value)}
                  autoComplete="current-password"
                  state={error ? 'error' : 'default'}
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {showPassword ? (
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24m4.24 4.24L3 3m18 18-4.24-4.24"></path>
                    ) : (
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"></path>
                    )}
                  </svg>
                </button>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isSubmitting}
                loadingText="Đang đăng nhập..."
                className="login-submit-btn"
              >
                Đăng nhập
              </Button>
            </form>

            <div className="login-divider"></div>

            <div className="login-support">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <div>
                <strong>Cần hỗ trợ tài khoản?</strong>
                <p>Vui lòng liên hệ bộ phận tiếp nhận của phòng khám.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="login-footer">
        <div className="login-footer-left">MediCare Clinic</div>
        <div className="login-footer-right">Chăm sóc tận tâm. Kết nối thuận tiện.</div>
      </footer>
    </div>
  );
};
