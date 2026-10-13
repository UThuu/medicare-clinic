import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MainLayout } from '../components/layout/MainLayout';
import { StatusBadge } from '../components/common/StatusBadge';
import { Button } from '../components/common/Button';
import type { BenhNhanCho } from '../types/LuotKham';
import { layDanhSachBenhNhanCho } from '../services/luotKhamService';
import { laySinhHieu } from '../services/sinhHieuService';
import './nurseDashboard.css';

export const NurseDashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [danhSach, setDanhSach] = useState<BenhNhanCho[]>([]);
    const [daCoSinhHieuIds, setDaCoSinhHieuIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

    const homNay = new Date();
    const ngayDinhDang = `${String(homNay.getDate()).padStart(2, '0')}/${String(
        homNay.getMonth() + 1
    ).padStart(2, '0')}/${homNay.getFullYear()}`;

    const ngayQuery = `${homNay.getFullYear()}-${String(
        homNay.getMonth() + 1
    ).padStart(2, '0')}-${String(homNay.getDate()).padStart(2, '0')}`;

    const taiDuLieu = useCallback(async () => {
        try {
            setLoading(true);
            const data = await layDanhSachBenhNhanCho(ngayQuery);
            setDanhSach(data);

            const ketQua = await Promise.allSettled(
                data.map(async (bn) => {
                    const sh = await laySinhHieu(bn.idLuotKham);
                    return { idLuotKham: bn.idLuotKham, daCo: Boolean(sh) };
                })
            );

            const setDaCo = new Set<string>();
            ketQua.forEach((k) => {
                if (k.status === 'fulfilled' && k.value.daCo) {
                    setDaCo.add(k.value.idLuotKham);
                }
            });
            setDaCoSinhHieuIds(setDaCo);
        } catch (err) {
            console.error('Không thể tải dữ liệu điều dưỡng', err);
        } finally {
            setLoading(false);
        }
    }, [ngayQuery]);

    useEffect(() => {
        void taiDuLieu();
    }, [taiDuLieu]);

    // Các chỉ số KPI
    const totalReceived = danhSach.length;
    const waitingVitalList = danhSach.filter((p) => !daCoSinhHieuIds.has(p.idLuotKham));
    const waitingVitalCount = waitingVitalList.length;
    const hasVitalCount = totalReceived - waitingVitalCount;

    // Bệnh nhân tiếp theo (ưu tiên người chưa đo theo giờ hẹn sớm nhất)
    const nextPatient = waitingVitalList[0] || danhSach[0];
    const nextPatientIndex = nextPatient
        ? danhSach.findIndex((p) => p.idLuotKham === nextPatient.idLuotKham) + 1
        : null;

    const namSinh = nextPatient?.ngaySinh ? nextPatient.ngaySinh.split('-')[0] : '';
    const gioiTinhText =
        nextPatient?.gioiTinh === 'NAM'
            ? 'Nam'
            : nextPatient?.gioiTinh === 'NU'
            ? 'Nữ'
            : 'Khác';

    return (
        <MainLayout
            doctorName={user?.hoTen || user?.tenDangNhap || 'Điều dưỡng'}
            roleLabel="Điều dưỡng"
            sidebarItems={[
                { label: 'Tổng quan', href: '/staff', active: true },
                { label: 'Hàng chờ', href: '/staff/benh-nhan-cho' },
            ]}
        >
            <div className="nurse-dashboard">
                {/* Header */}
                <div className="nurse-dashboard__header">
                    <div>
                        <h1 className="nurse-dashboard__title">Tổng quan hôm nay</h1>
                        <p className="nurse-dashboard__subtitle">
                            Xin chào, {user?.hoTen || user?.tenDangNhap || 'Điều dưỡng'}
                        </p>
                    </div>
                    <div className="nurse-dashboard__date-box">
                        <div className="nurse-dashboard__date">{ngayDinhDang}</div>
                        <div className="nurse-dashboard__date-note">Dữ liệu thực tế</div>
                    </div>
                </div>

                {/* 3 KPI Cards */}
                <div className="nurse-dashboard__stats">
                    <div className="nurse-stat-card">
                        <div className="nurse-stat-card__icon nurse-stat-card__icon--blue">
                            👥
                        </div>
                        <div>
                            <div className="nurse-stat-card__number">{totalReceived}</div>
                            <div className="nurse-stat-card__label">Đã tiếp nhận</div>
                        </div>
                    </div>

                    <div className="nurse-stat-card">
                        <div className="nurse-stat-card__icon nurse-stat-card__icon--amber">
                            ⏳
                        </div>
                        <div>
                            <div className="nurse-stat-card__number">{waitingVitalCount}</div>
                            <div className="nurse-stat-card__label">Chờ đo sinh hiệu</div>
                        </div>
                    </div>

                    <div className="nurse-stat-card">
                        <div className="nurse-stat-card__icon nurse-stat-card__icon--teal">
                            📅
                        </div>
                        <div>
                            <div className="nurse-stat-card__number">{hasVitalCount}</div>
                            <div className="nurse-stat-card__label">Đã có sinh hiệu</div>
                        </div>
                    </div>
                </div>

                {/* Middle Row */}
                <div className="nurse-dashboard__middle">
                    {/* Bệnh nhân tiếp theo */}
                    <div className="nurse-card">
                        <h2 className="nurse-card__title">Bệnh nhân tiếp theo</h2>
                        <div className="nurse-card__subtitle">Theo thứ tự giờ hẹn</div>

                        {nextPatient ? (
                            <>
                                <div className="nurse-patient-box">
                                    <div className="nurse-patient-box__left">
                                        <div className="nurse-patient-box__badge">
                                            {String(nextPatientIndex || 1).padStart(2, '0')}
                                        </div>
                                        <div>
                                            <div className="nurse-patient-box__name">
                                                {nextPatient.hoTen}
                                            </div>
                                            <div className="nurse-patient-box__meta">
                                                {nextPatient.idBenhNhan} • {gioiTinhText}{' '}
                                                {namSinh ? `• ${namSinh}` : ''}
                                            </div>
                                            <div className="nurse-patient-box__time">
                                                🕒 Hẹn lúc {nextPatient.gioKham?.substring(0, 5)}
                                            </div>
                                            {!daCoSinhHieuIds.has(nextPatient.idLuotKham) ? (
                                                <div className="nurse-patient-box__status">
                                                    <span className="nurse-patient-box__status-dot" />
                                                    Chưa có sinh hiệu
                                                </div>
                                            ) : (
                                                <div
                                                    className="nurse-patient-box__status"
                                                    style={{
                                                        background: '#e6f7f5',
                                                        color: '#0f8b8d',
                                                    }}
                                                >
                                                    Đã có sinh hiệu
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <Button
                                        variant="primary"
                                        onClick={() => navigate('/staff/benh-nhan-cho')}
                                    >
                                        Mở hàng chờ
                                    </Button>
                                </div>
                                <div className="nurse-card__action-hint">
                                    Ghi nhận hoặc cập nhật sinh hiệu tại trang Hàng chờ.
                                </div>
                            </>
                        ) : (
                            <div
                                style={{
                                    padding: '24px',
                                    textAlign: 'center',
                                    color: '#64748b',
                                }}
                            >
                                Không có bệnh nhân nào trong hàng chờ hôm nay.
                            </div>
                        )}
                    </div>

                    {/* Sinh hiệu cần ghi nhận */}
                    <div className="nurse-card">
                        <h2 className="nurse-card__title">Sinh hiệu cần ghi nhận</h2>
                        <div className="nurse-card__subtitle">Chỉ số tiêu chuẩn</div>

                        <div className="nurse-vitals-grid">
                            <div className="nurse-vital-item">
                                <span className="nurse-vital-item__icon">❤️</span>
                                <span className="nurse-vital-item__label">Huyết áp</span>
                                <span className="nurse-vital-item__unit">mmHg</span>
                            </div>
                            <div className="nurse-vital-item">
                                <span className="nurse-vital-item__icon">🌡️</span>
                                <span className="nurse-vital-item__label">Nhiệt độ</span>
                                <span className="nurse-vital-item__unit">°C</span>
                            </div>
                            <div className="nurse-vital-item">
                                <span className="nurse-vital-item__icon">⚖️</span>
                                <span className="nurse-vital-item__label">Cân nặng</span>
                                <span className="nurse-vital-item__unit">kg</span>
                            </div>
                        </div>

                        <div className="nurse-info-banner">
                            <span>ℹ️</span>
                            <span>Xác nhận đúng bệnh nhân và lượt khám trước khi lưu.</span>
                        </div>
                    </div>
                </div>

                {/* Bottom Queue Table */}
                <div className="nurse-queue-section">
                    <div className="nurse-queue-section__header">
                        <h2 className="nurse-queue-section__title">Tình hình hàng chờ</h2>
                        <a
                            className="nurse-queue-section__link"
                            onClick={() => navigate('/staff/benh-nhan-cho')}
                        >
                            Xem hàng chờ →
                        </a>
                    </div>

                    <table className="nurse-table">
                        <thead>
                            <tr>
                                <th style={{ width: '80px' }}>STT</th>
                                <th>Bệnh nhân</th>
                                <th style={{ width: '150px' }}>Giờ hẹn</th>
                                <th style={{ width: '180px' }}>Sinh hiệu</th>
                            </tr>
                        </thead>
                        <tbody>
                            {danhSach.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        style={{ textAlign: 'center', color: '#94a3b8' }}
                                    >
                                        {loading
                                            ? 'Đang tải dữ liệu...'
                                            : 'Chưa có bệnh nhân nào hôm nay.'}
                                    </td>
                                </tr>
                            ) : (
                                danhSach.slice(0, 5).map((row, idx) => {
                                    const daCo = daCoSinhHieuIds.has(row.idLuotKham);
                                    return (
                                        <tr key={row.idLuotKham}>
                                            <td style={{ fontWeight: 600 }}>
                                                {String(idx + 1).padStart(2, '0')}
                                            </td>
                                            <td>
                                                <strong>{row.hoTen}</strong>
                                                <div
                                                    style={{
                                                        fontSize: '12px',
                                                        color: '#64748b',
                                                    }}
                                                >
                                                    {row.idBenhNhan}
                                                </div>
                                            </td>
                                            <td>{row.gioKham?.substring(0, 5)}</td>
                                            <td>
                                                {daCo ? (
                                                    <StatusBadge tone="success">
                                                        Đã có sinh hiệu
                                                    </StatusBadge>
                                                ) : (
                                                    <StatusBadge tone="warning">
                                                        Chưa ghi nhận
                                                    </StatusBadge>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>

                    <div className="nurse-queue-section__footer">
                        Hiển thị {Math.min(danhSach.length, 5)} trong {danhSach.length} bệnh
                        nhân chờ trong ngày.
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default NurseDashboard;
