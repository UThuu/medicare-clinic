import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { taoHoSoBenhNhanMoi } from '../services/benhNhanTaoMoiService';
import type {
  BenhNhanTaoMoiRequest,
  BenhNhanTaoMoiResponse,
  GioiTinhBenhNhan,
} from '../types/BenhNhanTaoMoi';
import './benhNhanTaoMoi.css';

interface BenhNhanTaoMoiProps {
  /** Chỉ dành cho route dev: minh họa giao diện, không gọi API hoặc ghi dữ liệu. */
  demoMode?: boolean;
}

type FormErrors = Partial<Record<keyof BenhNhanTaoMoiRequest, string>>;

const initialForm: BenhNhanTaoMoiRequest = {
  hoTen: '',
  ngaySinh: '',
  gioiTinh: 'NAM',
  soDienThoai: '',
  diaChi: '',
};

function layNgayHienTai(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function dinhDangNgay(value: string): string {
  if (!value) return '—';
  const parts = value.split('-');
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : value;
}

function kiemTraForm(form: BenhNhanTaoMoiRequest): FormErrors {
  const errors: FormErrors = {};
  if (!form.hoTen.trim()) errors.hoTen = 'Vui lòng nhập họ tên bệnh nhân.';
  if (!form.ngaySinh) {
    errors.ngaySinh = 'Vui lòng chọn ngày sinh.';
  } else if (form.ngaySinh > layNgayHienTai()) {
    errors.ngaySinh = 'Ngày sinh không thể ở tương lai.';
  }
  if (!form.gioiTinh) errors.gioiTinh = 'Vui lòng chọn giới tính.';
  if (!form.soDienThoai.trim()) {
    errors.soDienThoai = 'Vui lòng nhập số điện thoại.';
  } else if (!/^[0-9+() .-]{8,20}$/.test(form.soDienThoai.trim())) {
    errors.soDienThoai = 'Số điện thoại phải dài 8–20 ký tự và chỉ gồm chữ số hoặc + ( ) . -.';
  }
  return errors;
}

export const BenhNhanTaoMoi: React.FC<BenhNhanTaoMoiProps> = ({ demoMode = false }) => {
  const navigate = useNavigate();
  const [form, setForm] = React.useState<BenhNhanTaoMoiRequest>({ ...initialForm });
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<BenhNhanTaoMoiResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const updateField = <K extends keyof BenhNhanTaoMoiRequest>(
    field: K,
    value: BenhNhanTaoMoiRequest[K],
  ) => {
    setForm((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
    setSubmitError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = kiemTraForm(form);
    setErrors(validationErrors);
    setSubmitError(null);
    setResult(null);
    if (Object.keys(validationErrors).length > 0) return;

    const request: BenhNhanTaoMoiRequest = {
      hoTen: form.hoTen.trim(),
      ngaySinh: form.ngaySinh,
      gioiTinh: form.gioiTinh,
      soDienThoai: form.soDienThoai.trim(),
      diaChi: form.diaChi?.trim() || undefined,
    };

    setIsSubmitting(true);
    try {
      if (demoMode) {
        // Chỉ hiển thị luồng thành công minh họa; không gọi API và không lưu dữ liệu.
        setResult({
          thongBao: 'Minh họa: hồ sơ sẽ được tạo khi sử dụng chức năng thật.',
          idBenhNhan: 'BN-DEMO-UC29',
          ...request,
          diaChi: request.diaChi ?? null,
        });
      } else {
        setResult(await taoHoSoBenhNhanMoi(request));
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({ ...initialForm });
    setErrors({});
    setSubmitError(null);
    setResult(null);
  };

  return (
    <main className="bn-create-page">
      <div className="bn-create-shell">
        <header className="bn-create-header">
          <div className="bn-create-header__icon" aria-hidden="true">+</div>
          <div>
            <div className="bn-create-eyebrow">HỒ SƠ BỆNH NHÂN / UC29</div>
            <h1>Tạo hồ sơ bệnh nhân mới</h1>
            <p>Nhập thông tin cơ bản để đăng ký hồ sơ bệnh nhân vào hệ thống.</p>
          </div>
        </header>

        {demoMode && (
          <div className="bn-create-demo-note" role="status">
            <strong>Chế độ xem thử giao diện.</strong> Dữ liệu chỉ dùng để minh họa, không gửi đến backend và không được lưu.
          </div>
        )}

        {result ? (
          <section className="bn-create-result" aria-live="polite">
            <div className="bn-create-result__check" aria-hidden="true">✓</div>
            <div className="bn-create-result__content">
              <p className="bn-create-result__eyebrow">{demoMode ? 'XEM THỬ HOÀN TẤT' : 'TẠO HỒ SƠ THÀNH CÔNG'}</p>
              <h2>{result.thongBao}</h2>
              <p className="bn-create-result__id">Mã hồ sơ: <strong>{result.idBenhNhan}</strong></p>
              <dl className="bn-create-result__details">
                <div><dt>Họ tên</dt><dd>{result.hoTen}</dd></div>
                <div><dt>Ngày sinh</dt><dd>{dinhDangNgay(result.ngaySinh)}</dd></div>
                <div><dt>Giới tính</dt><dd>{result.gioiTinh === 'NAM' ? 'Nam' : 'Nữ'}</dd></div>
                <div><dt>Số điện thoại</dt><dd>{result.soDienThoai}</dd></div>
                <div className="bn-create-result__address"><dt>Địa chỉ</dt><dd>{result.diaChi || 'Chưa cung cấp'}</dd></div>
              </dl>
              <div className="bn-create-result__actions">
                <Button onClick={resetForm}>Tạo hồ sơ khác</Button>
                {!demoMode && <Button variant="secondary" onClick={() => navigate('/staff')}>Về trang nhân viên</Button>}
              </div>
            </div>
          </section>
        ) : (
          <form className="bn-create-card" onSubmit={handleSubmit} noValidate>
            <div className="bn-create-card__top">
              <div>
                <h2>Thông tin bệnh nhân</h2>
                <p>Các trường có dấu <span className="bn-create-required">*</span> là bắt buộc.</p>
              </div>
              <span className="bn-create-card__tag">HỒ SƠ MỚI</span>
            </div>

            {submitError && (
              <div className="bn-create-alert bn-create-alert--error" role="alert">
                <span aria-hidden="true">!</span><p>{submitError}</p>
              </div>
            )}

            <div className="bn-create-form-grid">
              <div className="bn-create-field bn-create-field--wide">
                <label htmlFor="bn-ho-ten">Họ và tên <span className="bn-create-required">*</span></label>
                <input
                  id="bn-ho-ten"
                  type="text"
                  autoComplete="name"
                  maxLength={150}
                  placeholder="Nhập họ tên đầy đủ"
                  value={form.hoTen}
                  onChange={(event) => updateField('hoTen', event.target.value)}
                  aria-invalid={Boolean(errors.hoTen)}
                  aria-describedby={errors.hoTen ? 'bn-ho-ten-error' : undefined}
                />
                {errors.hoTen && <span className="bn-create-field__error" id="bn-ho-ten-error">{errors.hoTen}</span>}
              </div>

              <div className="bn-create-field">
                <label htmlFor="bn-ngay-sinh">Ngày sinh <span className="bn-create-required">*</span></label>
                <input
                  id="bn-ngay-sinh"
                  type="date"
                  max={layNgayHienTai()}
                  value={form.ngaySinh}
                  onChange={(event) => updateField('ngaySinh', event.target.value)}
                  aria-invalid={Boolean(errors.ngaySinh)}
                  aria-describedby={errors.ngaySinh ? 'bn-ngay-sinh-error' : undefined}
                />
                {errors.ngaySinh && <span className="bn-create-field__error" id="bn-ngay-sinh-error">{errors.ngaySinh}</span>}
              </div>

              <div className="bn-create-field">
                <label htmlFor="bn-gioi-tinh">Giới tính <span className="bn-create-required">*</span></label>
                <select
                  id="bn-gioi-tinh"
                  value={form.gioiTinh}
                  onChange={(event) => updateField('gioiTinh', event.target.value as GioiTinhBenhNhan)}
                  aria-invalid={Boolean(errors.gioiTinh)}
                  aria-describedby={errors.gioiTinh ? 'bn-gioi-tinh-error' : undefined}
                >
                  <option value="NAM">Nam</option>
                  <option value="NU">Nữ</option>
                </select>
                {errors.gioiTinh && <span className="bn-create-field__error" id="bn-gioi-tinh-error">{errors.gioiTinh}</span>}
              </div>

              <div className="bn-create-field bn-create-field--wide">
                <label htmlFor="bn-so-dien-thoai">Số điện thoại <span className="bn-create-required">*</span></label>
                <input
                  id="bn-so-dien-thoai"
                  type="tel"
                  autoComplete="tel"
                  maxLength={20}
                  inputMode="tel"
                  placeholder="Ví dụ: 0901234567"
                  value={form.soDienThoai}
                  onChange={(event) => updateField('soDienThoai', event.target.value)}
                  aria-invalid={Boolean(errors.soDienThoai)}
                  aria-describedby={errors.soDienThoai ? 'bn-so-dien-thoai-error' : 'bn-phone-help'}
                />
                {errors.soDienThoai
                  ? <span className="bn-create-field__error" id="bn-so-dien-thoai-error">{errors.soDienThoai}</span>
                  : <span className="bn-create-field__help" id="bn-phone-help">Nhập từ 8 đến 20 ký tự theo định dạng được hỗ trợ.</span>}
              </div>

              <div className="bn-create-field bn-create-field--wide">
                <label htmlFor="bn-dia-chi">Địa chỉ <span className="bn-create-optional">Không bắt buộc</span></label>
                <textarea
                  id="bn-dia-chi"
                  rows={3}
                  maxLength={500}
                  autoComplete="street-address"
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  value={form.diaChi ?? ''}
                  onChange={(event) => updateField('diaChi', event.target.value)}
                />
              </div>
            </div>

            <div className="bn-create-card__footer">
              <span className="bn-create-footer-note"><span className="bn-create-required">*</span> Vui lòng kiểm tra thông tin trước khi tạo hồ sơ.</span>
              <div className="bn-create-actions">
                <Button variant="secondary" onClick={resetForm} disabled={isSubmitting}>Xóa nội dung</Button>
                <Button type="submit" loading={isSubmitting} loadingText="Đang tạo hồ sơ...">Tạo hồ sơ bệnh nhân</Button>
              </div>
            </div>
          </form>
        )}

        <footer className="bn-create-page__footer">
          <span>MEDICARE CLINIC</span>
          <span>Thông tin bệnh nhân cần được nhập chính xác và bảo mật.</span>
        </footer>
      </div>
    </main>
  );
};
