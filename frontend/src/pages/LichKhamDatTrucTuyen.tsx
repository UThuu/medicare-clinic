import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { lichKhamDatTrucTuyenService, LichKhamApiError } from '../services/lichKhamDatTrucTuyenService';
import type {
  BacSiGoiYItem,
  KhungGioGoiYItem,
  LichKhamDatTrucTuyenResponse,
  LichKhamKiemTraTrongResponse,
} from '../types/LichKhamDatTrucTuyen';
import './lichKhamDatTrucTuyen.css';

interface LichKhamDatTrucTuyenProps {
  /** Route dành riêng cho xem thử UI, dùng dữ liệu minh họa và không gọi backend. */
  devMode?: boolean;
}

const sampleDoctors: BacSiGoiYItem[] = [
  {
    maBacSi: 'BS001',
    hoTenBacSi: 'Nguyễn Minh Anh',
    chuyenKhoa: 'Nội tổng quát',
    bangCap: 'Thạc sĩ Y khoa',
    soLanKhamTruoc: 3,
    ngayKhamGanNhat: '2026-09-18',
  },
  {
    maBacSi: 'BS008',
    hoTenBacSi: 'Trần Hoàng Nam',
    chuyenKhoa: 'Tim mạch',
    bangCap: 'Bác sĩ chuyên khoa I',
    soLanKhamTruoc: 2,
    ngayKhamGanNhat: '2026-08-26',
  },
  {
    maBacSi: 'BS012',
    hoTenBacSi: 'Lê Ngọc Hà',
    chuyenKhoa: 'Da liễu',
    bangCap: 'Bác sĩ chuyên khoa I',
    soLanKhamTruoc: 1,
    ngayKhamGanNhat: '2026-06-12',
  },
];

function localDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getTomorrowDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return localDateString(tomorrow);
}

function formatDate(value?: string | null): string {
  if (!value) return 'Chưa có dữ liệu';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  }).format(date);
}

function normalizeTime(value: string): string {
  return value.length >= 5 ? value.slice(0, 5) : value;
}

