import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/common/Button';
import { useNavigate } from 'react-router-dom';

import { DoctorDashboard } from './DoctorDashboard';

export const StaffDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = React.useState<string | null>(null);

  if (user?.vaiTro === 'BAC_SI') {
    return <DoctorDashboard />;
  }

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err: any) {
      setError(err.message || 'Đăng xuất thất bại');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Trang Nhân Viên (Staff Dashboard)</h1>
      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
      <div style={{ margin: '2rem 0', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
        <p><strong>Xin chào:</strong> {user?.hoTen}</p>
        <p><strong>Vai trò:</strong> {user?.vaiTro}</p>
        

      </div>
      {user?.vaiTro === 'LE_TAN' && (
        <div style={{ marginBottom: '1rem' }}>
          <Button onClick={() => navigate('/staff/patient-create')}>
            Tạo hồ sơ bệnh nhân mới
          </Button>
        </div>
      )}
      <Button onClick={handleLogout} variant="secondary">
        Đăng xuất
      </Button>
    </div>
  );
};
