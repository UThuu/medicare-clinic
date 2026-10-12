import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/common/Button';
import { ReceptionLayout, ReceptionIcon } from '../components/layout/ReceptionLayout';
import { layLichHenTrongNgay, type LichHenTrongNgay } from '../services/lichKhamDatTaiQuayService';

export function ReceptionDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lichHens, setLichHens] = useState<LichHenTrongNgay[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const today = new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date());

  const taiLichHen = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await layLichHenTrongNgay();
      setLichHens(data || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tải danh sách lịch hẹn.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void taiLichHen();
  }, [taiLichHen]);

  const formatTime = (time: string) => {
    if (!time) return '';
    return time.length >= 5 ? time.substring(0, 5) : time;
  };

  return (
    <ReceptionLayout>
      <div className="mc-reception-dashboard">
        <div className="mc-reception-heading">
          <h1>Tổng quan hôm nay</h1>
          <p>Xin chào, {user?.hoTen || user?.tenDangNhap}</p>
        </div>

        {errorMsg && (
          <div style={{ padding: '12px 16px', background: '#FDEAEA', color: '#DC2626', borderRadius: '8px', fontSize: '14px' }}>
            {errorMsg}
          </div>
        )}

        <div className="mc-reception-functions">
          <section className="mc-reception-card mc-reception-function">
            <div className="mc-reception-function__heading">
              <span className="mc-reception-icon"><ReceptionIcon kind="patient" /></span>
              <div><h2>Tiếp nhận bệnh nhân</h2><p>Tra cứu hồ sơ, kiểm tra lịch khám và tiếp nhận bệnh nhân.</p></div>
            </div>
            <Button size="lg" onClick={() => navigate('/staff/tiep-nhan')}>Tiếp nhận</Button>
          </section>
          <section className="mc-reception-card mc-reception-function">
            <div className="mc-reception-function__heading">
              <span className="mc-reception-icon"><ReceptionIcon kind="calendar" /></span>
              <div><h2>Đặt lịch</h2><p>Chọn bác sĩ và thời gian khám phù hợp.</p></div>
            </div>
            <Button size="lg" onClick={() => navigate('/staff/lich-kham/dat-tai-quay')}>Đặt lịch</Button>
          </section>
          <section className="mc-reception-card mc-reception-function">
            <div className="mc-reception-function__heading">
              <span className="mc-reception-icon"><ReceptionIcon kind="queue" /></span>
              <div><h2>Danh sách chờ</h2><p>Theo dõi bệnh nhân chờ đo sinh hiệu.</p></div>
            </div>
            <Button size="lg" onClick={() => navigate('/staff/benh-nhan-cho')}>Xem hàng chờ</Button>
          </section>
        </div>

        <section className="mc-reception-card mc-reception-appointments" aria-labelledby="reception-appointments-title">
          <div className="mc-reception-appointments__heading">
            <div>
              <h2 id="reception-appointments-title">Lịch hẹn trong ngày</h2>
              <p>Danh sách bệnh nhân dự kiến đến khám</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Button variant="secondary" size="sm" onClick={() => void taiLichHen()} disabled={loading}>
                Làm mới
              </Button>
              <div className="mc-reception-date" aria-label="Ngày hiện tại">
                <ReceptionIcon kind="calendar" />
                <time>{today}</time>
              </div>
            </div>
          </div>

          <div className="mc-reception-table-scroll" tabIndex={0} aria-label="Lịch hẹn trong ngày">
            <table className="mc-table">
              <thead>
                <tr>
                  <th scope="col" style={{ width: '100px' }}>Giờ hẹn</th>
                  <th scope="col">Bệnh nhân</th>
                  <th scope="col">Bác sĩ</th>
                  <th scope="col" style={{ width: '140px' }}>Trạng thái</th>
                  <th scope="col" style={{ width: '150px' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="mc-table__empty">
                      Đang tải lịch hẹn trong ngày...
                    </td>
                  </tr>
                ) : lichHens.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="mc-table__empty">
                      Chưa có lịch hẹn nào trong ngày hôm nay.
                    </td>
                  </tr>
                ) : (
                  lichHens.map((lh) => {
                    const isDaTiepNhan = lh.daTiepNhan || lh.trangThai === 'DA_TIEP_NHAN';
                    const isDaHuy = lh.trangThai === 'DA_HUY';

                    return (
                      <tr key={lh.idLichKham}>
                        <td>
                          <strong>{formatTime(lh.gioKham)}</strong>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{lh.tenBenhNhan}</div>
                          {lh.soDienThoaiBenhNhan && (
                            <div style={{ fontSize: '12px', color: 'var(--mc-neutral-500)' }}>
                              {lh.soDienThoaiBenhNhan}
                            </div>
                          )}
                        </td>
                        <td>
                          <div>{lh.tenBacSi}</div>
                          {lh.chuyenKhoa && (
                            <div style={{ fontSize: '12px', color: 'var(--mc-neutral-500)' }}>
                              {lh.chuyenKhoa}
                            </div>
                          )}
                        </td>
                        <td>
                          {isDaHuy ? (
                            <span className="mc-status mc-status--error">
                              <span className="mc-status__dot" />
                              Đã hủy
                            </span>
                          ) : isDaTiepNhan ? (
                            <span className="mc-status mc-status--success">
                              <span className="mc-status__dot" />
                              Đã tiếp nhận
                            </span>
                          ) : (
                            <span className="mc-status mc-status--warning">
                              <span className="mc-status__dot" />
                              Chờ tiếp nhận
                            </span>
                          )}
                        </td>
                        <td>
                          {isDaTiepNhan ? (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => navigate('/staff/benh-nhan-cho')}
                            >
                              Xem hàng chờ
                            </Button>
                          ) : (
                            <span style={{ fontSize: '13px', color: 'var(--mc-neutral-500)' }}>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mc-reception-card mc-reception-process">
          <span className="mc-reception-icon"><ReceptionIcon kind="document" /></span>
          <div>
            <h2>Quy trình tiếp nhận</h2>
            <p>Tìm hồ sơ → Tạo hồ sơ mới → Xác nhận lịch hẹn → Tiếp nhận → Chờ đo sinh hiệu</p>
            <small>Lễ tân thực hiện tiếp nhận bệnh nhân tại mục Tiếp nhận bệnh nhân để chuyển sang hàng chờ đo sinh hiệu.</small>
          </div>
        </section>
      </div>
    </ReceptionLayout>
  );
}
