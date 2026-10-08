import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { scheduleService } from '../services/scheduleService';
import { DoctorScheduleResponse, TrangThaiLichKham, TrangThaiLuotKham } from '../types/schedule';
import { MainLayout } from '../components/layout/MainLayout';
import { Table, TableColumn } from '../components/common/Table';
import { StatusBadge, StatusTone } from '../components/common/StatusBadge';
import { Button } from '../components/common/Button';

// Format thời gian thành chuỗi HH:mm, dd/MM/yyyy
const formatUpdateTime = (date: Date) => {
  return date.toLocaleString('vi-VN', {
    hour: '2-digit', minute: '2-digit',
    day: '2-digit', month: '2-digit', year: 'numeric',
    timeZone: 'Asia/Ho_Chi_Minh'
  });
};

export const DoctorDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [schedules, setSchedules] = useState<DoctorScheduleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  
  const timerRef = useRef<number | null>(null);
  const fetchIdRef = useRef<number>(0);

  const fetchSchedules = async (isBackgroundUpdate = false) => {
    if (!isBackgroundUpdate) setLoading(true);
    setUpdateError(null);
    
    const currentFetchId = ++fetchIdRef.current;

    try {
      // Backend tự động lấy ngày hiện tại ở VN nếu không truyền date
      const data = await scheduleService.getDoctorSchedule();
      
      // Nếu có request mới hơn đang chạy, bỏ qua kết quả của request này
      if (currentFetchId !== fetchIdRef.current) return;

      data.sort((a, b) => {
        if (a.gioKham !== b.gioKham) return a.gioKham.localeCompare(b.gioKham);
        return a.idLichKham.localeCompare(b.idLichKham);
      });
      
      setSchedules(data);
      setLastUpdated(formatUpdateTime(new Date()));
      setError(null);
    } catch (err: any) {
      if (currentFetchId !== fetchIdRef.current) return;

      if (err.status === 401) {
        logout();
      } else if (err.status === 403) {
        if (!isBackgroundUpdate) setError('Bạn không có quyền xem thông tin này.');
        else setUpdateError('Mất quyền truy cập.');
      } else {
        const msg = err.message || 'Lỗi kết nối. Không thể tải dữ liệu.';
        if (!isBackgroundUpdate) setError(msg);
        else setUpdateError(msg);
      }
    } finally {
      if (currentFetchId === fetchIdRef.current) {
        if (!isBackgroundUpdate) setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchSchedules();

    const startTimer = () => {
      timerRef.current = window.setInterval(() => {
        if (document.visibilityState === 'visible') {
          fetchSchedules(true);
        }
      }, 60000);
    };

    const stopTimer = () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };

    startTimer();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchSchedules(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopTimer();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // Đảm bảo không ghi đè state khi unmount bằng cách tăng fetchId
      fetchIdRef.current += 1;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRowClick = (e: React.MouseEvent | React.KeyboardEvent, idLichKham: string) => {
    if (e.type === 'keydown') {
      const keyEvent = e as React.KeyboardEvent;
      if (keyEvent.key !== 'Enter' && keyEvent.key !== ' ') return;
      e.preventDefault();
    }
    navigate(`/staff/medical-record/${idLichKham}`);
  };

  const renderClickable = (content: React.ReactNode, idLichKham: string, isFirstCol: boolean = false) => (
    <div 
      className="mc-dashboard-cell"
      onClick={(e) => handleRowClick(e, idLichKham)}
      onKeyDown={(e) => handleRowClick(e, idLichKham)}
      tabIndex={isFirstCol ? 0 : -1}
      role={isFirstCol ? "button" : undefined}
      aria-label={isFirstCol ? `Xem hồ sơ lịch khám ${idLichKham}` : undefined}
    >
      {content}
    </div>
  );

  const getStatusDisplay = (trangThaiLich: TrangThaiLichKham, trangThaiLuot: TrangThaiLuotKham | null): { text: string; tone: StatusTone } => {
    if (trangThaiLuot === 'HOAN_TAT') return { text: 'Hoàn tất', tone: 'success' };
    if (trangThaiLuot === 'DANG_KHAM') return { text: 'Đang khám', tone: 'warning' };
    if (trangThaiLuot === 'CHO_KHAM') return { text: 'Chờ khám', tone: 'info' };
    
    if (trangThaiLich === 'DA_HUY') return { text: 'Đã hủy', tone: 'error' };
    if (trangThaiLich === 'DA_TIEP_NHAN') return { text: 'Đã tiếp nhận', tone: 'info' };
    return { text: 'Đã đặt', tone: 'neutral' };
  };

  const columns: TableColumn<DoctorScheduleResponse>[] = [
    {
      key: 'gioKham',
      header: 'Giờ hẹn',
      width: '15%',
      render: (r) => renderClickable(r.gioKham.substring(0, 5), r.idLichKham, true)
    },
    {
      key: 'tenBenhNhan',
      header: 'Bệnh nhân',
      width: '35%',
      render: (r) => renderClickable(<strong>{r.tenBenhNhan}</strong>, r.idLichKham)
    },
    {
      key: 'maBenhNhan',
      header: 'Mã bệnh nhân',
      width: '25%',
      render: (r) => renderClickable(<span>{r.idBenhNhan}</span>, r.idLichKham)
    },
    {
      key: 'trangThai',
      header: 'Trạng thái',
      width: '25%',
      align: 'right',
      render: (r) => {
        const status = getStatusDisplay(r.trangThaiLichKham, r.trangThaiLuotKham);
        return renderClickable(<StatusBadge tone={status.tone}>{status.text}</StatusBadge>, r.idLichKham);
      }
    }
  ];

  const totalSchedules = schedules.length;
  const waiting = schedules.filter(s => s.trangThaiLuotKham === 'CHO_KHAM').length;
  const inProgress = schedules.filter(s => s.trangThaiLuotKham === 'DANG_KHAM').length;
  const completed = schedules.filter(s => s.trangThaiLuotKham === 'HOAN_TAT').length;

  return (
    <MainLayout 
      doctorName={user?.hoTen || ''}
      roleLabel="Bác sĩ"
      sidebarItems={[
        { label: 'Tổng quan', href: '/staff', active: true },
        { label: 'Lịch khám', href: '/staff/schedules' }
      ]}
    >
      <div style={{ padding: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600, margin: 0 }}>Tổng quan hôm nay</h1>
        <p style={{ color: '#666', marginTop: '0.5rem', marginBottom: '2rem' }}>
          Xin chào, {user?.hoTen}
        </p>

        {/* Thống kê */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem', 
          marginBottom: '2rem' 
        }}>
          <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '8px', padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 600, color: '#333' }}>{totalSchedules}</div>
            <div style={{ color: '#666', marginTop: '0.5rem' }}>Lịch hẹn</div>
          </div>
          <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '8px', padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 600, color: '#0056b3' }}>{waiting}</div>
            <div style={{ color: '#666', marginTop: '0.5rem' }}>Chờ khám</div>
          </div>
          <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '8px', padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 600, color: '#b38000' }}>{inProgress}</div>
            <div style={{ color: '#666', marginTop: '0.5rem' }}>Đang khám</div>
          </div>
          <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '8px', padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 600, color: '#1a7a4c' }}>{completed}</div>
            <div style={{ color: '#666', marginTop: '0.5rem' }}>Hoàn tất</div>
          </div>
        </div>

        {/* Bảng danh sách */}
        <style>
          {`
            .mc-dashboard-table-container .mc-table th {
              position: sticky;
              top: 0;
              z-index: 10;
              background: #F2F6F8;
              box-shadow: 0 1px 0 #E5EDF2;
            }
            .mc-dashboard-table-container .mc-table td {
              padding: 0;
            }
            .mc-dashboard-cell {
              display: flex;
              align-items: center;
              padding: 12px 16px;
              min-height: 48px;
              height: 100%;
              cursor: pointer;
              outline: none;
            }
            .mc-dashboard-cell:focus-visible {
              box-shadow: inset 0 0 0 2px #0F8B8D;
            }
            .mc-dashboard-table-container .mc-table tr:hover .mc-dashboard-cell {
              background: #F7FAFC;
            }
          `}
        </style>
        <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '8px' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 600 }}>Lịch khám trong ngày</h2>
            <div style={{ textAlign: 'right', fontSize: '0.9rem' }}>
              <div style={{ color: '#666' }}>
                Cập nhật tới {lastUpdated || '--:--'}
                {updateError && <span style={{ color: '#c00', marginLeft: '8px' }}>({updateError})</span>}
              </div>
              <a 
                href="/staff/schedules" 
                style={{ color: '#0056b3', textDecoration: 'none', display: 'inline-block', marginTop: '4px' }}
                onClick={(e) => { e.preventDefault(); navigate('/staff/schedules'); }}
              >
                Đến trang Lịch khám &rarr;
              </a>
            </div>
          </div>

          <div className="mc-dashboard-table-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {error ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#c00' }}>
                <p>{error}</p>
                <Button onClick={() => fetchSchedules()} variant="secondary">Thử lại</Button>
              </div>
            ) : loading ? (
              <div style={{ padding: '4rem', textAlign: 'center', color: '#666' }}>Đang tải danh sách...</div>
            ) : (
              <Table 
                columns={columns}
                data={schedules}
                rowKey={(r) => r.idLichKham}
                emptyText="Hôm nay chưa có bệnh nhân"
              />
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
