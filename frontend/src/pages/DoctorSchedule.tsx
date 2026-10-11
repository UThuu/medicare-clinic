import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { scheduleService } from '../services/scheduleService';
import { DoctorScheduleResponse, TrangThaiLichKham, TrangThaiLuotKham } from '../types/schedule';
import { MainLayout } from '../components/layout/MainLayout';
import { Table, TableColumn } from '../components/common/Table';
import { Input } from '../components/common/Input';
import { SearchBox } from '../components/common/SearchBox';
import { StatusBadge, StatusTone } from '../components/common/StatusBadge';
import { Button } from '../components/common/Button';

// Lấy ngày hiện tại tại VN định dạng yyyy-MM-dd
const getVnDateString = () => {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' });
};

// Tính tuổi
const calculateAge = (dob: string) => {
  if (!dob) return '?';
  const birthDate = new Date(dob);
  const diff = Date.now() - birthDate.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
};

export const DoctorSchedule: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [date, setDate] = useState<string>(getVnDateString());
  const [searchTerm, setSearchTerm] = useState('');
  const [schedules, setSchedules] = useState<DoctorScheduleResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedules = async (targetDate: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await scheduleService.getDoctorSchedule(targetDate);
      data.sort((a, b) => {
        if (a.gioKham !== b.gioKham) return a.gioKham.localeCompare(b.gioKham);
        return a.idLichKham.localeCompare(b.idLichKham);
      });
      setSchedules(data);
    } catch (err: any) {
      if (err.status === 401) {
        logout();
      } else if (err.status === 403) {
        setError('Bạn không có quyền xem lịch khám.');
      } else {
        setError(err.message || 'Lỗi mạng hoặc máy chủ. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules(date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const filteredSchedules = useMemo(() => {
    if (!searchTerm) return schedules;
    const lower = searchTerm.toLowerCase();
    return schedules.filter(s => 
      s.tenBenhNhan.toLowerCase().includes(lower) || 
      s.idBenhNhan.toLowerCase().includes(lower)
    );
  }, [schedules, searchTerm]);

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
      className="mc-schedule-cell"
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

  const formatDateTime = (isoStr: string) => {
    if (!isoStr) return '';
    if (!isoStr.includes('T')) return isoStr;
    const parts = isoStr.split('T');
    return `${parts[1]} ${parts[0]}`;
  };

  const columns: TableColumn<DoctorScheduleResponse>[] = [
    {
      key: 'gioKham',
      header: 'Giờ hẹn',
      width: '10%',
      render: (r) => renderClickable(r.gioKham.substring(0, 5), r.idLichKham, true)
    },
    {
      key: 'benhNhan',
      header: 'Bệnh nhân',
      width: '35%',
      render: (r) => renderClickable(
        <div>
          <strong style={{ display: 'block', color: '#111' }}>{r.tenBenhNhan}</strong>
          <span style={{ fontSize: '0.85em', color: '#666', marginTop: '4px', display: 'block' }}>
            {r.idBenhNhan} • {r.gioiTinh === 'NAM' ? 'Nam' : r.gioiTinh === 'NU' ? 'Nữ' : 'Khác'} • {calculateAge(r.ngaySinh)} tuổi
          </span>
        </div>,
        r.idLichKham
      )
    },
    {
      key: 'lyDoKham',
      header: 'Lý do khám',
      width: '20%',
      render: (r) => renderClickable(
        r.lyDoKham ? <span>{r.lyDoKham}</span> : <span style={{ color: '#888' }}>[Chưa có]</span>, 
        r.idLichKham
      )
    },
    {
      key: 'sinhHieu',
      header: 'Sinh hiệu',
      width: '20%',
      render: (r) => {
        if (!r.huyetApTamThu && !r.nhietDo && !r.canNang) {
            return renderClickable(<span style={{ color: '#888' }}>Chưa có</span>, r.idLichKham);
        }
        return renderClickable(
          <div style={{ fontSize: '0.85em', color: '#555' }}>
            {r.huyetApTamThu && r.huyetApTamTruong && <div>HA: {r.huyetApTamThu}/{r.huyetApTamTruong} mmHg</div>}
            {r.nhietDo && <div>NĐ: {r.nhietDo}°C</div>}
            {r.canNang && <div>CN: {r.canNang}kg</div>}
            {r.thoiDiemDoSinhHieu && <div style={{ color: '#888', fontSize: '0.9em' }}>{formatDateTime(r.thoiDiemDoSinhHieu)}</div>}
          </div>,
          r.idLichKham
        );
      }
    },
    {
      key: 'trangThai',
      header: 'Trạng thái',
      width: '15%',
      align: 'right',
      render: (r) => {
        const status = getStatusDisplay(r.trangThaiLichKham, r.trangThaiLuotKham);
        return renderClickable(<StatusBadge tone={status.tone}>{status.text}</StatusBadge>, r.idLichKham);
      }
    }
  ];

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
        <style>
          {`
            .mc-schedule-table-container .mc-table td {
              padding: 0;
            }
            .mc-schedule-cell {
              display: flex;
              align-items: center;
              padding: 12px 16px;
              min-height: 48px;
              height: 100%;
              cursor: pointer;
              outline: none;
            }
            .mc-schedule-cell:focus-visible {
              box-shadow: inset 0 0 0 2px #0F8B8D;
            }
            .mc-schedule-table-container .mc-table tr:hover .mc-schedule-cell {
              background: #F7FAFC;
            }
          `}
        </style>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 600 }}>Lịch khám</h1>
            <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>Danh sách bệnh nhân hẹn khám và chờ khám</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontWeight: 500 }}>Ngày khám:</span>
            <Input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              style={{ width: '150px' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem', width: '320px' }}>
          <SearchBox 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="mc-schedule-table-container">
          {error ? (
            <div style={{ padding: '2rem', textAlign: 'center', background: '#fff0f0', border: '1px solid #ffd0d0', borderRadius: '8px' }}>
              <p style={{ color: '#c00', marginBottom: '1rem' }}>{error}</p>
              <Button onClick={() => fetchSchedules(date)} variant="secondary">Thử lại</Button>
            </div>
          ) : loading ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: '#666' }}>Đang tải lịch khám...</div>
          ) : (
            <Table 
              columns={columns}
              data={filteredSchedules}
              rowKey={(r) => r.idLichKham}
              emptyText={searchTerm ? 'Không tìm thấy bệnh nhân phù hợp' : 'Chưa có bệnh nhân chờ khám'}
            />
          )}
        </div>
      </div>
    </MainLayout>
  );
};
