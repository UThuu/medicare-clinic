const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { create, act } = require('react-test-renderer');
const nodeText = node => typeof node === 'string' ? node : (node.children || []).map(nodeText).join('');
function harness(user = { hoTen: 'Tên từ phiên đăng nhập', tenDangNhap: 'session-user', vaiTro: 'LE_TAN' }, logout = async () => {}) {
  const calls = []; const cache = new Map();
  const environment = {
    window: { setInterval: () => 1 }, clearInterval: () => {},
    document: { visibilityState: 'visible', addEventListener() {}, removeEventListener() {} },
    alert: message => calls.push({ alert: message }),
  };
  const load = file => {
    if (cache.has(file)) return cache.get(file);
    const source = fs.readFileSync(path.join(__dirname, '../src', file), 'utf8');
    const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
    const exports = {}; cache.set(file, exports);
    vm.runInNewContext(compiled, { exports, React, Error, ...environment, require: id => {
      if (id === 'react') return React;
      if (id === 'react/jsx-runtime') return require(id);
      if (id === 'react-router-dom') return { useNavigate: () => (...args) => calls.push({ navigate: args }) };
      if (id.endsWith('contexts/AuthContext')) return { useAuth: () => ({ user, logout }) };
      if (id.endsWith('services/scheduleService')) return { scheduleService: {
        getDoctorSchedule: async () => { calls.push({ schedule: true }); return [
          { idLichKham: 'DOCTOR-VISIT', gioKham: '09:00:00', tenBenhNhan: 'Persisted patient', idBenhNhan: 'P1', trangThaiLichKham: 'DA_TIEP_NHAN', trangThaiLuotKham: 'CHO_KHAM' },
          { idLichKham: 'DOCTOR-DONE', gioKham: '10:00:00', tenBenhNhan: 'Completed patient', idBenhNhan: 'P2', trangThaiLichKham: 'DA_TIEP_NHAN', trangThaiLuotKham: 'HOAN_TAT' },
        ]; } } };
      if (id.endsWith('.css')) return {};
      if (id.startsWith('.')) {
        const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(file), id));
        return load(resolved.endsWith('.tsx') ? resolved : resolved + '.tsx');
      }
      throw new Error('Unexpected import: ' + id);
    }});
    return exports;
  };
  return { load, calls };
}
test('reception dashboard displays session identity, active reception entry, and disabled unavailable features', async () => {
  const h = harness(); const { StaffDashboard } = h.load('pages/StaffDashboard.tsx'); let page;
  try {
    await act(async () => { page = create(React.createElement(StaffDashboard)); });
    assert.ok(nodeText(page.root).includes('Tên từ phiên đăng nhập'));
    assert.ok(nodeText(page.root).includes('Lễ tân'));
    const sidebar = page.root.findByType('aside');
    assert.deepEqual(sidebar.findAllByType('a').map(x => x.props.href), ['/staff', '/staff/patient-search', '/staff/lich-kham/dat-tai-quay']);
    const unavailable = sidebar.findAllByType('button').filter(x => x.props.disabled);
    assert.equal(unavailable.length, 1);
    for (const button of unavailable) {
      assert.equal(button.props.href, undefined); assert.equal(button.props.onClick, undefined);
      assert.ok(nodeText(button).includes('Chưa khả dụng'));
    }
    assert.ok(!nodeText(sidebar).includes('Tìm hồ sơ'));
    assert.ok(!nodeText(sidebar).includes('Tạo hồ sơ'));
    const features = page.root.findAllByProps({ 'aria-disabled': 'true' }).filter(x => x.type === 'section');
    assert.equal(features.length, 1);
    for (const feature of features) assert.equal(feature.findByType('button').props.disabled, true);
    const reception = page.root.findAllByType('button').find(x => nodeText(x) === 'Tiếp nhận');
    await act(() => reception.props.onClick());
    assert.equal(h.calls.at(-1).navigate[0], '/staff/patient-search');
    assert.equal(h.calls.filter(x => x.schedule).length, 0);
  } finally { if (page) act(() => page.unmount()); }
});
test('unavailable daily appointments are not shown as an empty, loading, or failed API result', async () => {
  const h = harness(); const { ReceptionDashboard } = h.load('pages/ReceptionDashboard.tsx'); let page;
  try {
    await act(async () => { page = create(React.createElement(ReceptionDashboard)); });
    const message = nodeText(page.root.findByProps({ role: 'status' }));
    assert.ok(message.includes('Chức năng đang được hoàn thiện'));
    assert.ok(!message.includes('Không có lịch')); assert.ok(!message.includes('Đang tải'));
    assert.ok(!message.includes('lỗi')); assert.equal(h.calls.filter(x => x.schedule).length, 0);
    const expected = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());
    assert.equal(nodeText(page.root.findByType('time')), expected);
  } finally { if (page) act(() => page.unmount()); }
});
test('shared reception logout waits for session invalidation and navigates to login', async () => {
  let release; let calls = 0;
  const h = harness(undefined, () => { calls++; return new Promise(resolve => { release = resolve; }); });
  const { ReceptionDashboard } = h.load('pages/ReceptionDashboard.tsx'); let page;
  try {
    await act(async () => { page = create(React.createElement(ReceptionDashboard)); });
    const logout = page.root.findByProps({ className: 'mc-sidebar__logout' });
    let pending; await act(async () => { pending = logout.props.onClick(); });
    assert.equal(calls, 1); assert.equal(page.root.findByProps({ className: 'mc-sidebar__logout' }).props.disabled, true);
    assert.equal(h.calls.filter(x => x.navigate).length, 0);
    await act(async () => { release(); await pending; });
    assert.equal(h.calls.at(-1).navigate[0], '/login');
    assert.equal(h.calls.at(-1).navigate[1].replace, true);
  } finally { if (page) act(() => page.unmount()); }
});
test('shared default layout retains doctor dashboard, counts, table links and header logout', async () => {
  let logouts = 0;
  const h = harness({ hoTen: 'Bác sĩ từ phiên', vaiTro: 'BAC_SI' }, async () => { logouts++; });
  const { StaffDashboard } = h.load('pages/StaffDashboard.tsx'); let page;
  try {
    await act(async () => { page = create(React.createElement(StaffDashboard)); });
    assert.equal(page.root.findByProps({ className: 'mc-app' }).type, 'div');
    assert.equal(page.root.findAllByProps({ className: 'mc-sidebar__logout' }).length, 0);
    assert.deepEqual(page.root.findByType('aside').findAllByType('a').map(x => x.props.href), ['/staff', '/staff/schedules']);
    assert.ok(nodeText(page.root).includes('Bác sĩ từ phiên')); assert.ok(nodeText(page.root).includes('Persisted patient'));
    assert.ok(nodeText(page.root).includes('Hoàn tất')); assert.equal(h.calls.filter(x => x.schedule).length, 1);
    const counts = page.root.findAll(x => x.type === 'div' && x.props.style?.fontSize === '2.5rem').map(nodeText);
    assert.deepEqual(counts, ['2', '1', '0', '1']);
    await act(() => page.root.findAllByProps({ className: 'mc-dashboard-cell' })[0].props.onClick({ type: 'click' }));
    assert.equal(h.calls.at(-1).navigate[0], '/staff/medical-record/DOCTOR-VISIT');
    await act(() => page.root.findByProps({ className: 'mc-user-btn' }).props.onClick());
    await act(async () => page.root.findAllByType('button').find(x => nodeText(x) === 'Đăng xuất').props.onClick());
    assert.equal(logouts, 1); assert.equal(h.calls.at(-1).navigate[0], '/login');
  } finally { if (page) act(() => page.unmount()); }
});
