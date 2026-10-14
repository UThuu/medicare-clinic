import React from 'react';
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
} from 'react-router-dom';

import { useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';

import { Login } from './pages/Login';
import { PatientDashboard } from './pages/PatientDashboard';
import { HoSoYTeCaNhanPage } from './pages/HoSoYTeCaNhanPage';
import { StaffDashboard } from './pages/StaffDashboard';
import { DoctorSchedule } from './pages/DoctorSchedule';
import { PatientRecord } from './pages/PatientRecord';
import { RecordExamResult } from './pages/RecordExamResult';
import { DoctorPrescription } from './pages/DoctorPrescription';

import { CashierBillingPage } from './pages/cashier/CashierBillingPage';
import { HoaDonTraCuu } from './pages/HoaDonTraCuu';
import { HoaDonTongDoanhThu } from './pages/HoaDonTongDoanhThu';
import { ThanhToanOnlinePage } from './pages/patient/ThanhToanOnlinePage';
import { VNPayReturnPage } from './pages/cashier/VNPayReturnPage';

import { BenhNhanTimKiem } from './pages/BenhNhanTimKiem';
import { LichKhamDatTaiQuay } from './pages/LichKhamDatTaiQuay';
import { LichKhamDatTrucTuyen } from './pages/LichKhamDatTrucTuyen';
import { BenhNhanThongBaoLichKham } from './pages/BenhNhanThongBaoLichKham';

import DanhSachBenhNhanCho from './pages/DanhSachBenhNhanCho';
import TiepNhanBenhNhan from './pages/TiepNhanBenhNhan';

const RootRedirect: React.FC = () => {
    const { user, isInitializing } = useAuth();

    if (isInitializing) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                Đang tải thông tin phiên...
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.vaiTro === 'BENH_NHAN') {
        return <Navigate to="/patient" replace />;
    }

    if (
        ['BAC_SI', 'DIEU_DUONG', 'LE_TAN', 'THU_NGAN'].includes(
            user.vaiTro
        )
    ) {
        return <Navigate to="/staff" replace />;
    }

    return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            Tài khoản không có quyền truy cập hệ thống.
        </div>
    );
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

                {/* Patient Routes */}
                <Route
                    path="/patient"
                    element={
                        <ProtectedRoute allowedRoles={['BENH_NHAN']}>
                            <PatientDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/patient/dat-lich-kham"
                    element={
                        <ProtectedRoute allowedRoles={['BENH_NHAN']}>
                            <LichKhamDatTrucTuyen />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/patient/thong-bao-lich-kham"
                    element={
                        <ProtectedRoute allowedRoles={['BENH_NHAN']}>
                            <BenhNhanThongBaoLichKham />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/patient/ho-so-y-te"
                    element={
                        <ProtectedRoute allowedRoles={['BENH_NHAN']}>
                            <HoSoYTeCaNhanPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/patient/payment"
                    element={
                        <ProtectedRoute allowedRoles={['BENH_NHAN']}>
                            <ThanhToanOnlinePage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/payment/vnpay-return"
                    element={
                        <ProtectedRoute allowedRoles={['BENH_NHAN']}>
                            <VNPayReturnPage
                                onBackToBilling={() => {
                                    window.location.href = '/patient/payment';
                                }}
                            />
                        </ProtectedRoute>
                    }
                />

                {/* Staff Main Dashboard */}
                <Route
                    path="/staff"
                    element={
                        <ProtectedRoute
                            allowedRoles={[
                                'BAC_SI',
                                'DIEU_DUONG',
                                'LE_TAN',
                                'THU_NGAN',
                            ]}
                        >
                            <StaffDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Doctor Routes */}
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
                    path="/staff/medical-record/:id/record-exam"
                    element={
                        <ProtectedRoute allowedRoles={['BAC_SI']}>
                            <RecordExamResult />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/staff/medical-record/:id/prescription"
                    element={
                        <ProtectedRoute allowedRoles={['BAC_SI']}>
                            <DoctorPrescription />
                        </ProtectedRoute>
                    }
                />

                {/* Nurse / Receptionist Queue */}
                <Route
                    path="/staff/benh-nhan-cho"
                    element={
                        <ProtectedRoute
                            allowedRoles={['DIEU_DUONG', 'LE_TAN']}
                        >
                            <DanhSachBenhNhanCho />
                        </ProtectedRoute>
                    }
                />

                {/* Receptionist Routes */}
                <Route
                    path="/staff/tiep-nhan"
                    element={
                        <ProtectedRoute allowedRoles={['LE_TAN']}>
                            <TiepNhanBenhNhan />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/staff/patient-search"
                    element={
                        <ProtectedRoute allowedRoles={['LE_TAN']}>
                            <BenhNhanTimKiem />
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

                {/* Cashier Routes */}
                <Route
                    path="/staff/billing"
                    element={
                        <ProtectedRoute allowedRoles={['THU_NGAN']}>
                            <CashierBillingPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/staff/hoadon/tra-cuu"
                    element={
                        <ProtectedRoute allowedRoles={['THU_NGAN']}>
                            <HoaDonTraCuu />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/staff/hoadon/tong-doanh-thu"
                    element={
                        <ProtectedRoute allowedRoles={['THU_NGAN']}>
                            <HoaDonTongDoanhThu />
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