import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Alert } from '../components/common/Alert';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { ReceptionLayout } from '../components/layout/ReceptionLayout';
import { BenhNhanTimKiem } from './BenhNhanTimKiem';
import { ngayHienTai } from './BenhNhanTaoMoi';
import { layBacSi, layKhungGio, datLichKhamTaiQuay, BookingApiError } from '../services/lichKhamDatTaiQuayService';
import type { BenhNhanTimKiemItem } from '../types/BenhNhanTimKiem';
import type { BacSiDatLich, KhungGioTrong, LichKhamDatTaiQuayResponse } from '../types/LichKhamDatTaiQuay';
import './lichKhamDatTaiQuay.css';

const errorMessage = (e: unknown) => e instanceof Error ? e.message : 'Không thể kết nối máy chủ, vui lòng thử lại.';
export function LichKhamDatTaiQuay() {
  const [patient, setPatient] = useState<BenhNhanTimKiemItem | null>(null);
  const [doctors, setDoctors] = useState<BacSiDatLich[]>([]);
  const [doctor, setDoctor] = useState(''); const [date, setDate] = useState(ngayHienTai());
  const [slots, setSlots] = useState<KhungGioTrong | null>(null); const [time, setTime] = useState('');
  const [doctorLoading, setDoctorLoading] = useState(true); const [slotLoading, setSlotLoading] = useState(false);
  const [doctorError, setDoctorError] = useState(''); const [slotError, setSlotError] = useState('');
  const [saveError, setSaveError] = useState(''); const [refreshDoctors, setRefreshDoctors] = useState(0);
  const [refreshSlots, setRefreshSlots] = useState(0); const [saving, setSaving] = useState(false);
  const savingRef = useRef(false); const [confirmed, setConfirmed] = useState(false);
  const [saved, setSaved] = useState<LichKhamDatTaiQuayResponse | null>(null);
  useEffect(() => {
    let active = true; setDoctorLoading(true); setDoctorError('');
    layBacSi().then(value => { if (active) setDoctors(value); })
      .catch(e => { if (active) setDoctorError(errorMessage(e)); }).finally(() => { if (active) setDoctorLoading(false); });
    return () => { active = false; };
  }, [refreshDoctors]);
  useEffect(() => {
    let active = true; setSlots(null); setTime(''); setConfirmed(false); setSlotError('');
    if (!doctor || !date || !patient || saved) { setSlotLoading(false); return; }
    setSlotLoading(true);
    layKhungGio(doctor, date).then(value => { if (active) setSlots(value); })
      .catch(e => { if (active) setSlotError(errorMessage(e)); }).finally(() => { if (active) setSlotLoading(false); });
    return () => { active = false; };
  }, [doctor, date, patient, refreshSlots, saved]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (savingRef.current || saved) return;
    if (!patient || !doctor || !time || !confirmed || slotLoading || !slots?.gioTrong.includes(time)) {
      setSaveError('Chọn bệnh nhân, bác sĩ, khung giờ và xác nhận thông tin trước khi đặt.'); return;
    }
    savingRef.current = true; setSaving(true); setSaveError('');
    try { setSaved(await datLichKhamTaiQuay({ idBenhNhan: patient.idBenhNhan, maBacSi: doctor, ngayKham: date, gioKham: time })); }
    catch (e) { setSaveError(errorMessage(e)); if (e instanceof BookingApiError && e.status === 409) setRefreshSlots(n => n + 1); }
    finally { savingRef.current = false; setSaving(false); }
  }
  const chosenDoctor = doctors.find(d => d.maBacSi === doctor);
  return <ReceptionLayout section="booking"><div className="uc30-page">
    {!patient ? <BenhNhanTimKiem embedded onSelectPatient={setPatient} /> : <>
      <div className="uc28-page-heading"><div><div className="uc28-eyebrow">ĐẶT LỊCH KHÁM TẠI QUẦY</div><h1>{saved ? 'Đặt lịch thành công' : 'Chọn bác sĩ và giờ khám'}</h1>
        <p>Lịch hẹn được lưu ở trạng thái Đã đặt; bệnh nhân chưa được tiếp nhận.</p></div>
        <Button variant="secondary" disabled={saving} onClick={() => { setPatient(null); setSaved(null); setSaveError(''); setDoctor(''); }}>Chọn bệnh nhân khác</Button></div>
      <Card className="uc30-card"><h2>{patient.hoTen}</h2><p>Mã hồ sơ: {patient.idBenhNhan}</p>
        <p>Ngày sinh: {patient.ngaySinh.split('-').reverse().join('/')} · SĐT: {patient.soDienThoai}</p></Card>
      {saved ? <Card className="uc30-card"><Alert title="Lịch hẹn đã được lưu" tone="success">{saved.thongBao}</Alert>
        <dl className="uc29-details"><div><dt>Mã lịch hẹn</dt><dd>{saved.idLichKham}</dd></div><div><dt>Bác sĩ</dt><dd>{saved.hoTenBacSi}</dd></div>
          <div><dt>Ngày khám</dt><dd>{saved.ngayKham.split('-').reverse().join('/')}</dd></div><div><dt>Giờ khám</dt><dd>{saved.gioKham.slice(0, 5)}</dd></div></dl>
        <p className="uc29-note">Đã đặt · Đặt tại quầy. SMS xác nhận chưa được tích hợp; hãy thông báo lịch hẹn cho bệnh nhân.</p>
        <Button onClick={() => { setSaved(null); setSaveError(''); setDoctor(''); }}>Đặt lịch khác</Button>
      </Card> : <Card className="uc30-card"><form onSubmit={submit} noValidate>
        {saveError && <Alert title="Không thể đặt lịch" tone="error">{saveError}</Alert>}
        <fieldset disabled={saving} className="uc29-fields">
          {doctorLoading ? <p role="status">Đang tải danh sách bác sĩ...</p> : doctorError ? <><Alert title="Lỗi tải bác sĩ" tone="error">{doctorError}</Alert>
            <Button variant="secondary" onClick={() => setRefreshDoctors(n => n + 1)}>Thử tải lại bác sĩ</Button></> : doctors.length === 0 ? <Alert title="Chưa có bác sĩ" tone="warning">Chưa có bác sĩ được cấu hình.</Alert> :
            <div className="uc29-form-grid"><div className="mc-field"><label className="mc-label" htmlFor="uc30-doctor">Bác sĩ *</label>
              <select id="uc30-doctor" className="mc-input" value={doctor} onChange={e => { setDoctor(e.target.value); setTime(''); setSlots(null); setConfirmed(false); setSaveError(''); }}>
                <option value="">Chọn bác sĩ</option>{doctors.map(d => <option key={d.maBacSi} value={d.maBacSi}>{d.hoTen} — {d.chuyenKhoa}</option>)}</select></div>
              <Input id="uc30-date" label="Ngày khám" type="date" required min={ngayHienTai()} value={date}
                onChange={e => { setDate(e.target.value); setTime(''); setSlots(null); setConfirmed(false); setSaveError(''); }} /></div>}
          <h2>Khung giờ còn trống</h2>
          <p>Giờ làm việc 07:00–16:00, mỗi lượt khám 10 phút. Giờ bắt đầu cuối là 15:50.</p>
          {slotLoading ? <p role="status">Đang tải khung giờ...</p> : slotError ? <><Alert title="Lỗi tải khung giờ" tone="error">{slotError}</Alert>
            <Button variant="secondary" onClick={() => setRefreshSlots(n => n + 1)}>Thử tải lại khung giờ</Button></> : !slots ? <p>Chọn bác sĩ và ngày khám để xem giờ trống.</p> : slots.gioTrong.length === 0 ?
            <><Alert title="Không còn giờ trống" tone="warning">Không có khung giờ khả dụng trong ngày này. Chọn ngày khác hoặc bác sĩ khác.</Alert>
              {slots.ngayGoiY.length > 0 && <div className="uc30-slot-grid" aria-label="Ngày còn giờ trống">{slots.ngayGoiY.map(day =>
                <Button key={day} variant="secondary" onClick={() => { setDate(day); setTime(''); setConfirmed(false); }}>{day.split('-').reverse().join('/')}</Button>)}</div>}</> :
            <div className="uc30-slot-grid" aria-label="Giờ khám còn trống">{slots.gioTrong.map(t => <Button key={t} variant={time === t ? 'primary' : 'secondary'}
              aria-pressed={time === t} onClick={() => { setTime(t); setConfirmed(false); setSaveError(''); }}>{t.slice(0, 5)}</Button>)}</div>}
          {time && <div className="uc30-confirmation"><p>{patient.hoTen} · {chosenDoctor?.hoTen} · {date.split('-').reverse().join('/')} · {time.slice(0, 5)}</p>
            <label><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} /> Tôi đã xác nhận thông tin lịch hẹn với bệnh nhân</label></div>}
        </fieldset>
        <div className="uc29-actions"><Button type="submit" loading={saving} loadingText="Đang đặt lịch..." disabled={!confirmed || !time || slotLoading || Boolean(slotError) || doctorLoading}>Xác nhận đặt lịch</Button></div>
      </form></Card>}
    </>}
  </div></ReceptionLayout>;
}
