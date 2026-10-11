import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Alert } from '../components/common/Alert';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Textarea } from '../components/common/Textarea';
import { taoHoSoBenhNhanMoi, kiemTraSoDienThoai } from '../services/benhNhanTaoMoiService';
import type { BenhNhanTaoMoiRequest, BenhNhanTaoMoiResponse } from '../types/BenhNhanTaoMoi';
import './benhNhanTaoMoi.css';
import { Table, type TableColumn } from '../components/common/Table';
import type { BenhNhanTimKiemItem } from '../types/BenhNhanTimKiem';

type FormErrors = Partial<Record<keyof BenhNhanTaoMoiRequest, string>>;
interface Props {
  initialValues?: Partial<BenhNhanTaoMoiRequest>;
  onBack: () => void;
  onSaved: (patient: BenhNhanTaoMoiResponse) => void;
  onSelectExisting?: (patient: BenhNhanTimKiemItem) => void;
}
export function ngayHienTai(): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date());
  return ['year', 'month', 'day'].map(type => parts.find(part => part.type === type)?.value).join('-');
}
export function kiemTraForm(form: BenhNhanTaoMoiRequest): FormErrors {
  const errors: FormErrors = {};
  if (!form.hoTen.trim()) errors.hoTen = 'Vui lòng nhập họ tên bệnh nhân.';
  else if (form.hoTen.trim().length > 100) errors.hoTen = 'Họ tên không được vượt quá 100 ký tự.';
  if (!form.ngaySinh) errors.ngaySinh = 'Vui lòng chọn ngày sinh.';
  else if (!/^\d{4}-\d{2}-\d{2}$/.test(form.ngaySinh) ||
    !Number.isFinite(Date.parse(form.ngaySinh)) ||
    new Date(form.ngaySinh).toISOString().slice(0, 10) !== form.ngaySinh ||
    form.ngaySinh < '1000-01-01' || form.ngaySinh > ngayHienTai())
    errors.ngaySinh = 'Ngày sinh phải hợp lệ, từ năm 1000 đến ngày hiện tại.';
  if (!['NAM', 'NU'].includes(form.gioiTinh)) errors.gioiTinh = 'Vui lòng chọn giới tính.';
  const phone = form.soDienThoai.trim();
  if (!phone) errors.soDienThoai = 'Vui lòng nhập số điện thoại.';
  else if (phone.length > 20 || !/^[0-9+() .-]+$/.test(phone) ||
    !/^\+?[0-9]{8,20}$/.test(phone.replace(/[() .-]/g, '')))
    errors.soDienThoai = 'Số điện thoại phải có 8–20 chữ số, có thể bắt đầu bằng +.';
  if ((form.diaChi || '').trim().length > 255) errors.diaChi = 'Địa chỉ không được vượt quá 255 ký tự.';
  return errors;
}

export function trungThongTinBenhNhan(patient: BenhNhanTimKiemItem, form: BenhNhanTaoMoiRequest): boolean {
  const name = (value: string) => value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('vi');
  const phone = (value: string) => value.trim().replace(/[() .-]/g, '');
  return name(patient.hoTen) === name(form.hoTen) && patient.ngaySinh === form.ngaySinh
    && phone(patient.soDienThoai) === phone(form.soDienThoai);
}

