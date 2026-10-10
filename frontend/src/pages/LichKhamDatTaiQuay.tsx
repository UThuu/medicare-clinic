import React from 'react';
import './lichKhamDatTaiQuay.css';
import {
  datLichKhamTaiQuay,
  kiemTraKhungGio,
  timBenhNhanTheoHoTenVaNgaySinh,
  timBenhNhanTheoSoDienThoai,
} from '../services/lichKhamDatTaiQuayService';
import type {
  BenhNhanTimKiemTaiQuay,
  LichKhamDatTaiQuayRequest,
  LichKhamDatTaiQuayResponse,
  LichKhamKiemTraTrongResponse,
} from '../types/LichKhamDatTaiQuay';

interface LichKhamDatTaiQuayProps {
  /** true only for /dev/uc30; the page uses sample data instead of calling UC30 endpoints. */
  demo?: boolean;
}

type SearchMode = 'phone' | 'nameBirth';

const getToday = () => {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
};

const addDays = (dateText: string, days: number) => {
  const date = new Date(`${dateText}T12:00:00`);
  date.setDate(date.getDate() + days);
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
};

const samplePatients: BenhNhanTimKiemTaiQuay[] = [
  {
    idBenhNhan: 'BN-DEMO-001',
    hoTen: 'Nguyễn Minh An',
    ngaySinh: '1998-04-12',
    gioiTinh: 'NAM',
    soDienThoai: '0901234567',
    diaChi: 'Quận 1, TP. Hồ Chí Minh',
  },
  {
    idBenhNhan: 'BN-DEMO-002',
    hoTen: 'Trần Ngọc Hà',
    ngaySinh: '2001-09-24',
    gioiTinh: 'NU',
    soDienThoai: '0912345678',
    diaChi: 'Quận 3, TP. Hồ Chí Minh',
  },
];

const sampleBooking: LichKhamDatTaiQuayResponse = {
  thongBao: 'Đặt lịch khám tại quầy thành công. Đây là kết quả minh họa.',
  idLichKham: 'LK-DEMO-20261015-001',
  idBenhNhan: 'BN-DEMO-001',
  hoTenBenhNhan: 'Nguyễn Minh An',
  maBacSi: 'BS-DEMO-01',
  hoTenBacSi: 'Bác sĩ minh họa',
  ngayKham: addDays(getToday(), 1),
  gioKham: '09:00:00',
  trangThai: 'DA_DAT',
  phuongThucDatLich: 'TRUC_TIEP',
};

