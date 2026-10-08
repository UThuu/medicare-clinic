import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Alert } from './Alert';
import { Button } from './Button';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isInitializing, sessionError, checkSession } = useAuth();

  if (isInitializing) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Đang tải thông tin phiên...
      </div>
    );
  }

  if (sessionError) {
    return (
      <div style={{ padding: '2rem', maxWidth: '500px', margin: '0 auto' }}>
        <Alert title="Lỗi kết nối" tone="error">
          <p>{sessionError}</p>
          <Button variant="secondary" size="sm" onClick={checkSession}>
            Thử lại
          </Button>
        </Alert>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.vaiTro)) {
    return (
      <div style={{ padding: '2rem', maxWidth: '500px', margin: '0 auto' }}>
        <Alert title="Từ chối truy cập" tone="error">
          <p>Tài khoản của bạn ({user.vaiTro}) không có quyền truy cập trang này.</p>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
};
