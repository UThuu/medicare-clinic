import { useMemo, useState, type FormEvent } from 'react';
import { Alert } from '../components/common/Alert';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Table, type TableColumn } from '../components/common/Table';
import { ReceptionLayout } from '../components/layout/ReceptionLayout';
import { timKiemHoSoBenhNhan } from '../services/benhNhanTimKiemService';
import type {
  BenhNhanTimKiemItem,
  BenhNhanTimKiemRequest,
  BenhNhanTimKiemResponse,
} from '../types/BenhNhanTimKiem';
import './benhNhanTimKiem.css';
import { BenhNhanTaoMoi } from './BenhNhanTaoMoi';
import type { BenhNhanTaoMoiRequest, BenhNhanTaoMoiResponse } from '../types/BenhNhanTaoMoi';

type KieuTimKiem = 'phone' | 'nameDob';

function dinhDangNgay(ngay?: string | null): string {
  if (!ngay) return '—';
  const parts = ngay.split('-');
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : ngay;
}

function hienThiGioiTinh(gioiTinh?: string | null): string {
  if (gioiTinh === 'NAM') return 'Nam';
  if (gioiTinh === 'NU') return 'Nữ';
  return 'Chưa cập nhật';
}

function ngayHienTaiISO(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function layLoiValidation(
  mode: KieuTimKiem,
  soDienThoai: string,
  hoTen: string,
  ngaySinh: string,
): string | null {
  if (mode === 'phone') {
    if (!soDienThoai.trim()) return 'Vui lòng nhập số điện thoại cần tìm.';
    if (!/^(?=.*[0-9])[0-9+() .-]{8,20}$/.test(soDienThoai.trim())) {
      return 'Số điện thoại cần có từ 8 đến 20 ký tự và chỉ gồm chữ số hoặc ký tự + ( ) . -.';
    }
    return null;
  }

  if (!hoTen.trim()) return 'Vui lòng nhập họ tên bệnh nhân.';
  if (hoTen.trim().length > 100) return 'Họ tên không được vượt quá 100 ký tự.';
  if (!ngaySinh) return 'Vui lòng chọn ngày sinh để thu hẹp kết quả tìm kiếm.';
  if (ngaySinh > ngayHienTaiISO()) return 'Ngày sinh không thể ở tương lai.';
  return null;
}

export function BenhNhanTimKiem() {
  const [kieuTimKiem, setKieuTimKiem] = useState<KieuTimKiem>('phone');
  const [soDienThoai, setSoDienThoai] = useState('');
  const [hoTen, setHoTen] = useState('');
  const [ngaySinh, setNgaySinh] = useState('');
  const [ketQua, setKetQua] = useState<BenhNhanTimKiemResponse | null>(null);
  const [benhNhanDangXem, setBenhNhanDangXem] = useState<BenhNhanTimKiemItem | null>(null);
  const [loi, setLoi] = useState('');
  const [dangTim, setDangTim] = useState(false);
  const [taoMoi, setTaoMoi] = useState(false);
  const [thongTinTim, setThongTinTim] = useState<Partial<BenhNhanTaoMoiRequest>>({});

  const columns: TableColumn<BenhNhanTimKiemItem>[] = useMemo(() => [
    {
      key: 'idBenhNhan',
      header: 'Mã hồ sơ',
      width: '150px',
      render: (benhNhan) => <span className="uc28-record-id">{benhNhan.idBenhNhan}</span>,
    },
    {
      key: 'hoTen',
      header: 'Họ và tên',
      render: (benhNhan) => <span className="uc28-patient-name">{benhNhan.hoTen || '—'}</span>,
    },
    { key: 'ngaySinh', header: 'Ngày sinh', width: '115px', render: (bn) => dinhDangNgay(bn.ngaySinh) },
    { key: 'gioiTinh', header: 'Giới tính', width: '90px', render: (bn) => hienThiGioiTinh(bn.gioiTinh) },
    { key: 'soDienThoai', header: 'Số điện thoại', width: '135px', render: (bn) => bn.soDienThoai || '—' },
    {
      key: 'actions',
      header: 'Thao tác',
      width: '125px',
      render: (bn) => (
        <Button type="button" size="sm" variant="secondary" onClick={() => setBenhNhanDangXem(bn)}>
          Xem thông tin
        </Button>
      ),
    },
  ], []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoi('');
    setBenhNhanDangXem(null);
    setKetQua(null);

    const validationMessage = layLoiValidation(kieuTimKiem, soDienThoai, hoTen, ngaySinh);
    if (validationMessage) {
      setLoi(validationMessage);
      return;
    }

    const request: BenhNhanTimKiemRequest = kieuTimKiem === 'phone'
      ? { soDienThoai: soDienThoai.trim() }
      : { hoTen: hoTen.trim(), ngaySinh };

    try {
      setDangTim(true);
      const response = await timKiemHoSoBenhNhan(request);
      setKetQua(response);
    } catch (error) {
      setKetQua(null);
      setLoi(error instanceof Error ? error.message : 'Không thể tìm kiếm hồ sơ bệnh nhân.');
    } finally {
      setDangTim(false);
    }
  };

  const handleReset = () => {
    setSoDienThoai('');
    setHoTen('');
    setNgaySinh('');
    setKieuTimKiem('phone');
    setKetQua(null);
    setLoi('');
    setBenhNhanDangXem(null);
  };

  const openCreate = () => {
    setThongTinTim(kieuTimKiem === 'phone' ? { soDienThoai: soDienThoai.trim() } : { hoTen: hoTen.trim(), ngaySinh });
    setTaoMoi(true);
  };
  const handleSaved = (patient: BenhNhanTaoMoiResponse) => {
    setKetQua({ thongBao: patient.thongBao, tongSoKetQua: 1, danhSachBenhNhan: [patient] });
    setSoDienThoai(patient.soDienThoai); setKieuTimKiem('phone'); setLoi('');
  };
  if (taoMoi) return (
    <ReceptionLayout section="reception">
      <BenhNhanTaoMoi initialValues={thongTinTim} onBack={() => setTaoMoi(false)} onSaved={handleSaved}
        onSelectExisting={patient => {
          setKetQua({ thongBao: 'Đã chọn hồ sơ hiện có.', tongSoKetQua: 1, danhSachBenhNhan: [patient] });
          setSoDienThoai(patient.soDienThoai); setKieuTimKiem('phone'); setLoi('');
          setBenhNhanDangXem(patient); setTaoMoi(false);
        }} />
    </ReceptionLayout>
  );

  const mainContent = (
    <div className="uc28-page">
      <div className="uc28-page-heading">
        <div>
          <div className="uc28-eyebrow">TIẾP NHẬN BỆNH NHÂN · BƯỚC 1</div>
          <h1>Tìm kiếm hồ sơ bệnh nhân</h1>
          <p>Tìm hồ sơ hiện có để bắt đầu quy trình tiếp nhận.</p>
        </div>
        <Button onClick={openCreate} disabled={dangTim}>Tạo hồ sơ</Button>
      </div>

      <div className="mc-reception-steps" aria-label="Các bước tiếp nhận">
        <span aria-current="step">1. Tìm hồ sơ<small>Đang khả dụng</small></span>
        <button type="button" disabled={dangTim} onClick={openCreate}>2. Tạo hồ sơ bệnh nhân<small>Đang khả dụng</small></button>
        <button type="button" disabled>3. Xác nhận tiếp nhận<small>Chưa khả dụng</small></button>
      </div>
      <Card className="uc28-search-card">
        <div className="uc28-section-heading">
          <div>
            <h2>Điều kiện tìm kiếm</h2>
            <p>Chọn một trong hai cách tìm kiếm theo quy tắc nghiệp vụ.</p>
          </div>
          <span className="uc28-step-label">BƯỚC 1</span>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="uc28-search-methods" role="radiogroup" aria-label="Phương thức tìm kiếm">
            <button
              type="button"
              role="radio"
              aria-checked={kieuTimKiem === 'phone'}
              className={`uc28-method-card ${kieuTimKiem === 'phone' ? 'is-active' : ''}`}
              disabled={dangTim}
              onClick={() => { setKieuTimKiem('phone'); setLoi(''); setKetQua(null); }}
            >
              <span className="uc28-method-icon" aria-hidden="true">☎</span>
              <span className="uc28-method-copy">
                <strong>Theo số điện thoại</strong>
                <small>Tìm nhanh theo số điện thoại của bệnh nhân</small>
              </span>
              <span className="uc28-radio-dot" aria-hidden="true" />
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={kieuTimKiem === 'nameDob'}
              className={`uc28-method-card ${kieuTimKiem === 'nameDob' ? 'is-active' : ''}`}
              disabled={dangTim}
              onClick={() => { setKieuTimKiem('nameDob'); setLoi(''); setKetQua(null); }}
            >
              <span className="uc28-method-icon" aria-hidden="true">▤</span>
              <span className="uc28-method-copy">
                <strong>Theo họ tên và ngày sinh</strong>
                <small>Dùng thêm ngày sinh để phân biệt người trùng tên</small>
              </span>
              <span className="uc28-radio-dot" aria-hidden="true" />
            </button>
          </div>

          {kieuTimKiem === 'phone' ? (
            <div className="uc28-form-field">
              <Input
                id="uc28-phone"
                label="Số điện thoại bệnh nhân"
                value={soDienThoai}
                onChange={(event) => { setSoDienThoai(event.target.value); setKetQua(null); }}
                disabled={dangTim}
                placeholder="Ví dụ: 0901234567"
                autoComplete="tel"
                helperText="Có thể nhập một phần số điện thoại để tìm hồ sơ phù hợp."
              />
            </div>
          ) : (
            <div className="uc28-form-grid">
              <Input
                id="uc28-name"
                label="Họ và tên"
                value={hoTen}
                onChange={(event) => { setHoTen(event.target.value); setKetQua(null); }}
                disabled={dangTim}
                placeholder="Nhập họ tên bệnh nhân"
                autoComplete="name"
              />
              <Input
                id="uc28-dob"
                label="Ngày sinh"
                type="date"
                value={ngaySinh}
                max={ngayHienTaiISO()}
                onChange={(event) => { setNgaySinh(event.target.value); setKetQua(null); }}
                disabled={dangTim}
              />
            </div>
          )}

          {loi && <div className="uc28-form-error"><Alert title="Không thể thực hiện tìm kiếm" tone="error">{loi}</Alert></div>}

          <div className="uc28-form-actions">
            <Button type="submit" loading={dangTim} loadingText="Đang tìm kiếm..." size="lg" icon={<span aria-hidden="true">⌕</span>}>
              Tìm kiếm hồ sơ
            </Button>
            <Button type="button" variant="secondary" size="lg" onClick={handleReset} disabled={dangTim}>
              Đặt lại
            </Button>
          </div>
        </form>
      </Card>

      <Card className="uc28-results-card">
        <div className="uc28-section-heading uc28-results-heading">
          <div>
            <h2>Kết quả tra cứu</h2>
            <p>{ketQua ? ketQua.thongBao : 'Kết quả phù hợp sẽ xuất hiện tại đây sau khi tìm kiếm.'}</p>
          </div>
          {ketQua && <span className="uc28-result-count">{ketQua.tongSoKetQua} hồ sơ</span>}
        </div>

        {ketQua ? (
          <>
            {ketQua.danhSachBenhNhan.length > 0 ? (
              <Table
                columns={columns}
                data={ketQua.danhSachBenhNhan}
                rowKey={(row) => row.idBenhNhan}
                caption="Danh sách hồ sơ bệnh nhân phù hợp"
                emptyText="Không tìm thấy hồ sơ phù hợp."
              />
            ) : (
              <div className="uc28-empty-state">
                <div className="uc28-empty-icon" aria-hidden="true">⌕</div>
                <strong>Không tìm thấy hồ sơ bệnh nhân</strong>
                <p>Kiểm tra lại thông tin tìm kiếm. Nếu bệnh nhân chưa có hồ sơ, có thể tạo mới.</p>
              </div>
            )}
          </>
        ) : (
          <div className="uc28-empty-state uc28-empty-state--initial">
            <div className="uc28-empty-icon" aria-hidden="true">▤</div>
            <strong>Chưa có kết quả</strong>
            <p>Nhập số điện thoại hoặc họ tên kèm ngày sinh để bắt đầu tra cứu.</p>
          </div>
        )}
      </Card>

      {benhNhanDangXem && (
        <div className="uc28-modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setBenhNhanDangXem(null);
        }}>
          <section className="uc28-detail-modal" role="dialog" aria-modal="true" aria-labelledby="uc28-detail-title">
            <div className="uc28-modal-heading">
              <div>
                <span className="uc28-eyebrow">CHI TIẾT HỒ SƠ</span>
                <h2 id="uc28-detail-title">{benhNhanDangXem.hoTen}</h2>
                <p className="uc28-record-id">Mã hồ sơ: {benhNhanDangXem.idBenhNhan}</p>
              </div>
              <button type="button" className="uc28-modal-close" onClick={() => setBenhNhanDangXem(null)} aria-label="Đóng chi tiết">×</button>
            </div>
            <dl className="uc28-detail-grid">
              <div><dt>Ngày sinh</dt><dd>{dinhDangNgay(benhNhanDangXem.ngaySinh)}</dd></div>
              <div><dt>Giới tính</dt><dd>{hienThiGioiTinh(benhNhanDangXem.gioiTinh)}</dd></div>
              <div><dt>Số điện thoại</dt><dd>{benhNhanDangXem.soDienThoai || 'Chưa cập nhật'}</dd></div>
              <div className="uc28-detail-address"><dt>Địa chỉ</dt><dd>{benhNhanDangXem.diaChi || 'Chưa cập nhật'}</dd></div>
            </dl>
            <div className="uc28-modal-actions">
              <Button type="button" variant="secondary" onClick={() => setBenhNhanDangXem(null)}>Đóng</Button>
            </div>
          </section>
        </div>
      )}
    </div>
  );

  return <ReceptionLayout section="reception">{mainContent}</ReceptionLayout>;
}