function toFriendlyError(error: unknown): string {
  if (error instanceof LichKhamApiError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Đã xảy ra lỗi. Vui lòng thử lại.';
}

export const LichKhamDatTrucTuyen: React.FC<LichKhamDatTrucTuyenProps> = ({ devMode = false }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<BacSiGoiYItem[]>([]);
  const [doctorMessage, setDoctorMessage] = useState('');
  const [maBacSi, setMaBacSi] = useState('');
  const [ngayKham, setNgayKham] = useState(getTomorrowDate);
  const [gioKham, setGioKham] = useState('09:00');
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
  const [isCheckingSlot, setIsCheckingSlot] = useState(false);
  const [isLoadingAlternatives, setIsLoadingAlternatives] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [pageError, setPageError] = useState('');
  const [actionError, setActionError] = useState('');
  const [slotResult, setSlotResult] = useState<LichKhamKiemTraTrongResponse | null>(null);
  const [alternativeSlots, setAlternativeSlots] = useState<KhungGioGoiYItem[]>([]);
  const [alternativeMessage, setAlternativeMessage] = useState('');
  const [bookingResult, setBookingResult] = useState<LichKhamDatTrucTuyenResponse | null>(null);

  const selectedDoctor = useMemo(
    () => doctors.find((doctor) => doctor.maBacSi === maBacSi),
    [doctors, maBacSi],
  );
  const minDate = useMemo(() => localDateString(new Date()), []);

  useEffect(() => {
    let active = true;
    const loadDoctors = async () => {
      setIsLoadingDoctors(true);
      setPageError('');
      if (devMode) {
        setDoctors(sampleDoctors);
        setDoctorMessage('Bác sĩ từng khám — dữ liệu minh họa cho giao diện.');
        setMaBacSi(sampleDoctors[0].maBacSi);
        setIsLoadingDoctors(false);
        return;
      }
      try {
        const response = await lichKhamDatTrucTuyenService.getRecommendedDoctors({ soLuongToiDa: 5 });
        if (!active) return;
        setDoctors(response.danhSachBacSi ?? []);
        setDoctorMessage(response.thongBao ?? '');
        if (response.danhSachBacSi?.length) {
          setMaBacSi(response.danhSachBacSi[0].maBacSi);
        }
      } catch (error) {
        if (active) setPageError(toFriendlyError(error));
      } finally {
        if (active) setIsLoadingDoctors(false);
      }
    };
    void loadDoctors();
    return () => { active = false; };
  }, [devMode]);

  const invalidateSlot = () => {
    setSlotResult(null);
    setAlternativeSlots([]);
    setAlternativeMessage('');
    setBookingResult(null);
    setActionError('');
  };

  const getRequest = () => ({
    maBacSi: maBacSi.trim(),
    ngayKham,
    gioKham: `${gioKham}:00`.slice(0, 8),
  });

  const getAlternatives = async () => {
    if (!maBacSi.trim() || !ngayKham || !gioKham) {
      setActionError('Hãy chọn bác sĩ, ngày khám và giờ khám trước khi tìm giờ thay thế.');
      return;
    }
    setIsLoadingAlternatives(true);
    setActionError('');
    try {
      if (devMode) {
        const candidates = ['08:30', '09:30', '10:00', '13:30', '14:30'];
        setAlternativeSlots(candidates.map((time) => ({
          maBacSi: maBacSi.trim(),
          hoTenBacSi: selectedDoctor?.hoTenBacSi ?? 'Bác sĩ minh họa',
          chuyenKhoa: selectedDoctor?.chuyenKhoa ?? 'Chuyên khoa minh họa',
          ngayKham,
          gioKham: `${time}:00`,
        })));
        setAlternativeMessage('Các khung giờ minh họa gần giờ bạn chọn.');
      } else {
        const response = await lichKhamDatTrucTuyenService.getAlternativeSlots({
          maBacSi: maBacSi.trim(),
          ngayKham,
          gioKhamMongMuon: `${gioKham}:00`.slice(0, 8),
          soLuongGoiY: 5,
        });
        setAlternativeSlots(response.danhSachKhungGio ?? []);
        setAlternativeMessage(response.thongBao ?? '');
      }
    } catch (error) {
      setActionError(toFriendlyError(error));
    } finally {
      setIsLoadingAlternatives(false);
    }
  };

  const handleCheckSlot = async () => {
    if (!maBacSi.trim() || !ngayKham || !gioKham) {
      setActionError('Vui lòng chọn bác sĩ, ngày khám và giờ khám.');
      return;
    }
    setIsCheckingSlot(true);
    setActionError('');
    setSlotResult(null);
    setAlternativeSlots([]);
    setAlternativeMessage('');
    setBookingResult(null);
    try {
      let result: LichKhamKiemTraTrongResponse;
      if (devMode) {
        const isBusy = ['09:00', '14:00'].includes(gioKham);
        result = {
          maBacSi: maBacSi.trim(),
          ngayKham,
          gioKham: `${gioKham}:00`.slice(0, 8),
          conTrong: !isBusy,
          thongBao: isBusy
            ? 'Khung giờ này đang được đặt trong dữ liệu minh họa.'
            : 'Khung giờ còn trống (kết quả minh họa).',
        };
      } else {
        result = await lichKhamDatTrucTuyenService.checkAvailability(getRequest());
      }
      setSlotResult(result);
      if (!result.conTrong) await getAlternatives();
    } catch (error) {
      setActionError(toFriendlyError(error));
    } finally {
      setIsCheckingSlot(false);
    }
  };

  const handleSelectAlternative = (slot: KhungGioGoiYItem) => {
    setMaBacSi(slot.maBacSi);
    setNgayKham(slot.ngayKham);
    setGioKham(normalizeTime(slot.gioKham));
    setSlotResult(null);
    setAlternativeSlots([]);
    setAlternativeMessage('');
    setBookingResult(null);
    setActionError('Đã chọn giờ gợi ý. Hãy kiểm tra lại khung giờ trước khi xác nhận đặt lịch.');
  };

  const handleBook = async () => {
    if (!slotResult?.conTrong) {
      setActionError('Hãy kiểm tra và xác nhận khung giờ còn trống trước khi đặt lịch.');
      return;
    }
    setIsBooking(true);
    setActionError('');
    try {
      let result: LichKhamDatTrucTuyenResponse;
      if (devMode) {
        result = {
          thongBao: 'Đặt lịch thành công (dữ liệu minh họa, chưa lưu lên hệ thống).',
          idLichKham: 'DEMO-UC24-001',
          idBenhNhan: 'BN-DEMO',
          hoTenBenhNhan: 'Nguyễn An Bình',
          maBacSi: maBacSi.trim(),
          hoTenBacSi: selectedDoctor?.hoTenBacSi ?? 'Bác sĩ minh họa',
          ngayKham,
          gioKham: `${gioKham}:00`.slice(0, 8),
          trangThai: 'DA_DAT',
          phuongThucDatLich: 'TRUC_TUYEN',
        };
      } else {
        result = await lichKhamDatTrucTuyenService.bookOnline(getRequest());
      }
      setBookingResult(result);
      setSlotResult(null);
    } catch (error) {
      setActionError(toFriendlyError(error));
    } finally {
      setIsBooking(false);
    }
  };

  const changeDoctor = (value: string) => {
    setMaBacSi(value);
    invalidateSlot();
  };

  const resetForm = () => {
    setMaBacSi(doctors[0]?.maBacSi ?? '');
    setNgayKham(getTomorrowDate());
    setGioKham('09:00');
    invalidateSlot();
  };

  return (
    <div className="uc24-page">
      <header className="uc24-topbar">
        <div className="uc24-brand">
          <span className="uc24-brand__mark" aria-hidden="true">+</span>
          <span><strong>MediCare</strong><small>CLINIC</small></span>
        </div>
        <div className="uc24-topbar__right">
          <span className="uc24-secure"><span aria-hidden="true">●</span> Đặt lịch an toàn</span>
          {!devMode && user && <span className="uc24-user">{user.hoTen}</span>}
          {!devMode && <button className="uc24-text-btn" onClick={() => navigate('/patient')}>Trang bệnh nhân</button>}
        </div>
      </header>

      <main className="uc24-container">
        <div className="uc24-breadcrumb"><Link to={devMode ? '/login' : '/patient'}>Trang chủ</Link><span>/</span><span>Đặt lịch khám</span></div>

        {devMode && (
          <div className="uc24-demo-banner">
            <span className="uc24-demo-banner__dot" />
            <div><strong>Chế độ xem giao diện</strong><span>Dữ liệu minh họa — thao tác không gọi API và không lưu lịch khám thật.</span></div>
          </div>
        )}

        <section className="uc24-hero">
          <div>
            <div className="uc24-eyebrow">MEDICARE · HẸN KHÁM TRỰC TUYẾN</div>
            <h1>Đặt lịch khám trực tuyến</h1>
            <p>Chọn bác sĩ, thời gian phù hợp và kiểm tra khung giờ trước khi xác nhận lịch hẹn.</p>
          </div>
          <div className="uc24-hero__symbol" aria-hidden="true"><span>+</span></div>
        </section>

        {pageError && (
          <div className="uc24-alert uc24-alert--error" role="alert">
            <strong>Không tải được gợi ý bác sĩ</strong><span>{pageError}</span>
            {!devMode && <button onClick={() => window.location.reload()}>Thử tải lại</button>}
          </div>
        )}
        {actionError && <div className={`uc24-alert ${actionError.startsWith('Đã chọn') ? 'uc24-alert--info' : 'uc24-alert--error'}`} role="alert">{actionError}</div>}

        <div className="uc24-layout">
          <section className="uc24-panel uc24-panel--form">
            <div className="uc24-panel-heading">
              <div className="uc24-step">01</div>
              <div><h2>Thông tin lịch hẹn</h2><p>Các trường có dấu * là bắt buộc</p></div>
            </div>

            <div className="uc24-field-group">
              <div className="uc24-label-line"><label>Bác sĩ khám <span>*</span></label><span className="uc24-label-helper">Gợi ý từ lịch sử khám</span></div>
              {isLoadingDoctors ? (
                <div className="uc24-loading"><span className="uc24-spinner" /> Đang tải danh sách bác sĩ...</div>
              ) : doctors.length > 0 ? (
                <div className="uc24-doctor-list">
                  {doctors.map((doctor) => (
                    <button
                      type="button"
                      key={doctor.maBacSi}
                      className={`uc24-doctor-card ${maBacSi === doctor.maBacSi ? 'is-selected' : ''}`}
                      onClick={() => changeDoctor(doctor.maBacSi)}
                      aria-pressed={maBacSi === doctor.maBacSi}
                    >
                      <span className="uc24-doctor-avatar" aria-hidden="true">BS</span>
                      <span className="uc24-doctor-card__content">
                        <strong>{doctor.hoTenBacSi}</strong>
                        <small>{doctor.chuyenKhoa || 'Chưa cập nhật chuyên khoa'} · {doctor.maBacSi}</small>
                        <small>Đã khám {doctor.soLanKhamTruoc} lần · Gần nhất: {formatDate(doctor.ngayKhamGanNhat)}</small>
                      </span>
                      <span className="uc24-radio" aria-hidden="true">{maBacSi === doctor.maBacSi ? '✓' : ''}</span>
                    </button>
                  ))}
                  {doctorMessage && <p className="uc24-help-text">{doctorMessage}</p>}
                  <details className="uc24-manual-doctor">
                    <summary>Nhập mã bác sĩ khác</summary>
                    <label htmlFor="uc24-doctor-id">Mã bác sĩ</label>
                    <input id="uc24-doctor-id" value={maBacSi} onChange={(event) => changeDoctor(event.target.value)} placeholder="Ví dụ: BS001" />
                    <small>API hiện tại chưa có chức năng liệt kê toàn bộ bác sĩ; chỉ có gợi ý bác sĩ từng khám và tra cứu bằng mã.</small>
                  </details>
                </div>
              ) : (
                <div className="uc24-no-doctors">
                  <span className="uc24-no-doctors__icon" aria-hidden="true">i</span>
                  <div><strong>{doctorMessage || 'Chưa có gợi ý bác sĩ từ lịch sử khám.'}</strong><p>Nhập mã bác sĩ nếu bạn đã biết mã. Có thể bổ sung danh sách bác sĩ khi backend có API tra cứu bác sĩ.</p></div>
                </div>
              )}
              {doctors.length === 0 && !isLoadingDoctors && (
                <div className="uc24-inline-input"><label htmlFor="uc24-doctor-id-fallback">Mã bác sĩ <span>*</span></label><input id="uc24-doctor-id-fallback" value={maBacSi} onChange={(event) => changeDoctor(event.target.value)} placeholder="Nhập mã bác sĩ" /></div>
              )}
            </div>

            <div className="uc24-form-grid">
              <div className="uc24-field-group"><label htmlFor="uc24-date">Ngày khám <span>*</span></label><input id="uc24-date" type="date" min={minDate} value={ngayKham} onChange={(event) => { setNgayKham(event.target.value); invalidateSlot(); }} /></div>
              <div className="uc24-field-group"><label htmlFor="uc24-time">Giờ khám <span>*</span></label><input id="uc24-time" type="time" step={1800} value={gioKham} onChange={(event) => { setGioKham(event.target.value); invalidateSlot(); }} /><small>Khung giờ cách nhau 30 phút theo cấu hình hiện tại.</small></div>
            </div>

            <div className="uc24-form-actions">
              <button type="button" className="uc24-button uc24-button--primary" onClick={handleCheckSlot} disabled={isCheckingSlot || isLoadingDoctors}>
                {isCheckingSlot ? <><span className="uc24-spinner uc24-spinner--light" /> Đang kiểm tra...</> : 'Kiểm tra khung giờ'}
              </button>
              <button type="button" className="uc24-button uc24-button--outline" onClick={resetForm}>Đặt lại</button>
            </div>

            {slotResult && (
              <div className={`uc24-slot-result ${slotResult.conTrong ? 'is-available' : 'is-unavailable'}`} role="status">
                <span className="uc24-slot-result__icon">{slotResult.conTrong ? '✓' : '!'}</span>
                <div><strong>{slotResult.conTrong ? 'Khung giờ còn trống' : 'Khung giờ không còn trống'}</strong><p>{slotResult.thongBao}</p></div>
              </div>
            )}

            {slotResult?.conTrong && !bookingResult && (
              <div className="uc24-confirm-box">
                <div><strong>Xác nhận lịch hẹn</strong><p>{selectedDoctor?.hoTenBacSi || `Bác sĩ ${maBacSi}`} · {formatDate(ngayKham)} · {gioKham}</p></div>
                <button type="button" className="uc24-button uc24-button--primary" onClick={handleBook} disabled={isBooking}>
                  {isBooking ? <><span className="uc24-spinner uc24-spinner--light" /> Đang đặt lịch...</> : 'Xác nhận đặt lịch'}
                </button>
              </div>
            )}

            {bookingResult && (
              <div className="uc24-booking-success" role="status">
                <div className="uc24-success-icon" aria-hidden="true">✓</div>
                <div><span className="uc24-success-eyebrow">ĐẶT LỊCH THÀNH CÔNG</span><h3>Lịch hẹn đã được ghi nhận</h3><p>{bookingResult.thongBao}</p></div>
                <dl>
                  <div><dt>Mã lịch khám</dt><dd>{bookingResult.idLichKham}</dd></div>
                  <div><dt>Bác sĩ</dt><dd>{bookingResult.hoTenBacSi || bookingResult.maBacSi}</dd></div>
                  <div><dt>Thời gian</dt><dd>{formatDate(bookingResult.ngayKham)} · {normalizeTime(bookingResult.gioKham)}</dd></div>
                  <div><dt>Trạng thái</dt><dd><span className="uc24-status-pill">{bookingResult.trangThai}</span></dd></div>
                </dl>
                <button className="uc24-button uc24-button--outline" onClick={resetForm}>Đặt lịch khác</button>
              </div>
            )}

            {alternativeSlots.length > 0 && (
              <div className="uc24-alternatives">
                <div className="uc24-alternatives__heading"><h3>Khung giờ thay thế</h3><span>{alternativeSlots.length} gợi ý</span></div>
                {alternativeMessage && <p>{alternativeMessage}</p>}
                <div className="uc24-alternative-grid">
                  {alternativeSlots.map((slot, index) => (
                    <button type="button" key={`${slot.maBacSi}-${slot.ngayKham}-${slot.gioKham}-${index}`} className="uc24-alternative-card" onClick={() => handleSelectAlternative(slot)}>
                      <strong>{normalizeTime(slot.gioKham)}</strong><span>{formatDate(slot.ngayKham)}</span><small>{slot.hoTenBacSi || slot.maBacSi}</small><em>Chọn giờ này →</em>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {!slotResult?.conTrong && !bookingResult && maBacSi.trim() && ngayKham && gioKham && !isCheckingSlot && slotResult && alternativeSlots.length === 0 && (
              <button type="button" className="uc24-button uc24-button--outline uc24-alternatives-trigger" onClick={getAlternatives} disabled={isLoadingAlternatives}>
                {isLoadingAlternatives ? 'Đang tìm giờ...' : 'Tìm khung giờ thay thế'}
              </button>
            )}
          </section>

          <aside className="uc24-side-column">
            <section className="uc24-panel uc24-summary-panel">
              <div className="uc24-panel-heading"><div className="uc24-step uc24-step--soft">02</div><div><h2>Tóm tắt lịch hẹn</h2><p>Kiểm tra thông tin trước khi xác nhận</p></div></div>
              <div className="uc24-summary-doctor"><span className="uc24-summary-avatar">+</span><div><strong>{selectedDoctor?.hoTenBacSi || (maBacSi ? `Bác sĩ ${maBacSi}` : 'Chưa chọn bác sĩ')}</strong><span>{selectedDoctor?.chuyenKhoa || 'Chuyên khoa chưa xác định'}</span></div></div>
              <div className="uc24-summary-row"><span>Ngày khám</span><strong>{ngayKham ? formatDate(ngayKham) : 'Chưa chọn'}</strong></div>
              <div className="uc24-summary-row"><span>Giờ khám</span><strong>{gioKham || 'Chưa chọn'}</strong></div>
              <div className="uc24-summary-row"><span>Hình thức</span><strong>Trực tuyến</strong></div>
              <div className="uc24-summary-footnote"><span aria-hidden="true">i</span><p>Khung giờ chỉ được giữ sau khi hệ thống xác nhận đặt lịch thành công. Nếu có người đặt trước, hãy chọn giờ thay thế.</p></div>
            </section>

            <section className="uc24-help-card">
              <div className="uc24-help-card__icon" aria-hidden="true">?</div><h3>Cần lưu ý?</h3>
              <p>Vui lòng chọn ngày trong tương lai. Hệ thống kiểm tra khung giờ trước khi lưu lịch để tránh trùng lịch bác sĩ.</p>
              {!devMode && <a href="/patient">Quay lại trang bệnh nhân</a>}
            </section>
            <div className="uc24-privacy-note"><span aria-hidden="true">▣</span><p>Thông tin bệnh nhân được xác định từ phiên đăng nhập. Không cần nhập mã bệnh nhân khi đặt lịch trực tuyến.</p></div>
          </aside>
        </div>
        <footer className="uc24-footer">© MediCare Clinic · Đặt lịch khám trực tuyến</footer>
      </main>
    </div>
  );
};