export function BenhNhanTaoMoi({ initialValues, onBack, onSaved, onSelectExisting }: Props) {
  const [form, setForm] = useState<BenhNhanTaoMoiRequest>({
    hoTen: '', ngaySinh: '', gioiTinh: 'NAM', soDienThoai: '', diaChi: '', ...initialValues,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState('');
  const [result, setResult] = useState<BenhNhanTaoMoiResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitting = useRef(false);
  const [phoneMatches, setPhoneMatches] = useState<BenhNhanTimKiemItem[]>([]);
  const [checkedPhone, setCheckedPhone] = useState('');
  const [checkingPhone, setCheckingPhone] = useState(false);
  const [phoneCheckError, setPhoneCheckError] = useState('');
  const [retryCheck, setRetryCheck] = useState(0);
  const [confirmedDuplicate, setConfirmedDuplicate] = useState(false);
  const identityMatches = phoneMatches.filter(patient => trungThongTinBenhNhan(patient, form));
  const normalizedPhone = form.soDienThoai.trim().replace(/[() .-]/g, '');
  const validPhone = !kiemTraForm(form).soDienThoai;
  const currentPhone = useRef(normalizedPhone);
  currentPhone.current = normalizedPhone;
  useEffect(() => {
    let active = true;
    setPhoneMatches([]); setCheckedPhone(''); setPhoneCheckError('');
    if (!validPhone || result) { setCheckingPhone(false); return; }
    setCheckingPhone(true);
    const timer = setTimeout(async () => {
      try {
        const checked = await kiemTraSoDienThoai(form.soDienThoai);
        if (active && currentPhone.current === normalizedPhone) {
          setPhoneMatches(checked.danhSachBenhNhan); setCheckedPhone(normalizedPhone);
        }
      } catch (error) {
        if (active) setPhoneCheckError(error instanceof Error ? error.message : 'Không thể kiểm tra số điện thoại.');
      } finally { if (active) setCheckingPhone(false); }
    }, 350);
    return () => { active = false; clearTimeout(timer); };
  }, [form.soDienThoai, normalizedPhone, validPhone, retryCheck, result]);
  const columns: TableColumn<BenhNhanTimKiemItem>[] = [
    { key: 'idBenhNhan', header: 'Mã hồ sơ' },
    { key: 'hoTen', header: 'Họ và tên' },
    { key: 'ngaySinh', header: 'Ngày sinh', render: p => p.ngaySinh.split('-').reverse().join('/') },
    { key: 'gioiTinh', header: 'Giới tính', render: p => p.gioiTinh === 'NAM' ? 'Nam' : 'Nữ' },
    { key: 'soDienThoai', header: 'Số điện thoại' },
    ...(onSelectExisting ? [{ key: 'actions', header: 'Thao tác', render: (patient: BenhNhanTimKiemItem) => (
      <Button type="button" size="sm" variant="secondary" disabled={isSubmitting}
        onClick={() => onSelectExisting(patient)}>Chọn hồ sơ này</Button>
    ) }] : []),
  ];
  const updateField = <K extends keyof BenhNhanTaoMoiRequest>(field: K, value: BenhNhanTaoMoiRequest[K]) => {
    setForm(previous => ({ ...previous, [field]: value }));
    setErrors(previous => ({ ...previous, [field]: undefined }));
    setSubmitError('');
    if (['hoTen', 'ngaySinh', 'soDienThoai'].includes(field)) setConfirmedDuplicate(false);
    if (field === 'soDienThoai' && value !== form.soDienThoai) {
      setPhoneMatches([]); setCheckedPhone(''); setPhoneCheckError('');
      setCheckingPhone(!kiemTraForm({ ...form, soDienThoai: value as string }).soDienThoai);
    }
  };
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting.current || result) return;
    const validation = kiemTraForm(form);
    setErrors(validation); setSubmitError('');
    if (Object.keys(validation).length) return;
    submitting.current = true; setIsSubmitting(true);
    try {
      let matches = phoneMatches;
      if (checkedPhone !== normalizedPhone || phoneCheckError) {
        const checked = await kiemTraSoDienThoai(form.soDienThoai);
        matches = checked.danhSachBenhNhan;
        setPhoneMatches(matches); setCheckedPhone(normalizedPhone); setPhoneCheckError('');
      }
      if (matches.some(patient => trungThongTinBenhNhan(patient, form)) && !confirmedDuplicate) {
        setSubmitError('Hãy chọn hồ sơ hiện có hoặc xác nhận tạo mới khi trùng họ tên, ngày sinh và SĐT.');
        return;
      }
      const saved = await taoHoSoBenhNhanMoi({
        ...form, hoTen: form.hoTen.trim(), soDienThoai: form.soDienThoai.trim(),
        diaChi: form.diaChi?.trim() || undefined, xacNhanTaoMoi: confirmedDuplicate,
      });
      setResult(saved); onSaved(saved);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Không thể tạo hồ sơ. Vui lòng thử lại.');
      // Refresh identities if another receptionist created the same profile after the lookup.
      if (error instanceof Error && error.message.includes('trùng họ tên')) {
        setConfirmedDuplicate(false); setRetryCheck(value => value + 1);
      }
    } finally {
      submitting.current = false; setIsSubmitting(false);
    }
  };
  const dateLabel = (date: string) => date.split('-').reverse().join('/');
  return (
    <div className="uc29-page">
      <div className="uc28-page-heading">
        <div><div className="uc28-eyebrow">TIẾP NHẬN BỆNH NHÂN · BƯỚC 2</div>
          <h1>Tạo hồ sơ bệnh nhân</h1>
          <p>Đăng ký hồ sơ mới; bệnh nhân có thể dùng số điện thoại của người giám hộ.</p>
        </div>
        <Button variant="secondary" onClick={onBack} disabled={isSubmitting}>Quay lại tìm hồ sơ</Button>
      </div>
      <div className="mc-reception-steps" aria-label="Các bước tiếp nhận">
        <button type="button" onClick={onBack} disabled={isSubmitting}>1. Tìm hồ sơ<small>Đối chiếu thông tin</small></button>
        <span aria-current="step">2. Tạo hồ sơ bệnh nhân<small>{result ? 'Đã lưu hồ sơ' : 'Đang thực hiện'}</small></span>
        <button type="button" disabled>3. Xác nhận tiếp nhận<small>Chưa khả dụng</small></button>
      </div>
      {result ? (
        <Card className="uc29-card">
          <Alert title="Tạo hồ sơ thành công" tone="success">{result.thongBao}</Alert>
          <div className="uc29-result-heading"><h2>{result.hoTen}</h2><p>Mã hồ sơ: <strong>{result.idBenhNhan}</strong></p></div>
          <dl className="uc29-details">
            <div><dt>Ngày sinh</dt><dd>{dateLabel(result.ngaySinh)}</dd></div>
            <div><dt>Giới tính</dt><dd>{result.gioiTinh === 'NAM' ? 'Nam' : 'Nữ'}</dd></div>
            <div><dt>Số điện thoại</dt><dd>{result.soDienThoai}</dd></div>
            <div><dt>Địa chỉ</dt><dd>{result.diaChi || 'Chưa cung cấp'}</dd></div>
          </dl>
          <div className="uc29-actions"><Button onClick={onBack}>Xem hồ sơ trong kết quả tìm kiếm</Button></div>
          <p className="uc29-note">Hồ sơ đã được lưu. Bước xác nhận tiếp nhận chưa khả dụng.</p>
        </Card>
      ) : (
        <Card className="uc29-card">
          <div className="uc28-section-heading"><div><h2>Thông tin bệnh nhân</h2>
            <p>Các trường có dấu * là bắt buộc. Có thể dùng chung số điện thoại của người giám hộ.</p>
          </div><span className="uc28-step-label">BƯỚC 2</span></div>
          {submitError && <Alert title="Không thể lưu hồ sơ" tone="error">{submitError}</Alert>}
          <form onSubmit={handleSubmit} noValidate aria-busy={isSubmitting}>
            <fieldset disabled={isSubmitting} className="uc29-fields">
              <div className="uc29-form-grid">
                <Input id="bn-ho-ten" label="Họ và tên" required autoComplete="name" maxLength={100}
                  placeholder="Nhập họ tên đầy đủ" value={form.hoTen}
                  onChange={event => updateField('hoTen', event.target.value)} errorText={errors.hoTen} />
                <Input id="bn-ngay-sinh" label="Ngày sinh" required type="date" min="1000-01-01" max={ngayHienTai()}
                  value={form.ngaySinh} onChange={event => updateField('ngaySinh', event.target.value)} errorText={errors.ngaySinh} />
                <div className="mc-field"><label className="mc-label" htmlFor="bn-gioi-tinh">Giới tính <span className="mc-required">*</span></label>
                  <select id="bn-gioi-tinh" className="mc-input" value={form.gioiTinh}
                    onChange={event => updateField('gioiTinh', event.target.value as BenhNhanTaoMoiRequest['gioiTinh'])}
                    aria-invalid={Boolean(errors.gioiTinh)}>
                    <option value="NAM">Nam</option><option value="NU">Nữ</option>
                  </select>
                  {errors.gioiTinh && <span className="mc-helper mc-helper--error">{errors.gioiTinh}</span>}
                </div>
                <Input id="bn-so-dien-thoai" label="Số điện thoại" required type="tel" autoComplete="tel" maxLength={20}
                  placeholder="Nhập số điện thoại bệnh nhân" value={form.soDienThoai}
                  onChange={event => updateField('soDienThoai', event.target.value)} errorText={errors.soDienThoai}
                  helperText="Có thể dùng dấu cách, ( ), . hoặc - để phân cách chữ số." />
                <div className="uc29-wide"><Textarea id="bn-dia-chi" label="Địa chỉ (không bắt buộc)" rows={3}
                  autoComplete="street-address" maxLength={255} value={form.diaChi || ''}
                  onChange={event => updateField('diaChi', event.target.value)} errorText={errors.diaChi}
                  placeholder="Nhập địa chỉ bệnh nhân" /></div>
              </div>
            </fieldset>
            {checkingPhone && <p className="uc29-note" role="status">Đang kiểm tra số điện thoại...</p>}
            {phoneCheckError && <div className="uc29-phone-check">
              <Alert title="Chưa kiểm tra được số điện thoại" tone="error">{phoneCheckError}</Alert>
              <Button variant="secondary" onClick={() => setRetryCheck(value => value + 1)} disabled={isSubmitting}>Thử kiểm tra lại</Button>
            </div>}
            {phoneMatches.length > 0 && <section className="uc29-phone-check" aria-label="Hồ sơ dùng chung số điện thoại">
              <Alert title="Số điện thoại đã tồn tại" tone="warning">
                Có {phoneMatches.length} hồ sơ dùng số này. Hãy đối chiếu họ tên và ngày sinh bên dưới.
                Nếu là bệnh nhân khác, bạn vẫn có thể lưu hồ sơ mới với số điện thoại người giám hộ.
              </Alert>
              <div className="uc29-shared-records"><Table columns={columns} data={phoneMatches}
                rowKey={patient => patient.idBenhNhan} caption="Các hồ sơ có cùng số điện thoại" /></div>
            </section>}
            {identityMatches.length > 0 && <div className="uc29-phone-check">
              <Alert title="Hồ sơ có thể đã tồn tại" tone="warning">
                Có hồ sơ trùng họ tên, ngày sinh và SĐT. Chọn hồ sơ hiện có trong bảng hoặc xác nhận tạo hồ sơ mới.
              </Alert>
              <label><input type="checkbox" checked={confirmedDuplicate} disabled={isSubmitting}
                onChange={event => { setConfirmedDuplicate(event.target.checked); setSubmitError(''); }} />{' '}
                Tôi đã đối chiếu hồ sơ hiện có và xác nhận tạo hồ sơ mới
              </label>
            </div>}
            <div className="uc29-actions">
              <Button variant="secondary" onClick={onBack} disabled={isSubmitting}>Hủy</Button>
              <Button type="submit" loading={isSubmitting} loadingText="Đang lưu hồ sơ..."
                disabled={checkingPhone || Boolean(phoneCheckError) || (identityMatches.length > 0 && !confirmedDuplicate)}>{phoneMatches.length ? 'Lưu hồ sơ mới với SĐT này' : 'Lưu hồ sơ'}</Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
