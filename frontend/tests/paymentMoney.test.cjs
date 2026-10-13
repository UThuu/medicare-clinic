const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { create, act } = require('react-test-renderer');

const text = node => typeof node === 'string' ? node : (node.children || []).map(text).join('');

function harness(result) {
  const calls = [];
  const invoice = {
    idHoaDon: 'HD-001', tenBenhNhan: 'Patient', soDienThoai: '0901234567',
    maBenhNhan: 'BN-001', bacSiKham: 'Doctor', ngayTao: '2026-10-12T09:00:00',
    phiKham: 150000, tienThuoc: 0, tongTien: 150000, trangThai: 'CHUA_THANH_TOAN',
    danhSachChiTiet: [], lichSuGiaoDich: [],
  };
  const api = {
    layDanhSachHoaDonChuaThanhToan: async () => [invoice],
    layThongTinThanhToan: async () => invoice,
    thanhToanTienMat: async payload => {
      calls.push(payload);
      return { idHoaDon: invoice.idHoaDon, ...result };
    },
  };
  const Button = ({ children, loading, disabled, variant, size, ...props }) =>
    React.createElement('button', { ...props, disabled: disabled || loading }, children);
  const Modal = ({ open, children, footer }) => open
    ? React.createElement('section', { role: 'dialog' }, children, footer) : null;
  const InHoaDonModal = ({ isOpen, idHoaDon }) => isOpen
    ? React.createElement('section', { 'data-testid': 'print-invoice' }, idHoaDon) : null;
  const deps = {
    react: React,
    'react/jsx-runtime': require('react/jsx-runtime'),
    '../../services/thanhToanService': { thanhToanService: api },
    '../../components/common/Button': { Button },
    '../../components/common/Modal': { Modal },
    './components/StatusBadge': { StatusBadge: ({ status }) => React.createElement('span', null, status) },
    './components/InHoaDonModal': { InHoaDonModal },
  };
  const file = path.join(__dirname, '../src/pages/cashier/ThanhToanPage.tsx');
  const compiled = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  const exports = {};
  vm.runInNewContext(compiled, {
    exports, setTimeout: () => 0,
    require: id => {
      if (Object.hasOwn(deps, id)) return deps[id];
      throw new Error('Unexpected import: ' + id);
    },
  });
  return { Page: exports.ThanhToanPage, calls };
}

async function pay(result, verify) {
  const h = harness(result);
  let page;
  try {
    await act(async () => { page = create(React.createElement(h.Page)); });
    await act(async () => { await page.root.findByProps({ id: 'btn-thanh-toan-HD-001' }).props.onClick(); });
    const cashInput = page.root.findByProps({ id: 'input-tien-khach-dua' });
    await act(() => { cashInput.props.onChange({ target: { value: '200000' } }); });
    await act(async () => { await page.root.findByProps({ id: 'btn-confirm-thanh-toan' }).props.onClick(); });
    assert.equal(h.calls.length, 1);
    assert.equal(h.calls[0].idHoaDon, 'HD-001');
    assert.equal(h.calls[0].tienKhachDua, 200000);
    assert.equal(text(page.root.findByProps({ 'data-testid': 'print-invoice' })), 'HD-001');
    assert.equal(page.root.findAllByProps({ role: 'dialog' }).length, 0);
    const toast = text(page.root.findByProps({ id: 'app-toast' }));
    assert.ok(toast.includes('Thanh toán tiền mặt thành công'));
    verify(toast);
  } finally {
    if (page) act(() => page.unmount());
  }
}

for (const amount of [50000, 0]) {
  test(`cash success formats valid returned change (${amount})`, async () => {
    await pay({ tienThoiLai: amount }, toast => {
      const formatted = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
      assert.ok(toast.includes(`Tiền thối lại: ${formatted}`));
      assert.ok(!toast.includes('Chưa có dữ liệu'));
    });
  });
}

for (const [label, result] of [
  ['missing', {}], ['null', { tienThoiLai: null }], ['string', { tienThoiLai: '50000' }],
  ['NaN', { tienThoiLai: NaN }], ['infinity', { tienThoiLai: Infinity }],
  ['negative', { tienThoiLai: -1 }],
]) {
  test(`cash success reports unavailable change (${label}) without inventing an amount or retrying payment`, async () => {
    await pay(result, toast => {
      assert.ok(toast.includes('Chưa có dữ liệu tiền thối lại hợp lệ. Vui lòng kiểm tra hóa đơn.'));
      assert.ok(!toast.includes('Tiền thối lại:'));
      assert.ok(!toast.includes('NaN'));
      assert.ok(!toast.includes('∞'));
    });
  });
}
