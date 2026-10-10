import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/common/Button';

export const PatientDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = React.useState<string | null>(null);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Đăng xuất thất bại');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Trang Bệnh Nhân (Patient Dashboard)</h1>
      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
      <div style={{ margin: '2rem 0', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
        <p><strong>Xin chào:</strong> {user?.hoTen}</p>
        <p><strong>Vai trò:</strong> {user?.vaiTro}</p>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
        <Button onClick={() => navigate('/patient/thong-bao-lich-kham')}>
          Thông báo lịch khám
        </Button>
        <Button onClick={handleLogout} variant="secondary">
          Đăng xuất
        </Button>
      </div>
    </div>
  );
};
