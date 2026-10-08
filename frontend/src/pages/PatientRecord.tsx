import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MainLayout } from '../components/layout/MainLayout';
import { Button } from '../components/common/Button';

export const PatientRecord: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <MainLayout 
      doctorName={user?.hoTen || ''}
      roleLabel={user?.vaiTro === 'BAC_SI' ? 'Bác sĩ' : user?.vaiTro || ''}
      sidebarItems={[
        { label: 'Dashboard', href: '/staff' },
        { label: 'Lịch khám', href: '/staff/schedules', active: true }
      ]}
    >
      <div style={{ padding: '2rem' }}>
        <Button variant="secondary" onClick={() => navigate('/staff/schedules')} style={{ marginBottom: '1rem' }}>
          &larr; Quay lại Lịch khám
        </Button>
        
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '1rem' }}>Hồ sơ bệnh nhân</h1>
        <div style={{ padding: '2rem', background: '#f9f9f9', borderRadius: '8px', border: '1px dashed #ccc' }}>
          <p><strong>Mã lịch khám đang chọn:</strong> {id}</p>
          <p style={{ marginTop: '1rem', color: '#666' }}>
            <em>(Giao diện Hồ sơ bệnh nhân đang được xây dựng ở UC07. Dữ liệu y tế và sinh hiệu chưa được tích hợp trong lượt này. Phần mở hồ sơ cần hoàn thiện thêm ở UC07-10.)</em>
          </p>
        </div>
      </div>
    </MainLayout>
  );
};