function formatDate(date: string) {
  if (!date) return '—';
  const parsed = new Date(`${date}T00:00:00`);
  return Number.isNaN(parsed.getTime())
    ? date
    : parsed.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatTime(time: string) {
  return time ? time.slice(0, 5) : '—';
}

export const LichKhamDatTaiQuay: React.FC<LichKhamDatTaiQuayProps> = ({ demo = false }) => {
  const [searchMode, setSearchMode] = React.useState<SearchMode>('phone');
  const [phone, setPhone] = React.useState('');
  const [patientName, setPatientName] = React.useState('');
  const [birthDate, setBirthDate] = React.useState('');
  const [patients, setPatients] = React.useState<BenhNhanTimKiemTaiQuay[]>([]);
  const [selectedPatient, setSelectedPatient] = React.useState<BenhNhanTimKiemTaiQuay | null>(null);
  const [searching, setSearching] = React.useState(false);
  const [searchError, setSearchError] = React.useState<string | null>(null);

  const [doctorCode, setDoctorCode] = React.useState('');
  const [appointmentDate, setAppointmentDate] = React.useState(addDays(getToday(), 1));
  const [appointmentTime, setAppointmentTime] = React.useState('09:00');
  const [checkingSlot, setCheckingSlot] = React.useState(false);
  const [slotResult, setSlotResult] = React.useState<LichKhamKiemTraTrongResponse | null>(null);
  const [booking, setBooking] = React.useState(false);
  const [bookingError, setBookingError] = React.useState<string | null>(null);
  const [bookingResult, setBookingResult] = React.useState<LichKhamDatTaiQuayResponse | null>(null);

  const clearSlotResult = () => {
    setSlotResult(null);
    setBookingError(null);
    setBookingResult(null);
  };

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearchError(null);
    setPatients([]);
    setSelectedPatient(null);
    clearSlotResult();

    if (searchMode === 'phone' && !phone.trim()) {
      setSearchError('Vui lòng nhập số điện thoại để tìm bệnh nhân.');
      return;
    }
    if (searchMode === 'nameBirth' && (!patientName.trim() || !birthDate)) {
      setSearchError('Vui lòng nhập họ tên và ngày sinh của bệnh nhân.');
      return;
    }

    setSearching(true);
    try {
      let results: BenhNhanTimKiemTaiQuay[];
      if (demo) {
        const normalizedPhone = phone.trim();
        const normalizedName = patientName.trim().toLocaleLowerCase('vi-VN');
        results = samplePatients.filter((patient) => {
          if (searchMode === 'phone') return patient.soDienThoai.includes(normalizedPhone);
          return patient.hoTen.toLocaleLowerCase('vi-VN').includes(normalizedName)
            && patient.ngaySinh === birthDate;
        });
      } else if (searchMode === 'phone') {
        results = await timBenhNhanTheoSoDienThoai(phone);
      } else {
        results = await timBenhNhanTheoHoTenVaNgaySinh(patientName, birthDate);
      }
      setPatients(results);
      if (results.length === 0) setSearchError('Không tìm thấy hồ sơ phù hợp. Hãy kiểm tra lại thông tin tìm kiếm.');
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : 'Không thể tìm kiếm hồ sơ bệnh nhân.');
    } finally {
      setSearching(false);
    }
  };

  const handleSelectPatient = (patient: BenhNhanTimKiemTaiQuay) => {
    setSelectedPatient(patient);
    clearSlotResult();
    setBookingError(null);
  };

  const handleCheckSlot = async () => {
    setBookingError(null);
    setBookingResult(null);
    setSlotResult(null);

    if (!selectedPatient) {
      setBookingError('Hãy tìm và chọn hồ sơ bệnh nhân trước khi kiểm tra khung giờ.');
      return;
    }
    if (!doctorCode.trim()) {
      setBookingError('Vui lòng nhập mã bác sĩ.');
      return;
    }
    if (!appointmentDate || !appointmentTime) {
      setBookingError('Vui lòng chọn ngày và giờ khám.');
      return;
    }
    if (`${appointmentDate}T${appointmentTime}` < `${getToday()}T${new Date().toTimeString().slice(0, 5)}`) {
      setBookingError('Không thể đặt lịch vào thời điểm đã qua.');
      return;
    }

    setCheckingSlot(true);
    try {
      let result: LichKhamKiemTraTrongResponse;
      if (demo) {
        const available = !['10:00', '14:00'].includes(appointmentTime);
        result = {
          maBacSi: doctorCode.trim(),
          ngayKham: appointmentDate,
          gioKham: appointmentTime,
          conTrong: available,
          thongBao: available
            ? 'Khung giờ còn trống. Có thể tiếp tục đặt lịch (minh họa).'
            : 'Khung giờ này đã có lịch. Hãy chọn một giờ khác (minh họa).',
        };
      } else {
        result = await kiemTraKhungGio(doctorCode, appointmentDate, appointmentTime);
      }
      setSlotResult(result);
    } catch (error) {
      setBookingError(error instanceof Error ? error.message : 'Không thể kiểm tra khung giờ.');
    } finally {
      setCheckingSlot(false);
    }
  };

  const handleBook = async () => {
    setBookingError(null);
    setBookingResult(null);

    if (!selectedPatient || !doctorCode.trim() || !appointmentDate || !appointmentTime) {
      setBookingError('Vui lòng chọn bệnh nhân và nhập đủ mã bác sĩ, ngày khám, giờ khám.');
      return;
    }
    if (!slotResult?.conTrong) {
      setBookingError('Hãy kiểm tra và xác nhận khung giờ còn trống trước khi đặt lịch.');
      return;
    }

    const request: LichKhamDatTaiQuayRequest = {
      idBenhNhan: selectedPatient.idBenhNhan,
      maBacSi: doctorCode.trim(),
      ngayKham: appointmentDate,
      gioKham: appointmentTime,
    };

    setBooking(true);
    try {
      let result: LichKhamDatTaiQuayResponse;
      if (demo) {
        result = {
          ...sampleBooking,
          idLichKham: `LK-DEMO-${Date.now().toString().slice(-8)}`,
          idBenhNhan: selectedPatient.idBenhNhan,
          hoTenBenhNhan: selectedPatient.hoTen,
          maBacSi: doctorCode.trim(),
          ngayKham: appointmentDate,
          gioKham: appointmentTime,
        };
      } else {
        result = await datLichKhamTaiQuay(request);
      }
      setBookingResult(result);
    } catch (error) {
      setBookingError(error instanceof Error ? error.message : 'Không thể đặt lịch khám tại quầy.');
    } finally {
      setBooking(false);
    }
  };

  const startNewBooking = () => {
    setSelectedPatient(null);
    setPatients([]);
    setPhone('');
    setPatientName('');
    setBirthDate('');
    setDoctorCode('');
    setAppointmentDate(addDays(getToday(), 1));
    setAppointmentTime('09:00');
    setSearchError(null);
    setBookingError(null);
    setSlotResult(null);
    setBookingResult(null);
  };

  return (
    <main className="uc30-page">
      <div className="uc30-container">
        <div className="uc30-breadcrumb">Lễ tân <span aria-hidden="true">/</span> Quản lý lịch khám <span aria-hidden="true">/</span> Đặt tại quầy</div>
        <div className="uc30-title-row">
          <div>
            <h1>Đặt lịch khám tại quầy</h1>
            <p className="uc30-subtitle">
              Tìm hồ sơ bệnh nhân, chọn bác sĩ và thời gian khám, kiểm tra khung giờ trước khi xác nhận lịch.
            </p>
          </div>
          {demo && <span className="uc30-demo-badge">CHẾ ĐỘ XEM THỬ · DỮ LIỆU MINH HỌA</span>}
        </div>

        <div className="uc30-layout">
          <div className="uc30-main-column">
            <section className="uc30-card" aria-labelledby="uc30-patient-heading">
              <header className="uc30-card-header">
                <span className="uc30-step">1</span>
                <div>
                  <h2 id="uc30-patient-heading">Chọn hồ sơ bệnh nhân</h2>
                  <p>Tìm theo số điện thoại hoặc theo họ tên kèm ngày sinh.</p>
                </div>
              </header>
              <div className="uc30-card-body">
                <div className="uc30-search-mode" role="tablist" aria-label="Cách tìm bệnh nhân">
                  <button type="button" role="tab" aria-selected={searchMode === 'phone'} className={`uc30-mode-button ${searchMode === 'phone' ? 'is-active' : ''}`} onClick={() => { setSearchMode('phone'); setSearchError(null); setPatients([]); setSelectedPatient(null); clearSlotResult(); }}>
                    Theo số điện thoại
                  </button>
                  <button type="button" role="tab" aria-selected={searchMode === 'nameBirth'} className={`uc30-mode-button ${searchMode === 'nameBirth' ? 'is-active' : ''}`} onClick={() => { setSearchMode('nameBirth'); setSearchError(null); setPatients([]); setSelectedPatient(null); clearSlotResult(); }}>
                    Theo họ tên + ngày sinh
                  </button>
                </div>

                <form onSubmit={handleSearch}>
                  {searchMode === 'phone' ? (
                    <div className="uc30-field">
                      <label htmlFor="uc30-phone">Số điện thoại bệnh nhân</label>
                      <input id="uc30-phone" inputMode="tel" autoComplete="tel" placeholder="Ví dụ: 0901234567" value={phone} onChange={(event) => setPhone(event.target.value)} />
                    </div>
                  ) : (
                    <div className="uc30-field-grid">
                      <div className="uc30-field">
                        <label htmlFor="uc30-patient-name">Họ và tên</label>
                        <input id="uc30-patient-name" autoComplete="name" placeholder="Nhập họ tên bệnh nhân" value={patientName} onChange={(event) => setPatientName(event.target.value)} />
                      </div>
                      <div className="uc30-field">
                        <label htmlFor="uc30-birth-date">Ngày sinh</label>
                        <input id="uc30-birth-date" type="date" value={birthDate} max={getToday()} onChange={(event) => setBirthDate(event.target.value)} />
                      </div>
                    </div>
                  )}
                  {searchError && <div className="uc30-message uc30-message--error" role="alert">{searchError}</div>}
                  <div className="uc30-action-row">
                    <button className="uc30-btn uc30-btn--primary" type="submit" disabled={searching}>
                      {searching ? 'Đang tìm...' : 'Tìm bệnh nhân'}
                    </button>
                    <button className="uc30-btn uc30-btn--secondary" type="button" onClick={() => { setPhone(''); setPatientName(''); setBirthDate(''); setPatients([]); setSelectedPatient(null); setSearchError(null); clearSlotResult(); }}>
                      Xóa điều kiện
                    </button>
                  </div>
                </form>

                {patients.length > 0 && (
                  <div className="uc30-results" aria-live="polite">
                    <h3>Tìm thấy {patients.length} hồ sơ phù hợp</h3>
                    <div className="uc30-patient-list">
                      {patients.map((patient) => (
                        <div className={`uc30-patient-option ${selectedPatient?.idBenhNhan === patient.idBenhNhan ? 'is-selected' : ''}`} key={patient.idBenhNhan}>
                          <div>
                            <strong>{patient.hoTen}</strong>
                            <div className="uc30-patient-meta">
                              Mã hồ sơ: {patient.idBenhNhan}<br />
                              Ngày sinh: {formatDate(patient.ngaySinh)} · Giới tính: {patient.gioiTinh}<br />
                              SĐT: {patient.soDienThoai}
                            </div>
                          </div>
                          <button type="button" className="uc30-select-link" onClick={() => handleSelectPatient(patient)}>
                            {selectedPatient?.idBenhNhan === patient.idBenhNhan ? 'Đã chọn' : 'Chọn hồ sơ'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedPatient && (
                  <div className="uc30-selected-patient">
                    <div className="uc30-selected-heading"><span>Hồ sơ đã chọn</span><span>✓ Đã xác nhận</span></div>
                    <strong>{selectedPatient.hoTen}</strong>
                    <p>Mã hồ sơ: {selectedPatient.idBenhNhan}</p>
                    <p>{selectedPatient.soDienThoai} · Sinh ngày {formatDate(selectedPatient.ngaySinh)}</p>
                    {selectedPatient.diaChi && <p>{selectedPatient.diaChi}</p>}
                  </div>
                )}
              </div>
            </section>

            <section className="uc30-card" aria-labelledby="uc30-appointment-heading">
              <header className="uc30-card-header">
                <span className="uc30-step">2</span>
                <div>
                  <h2 id="uc30-appointment-heading">Thông tin lịch khám</h2>
                  <p>Kiểm tra khung giờ trước khi lưu lịch vào hệ thống.</p>
                </div>
              </header>
              <div className="uc30-card-body">
                {bookingError && <div className="uc30-message uc30-message--error" role="alert">{bookingError}</div>}
                <div className="uc30-field-grid">
                  <div className="uc30-field uc30-field--wide">
                    <label htmlFor="uc30-doctor-code">Mã bác sĩ <span aria-hidden="true">*</span></label>
                    <input id="uc30-doctor-code" placeholder="Nhập mã bác sĩ trong hệ thống" value={doctorCode} onChange={(event) => { setDoctorCode(event.target.value); clearSlotResult(); }} />
                    <p className="uc30-help">API của UC30 hiện chưa cung cấp danh sách bác sĩ để chọn tự động, nên cần nhập mã bác sĩ.</p>
                  </div>
                  <div className="uc30-field">
                    <label htmlFor="uc30-appointment-date">Ngày khám <span aria-hidden="true">*</span></label>
                    <input id="uc30-appointment-date" type="date" min={getToday()} value={appointmentDate} onChange={(event) => { setAppointmentDate(event.target.value); clearSlotResult(); }} />
                  </div>
                  <div className="uc30-field">
                    <label htmlFor="uc30-appointment-time">Giờ khám <span aria-hidden="true">*</span></label>
                    <input id="uc30-appointment-time" type="time" value={appointmentTime} onChange={(event) => { setAppointmentTime(event.target.value); clearSlotResult(); }} />
                  </div>
                </div>

                <div className="uc30-action-row">
                  <button type="button" className="uc30-btn uc30-btn--secondary" onClick={handleCheckSlot} disabled={checkingSlot || !selectedPatient}>
                    {checkingSlot ? 'Đang kiểm tra...' : 'Kiểm tra khung giờ'}
                  </button>
                  <button type="button" className="uc30-btn uc30-btn--primary" onClick={handleBook} disabled={booking || !slotResult?.conTrong || !!bookingResult}>
                    {booking ? 'Đang đặt lịch...' : 'Xác nhận đặt lịch'}
                  </button>
                </div>

                {slotResult && (
                  <div className={`uc30-slot-status ${slotResult.conTrong ? 'is-available' : 'is-unavailable'}`} role="status">
                    <div aria-hidden="true">{slotResult.conTrong ? '✓' : '!'}</div>
                    <div>
                      <strong>{slotResult.conTrong ? 'Khung giờ còn trống' : 'Khung giờ không khả dụng'}</strong>
                      {slotResult.thongBao} <br />
                      {formatDate(slotResult.ngayKham)} lúc {formatTime(slotResult.gioKham)} · Mã bác sĩ {slotResult.maBacSi}
                    </div>
                  </div>
                )}

                {bookingResult && (
                  <div className="uc30-confirmation" role="status" aria-live="polite">
                    <div className="uc30-confirmation-header">
                      <h3>Đặt lịch thành công</h3>
                      <p>{bookingResult.thongBao}</p>
                    </div>
                    <div className="uc30-confirmation-body">
                      <div className="uc30-confirmation-item"><span>Mã lịch khám</span><strong>{bookingResult.idLichKham}</strong></div>
                      <div className="uc30-confirmation-item"><span>Trạng thái</span><strong>{bookingResult.trangThai}</strong></div>
                      <div className="uc30-confirmation-item"><span>Bệnh nhân</span><strong>{bookingResult.hoTenBenhNhan}</strong></div>
                      <div className="uc30-confirmation-item"><span>Mã hồ sơ</span><strong>{bookingResult.idBenhNhan}</strong></div>
                      <div className="uc30-confirmation-item"><span>Bác sĩ</span><strong>{bookingResult.hoTenBacSi || bookingResult.maBacSi}</strong></div>
                      <div className="uc30-confirmation-item"><span>Ngày và giờ khám</span><strong>{formatDate(bookingResult.ngayKham)} · {formatTime(bookingResult.gioKham)}</strong></div>
                    </div>
                    <div style={{ padding: '0 20px 18px' }}>
                      <button type="button" className="uc30-btn uc30-btn--secondary" onClick={startNewBooking}>Tạo lịch khám khác</button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          <aside className="uc30-side-column">
            <section className="uc30-card">
              <header className="uc30-card-header">
                <div>
                  <h2>Quy trình đặt lịch</h2>
                  <p>Thực hiện lần lượt theo các bước dưới đây.</p>
                </div>
              </header>
              <div className="uc30-side-list">
                <div className="uc30-side-item">
                  <span className="uc30-side-icon">01</span>
                  <div><strong>Tìm đúng bệnh nhân</strong><p>Kiểm tra mã hồ sơ, họ tên và số điện thoại trước khi chọn.</p></div>
                </div>
                <div className="uc30-side-item">
                  <span className="uc30-side-icon">02</span>
                  <div><strong>Nhập bác sĩ và thời gian</strong><p>Nhập mã bác sĩ hợp lệ, chọn ngày và giờ khám trong tương lai.</p></div>
                </div>
                <div className="uc30-side-item">
                  <span className="uc30-side-icon">03</span>
                  <div><strong>Kiểm tra khung giờ</strong><p>Hệ thống kiểm tra xem bác sĩ đã có lịch tại ngày giờ đó chưa.</p></div>
                </div>
                <div className="uc30-side-item">
                  <span className="uc30-side-icon">04</span>
                  <div><strong>Xác nhận đặt lịch</strong><p>Backend sẽ kiểm tra lại khung giờ trước khi ghi nhận, tránh đặt trùng.</p></div>
                </div>
              </div>
            </section>
            <section className="uc30-card">
              <header className="uc30-card-header">
                <div>
                  <h2>Lưu ý nghiệp vụ</h2>
                  <p>Thông tin quan trọng khi đặt lịch tại quầy.</p>
                </div>
              </header>
              <div className="uc30-card-body">
                <div className="uc30-notice">
                  Mỗi lịch được lưu với phương thức <strong>TRUC_TIEP</strong> và trạng thái ban đầu <strong>DA_DAT</strong>. Nếu khung giờ vừa được người khác đặt, backend sẽ từ chối và yêu cầu chọn giờ khác.
                </div>
                <div className="uc30-notice">
                  Tìm hồ sơ bệnh nhân dùng endpoint tìm kiếm đã có sẵn trong project. Không sử dụng API của UC28, vì UC28 có branch riêng chưa chắc đã được merge.
                </div>
                {demo && <div className="uc30-notice">Ở chế độ xem thử, kết quả tìm kiếm, kiểm tra khung giờ và đặt lịch là dữ liệu giả. Trang này không gọi các API nghiệp vụ của UC30 và không lưu hồ sơ hay lịch khám thật.</div>}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
};
