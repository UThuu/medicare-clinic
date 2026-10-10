import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/common/Button';
import { useNavigate } from 'react-router-dom';

export const PatientDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = React.useState<string | null>(null);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err: any) {
      setError(err.message || 'Đăng xuất thất bại');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Trang Bệnh Nhân (Patient Dashboard)</h1>
      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
      <div style={{ margin: '1.5rem 0', padding: '1.25rem', border: '1px solid #cfe4e6', borderRadius: '10px', background: '#f2fbfb' }}>
        <h2 style={{ marginTop: 0 }}>Đặt lịch khám trực tuyến</h2>
        <p style={{ color: '#5c7480' }}>Chọn bác sĩ và thời gian phù hợp, kiểm tra khung giờ còn trống trước khi xác nhận.</p>
        <Button onClick={() => navigate('/patient/dat-lich-kham')}>Đặt lịch khám</Button>
      </div>
      <div style={{ margin: '2rem 0', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
        <p><strong>Xin chào:</strong> {user?.hoTen}</p>
        <p><strong>Vai trò:</strong> {user?.vaiTro}</p>
      </div>
      <Button onClick={handleLogout} variant="secondary">
        Đăng xuất
      </Button>
    </div>
  );
};
