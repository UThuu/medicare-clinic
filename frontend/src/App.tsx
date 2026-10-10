import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Login } from './pages/Login';
import { PatientDashboard } from './pages/PatientDashboard';
import { StaffDashboard } from './pages/StaffDashboard';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { DoctorSchedule } from './pages/DoctorSchedule';
import { PatientRecord } from './pages/PatientRecord';
import { LichKhamDatTaiQuay } from './pages/LichKhamDatTaiQuay';

// Điều hướng theo vai trò khi truy cập trang chủ /
const RootRedirect: React.FC = () => {
  const { user, isInitializing } = useAuth();

  if (isInitializing) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Đang tải thông tin phiên...</div>;
  }

  if (!user) return <Navigate to="/login" replace />;
  if (user.vaiTro === 'BENH_NHAN') return <Navigate to="/patient" replace />;
  if (['BAC_SI', 'DIEU_DUONG', 'LE_TAN', 'THU_NGAN'].includes(user.vaiTro)) return <Navigate to="/staff" replace />;

  return <div style={{ padding: '2rem', textAlign: 'center' }}>Tài khoản không có quyền truy cập hệ thống.</div>;
};

const NotFound: React.FC = () => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h2>404 - Không tìm thấy trang</h2>
  </div>
);

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Route phát triển để xem UI UC30 bằng dữ liệu mẫu; không cần đăng nhập. */}
        <Route path="/dev/uc30" element={<LichKhamDatTaiQuay demo />} />

        <Route
          path="/patient"
          element={
            <ProtectedRoute allowedRoles={['BENH_NHAN']}>
              <PatientDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff"
          element={
            <ProtectedRoute allowedRoles={['BAC_SI', 'DIEU_DUONG', 'LE_TAN', 'THU_NGAN']}>
              <StaffDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/schedules"
          element={
            <ProtectedRoute allowedRoles={['BAC_SI']}>
              <DoctorSchedule />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/medical-record/:id"
          element={
            <ProtectedRoute allowedRoles={['BAC_SI']}>
              <PatientRecord />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/lich-kham/dat-tai-quay"
          element={
            <ProtectedRoute allowedRoles={['LE_TAN']}>
              <LichKhamDatTaiQuay />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<RootRedirect />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
