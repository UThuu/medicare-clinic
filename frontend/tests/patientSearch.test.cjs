const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { create, act } = require('react-test-renderer');
const router = require('react-router-dom');
function load(file, dependencies) {
    const source = fs.readFileSync(path.join(__dirname, '../src', file), 'utf8');
    const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
    const exports = {};
    vm.runInNewContext(compiled, { exports, React, Error, require: id => {
        if (Object.hasOwn(dependencies, id)) return dependencies[id];
        if (id === 'react/jsx-runtime') return require(id);
        if (id.endsWith('.css')) return {};
        throw new Error(`Unexpected import: ${id}`);
    }});
    return exports;
}
function text(node) { return typeof node === 'string' ? node : (node.children || []).map(text).join(''); }
const container = tag => props => React.createElement(tag, props, props.children);
async function mount(search) {
    const calls = [];
    const { BenhNhanTimKiem } = load('pages/BenhNhanTimKiem.tsx', {
        react: React,
        '../components/common/Alert': { Alert: container('aside') },
        '../components/common/Button': { Button: container('button') },
        '../components/common/Card': { Card: container('section') },
        '../components/common/Input': { Input: container('input') },
        '../components/common/Table': load('components/common/Table.tsx', {}),
        '../components/layout/ReceptionLayout': { ReceptionLayout: container('main') },
        '../contexts/AuthContext': { useAuth: () => ({ user: { hoTen: 'Reception', vaiTro: 'LE_TAN' } }) },
        '../services/benhNhanTimKiemService': { timKiemHoSoBenhNhan: async req => { calls.push(req); return search(req); } },
    });
    let page;
    await act(async () => { page = create(React.createElement(BenhNhanTimKiem)); });
    const edit = async (id, value) => act(() => page.root.findByProps({ id }).props.onChange({ target: { value } }));
    const submit = async () => act(async () => page.root.findByType('form').props.onSubmit({ preventDefault() {} }));
    return { page, calls, edit, submit, close: () => act(() => page.unmount()) };
}
const response = { thongBao: 'Database response', tongSoKetQua: 1, danhSachBenhNhan: [{ idBenhNhan: 'DATABASE-ID', hoTen: 'Database Patient', ngaySinh: '1990-01-01', gioiTinh: 'NU', soDienThoai: '0901234567', diaChi: 'Database address' }] };
test('UC28 phone form renders API data, opens details, and clears stale results on invalid input', async () => {
    const app = await mount(async () => response);
    try {
        assert.equal(app.page.root.findAllByType('tbody').length, 0);
        await app.edit('uc28-phone', ' 0901234567 '); await app.submit();
        assert.equal(app.calls[0].soDienThoai, '0901234567');
        assert.ok(text(app.page.root).includes('Database Patient'));
        assert.ok(!text(app.page.root).includes('BN-DEMO'));
        const detail = app.page.root.findAllByType('button').find(node => text(node) === 'Xem thông tin');
        await act(() => detail.props.onClick());
        assert.ok(text(app.page.root.findByProps({ role: 'dialog' })).includes('Database address'));
        await app.edit('uc28-phone', 'abcdefgh'); await app.submit();
        assert.equal(app.calls.length, 1);
        assert.equal(app.page.root.findAllByType('tbody').length, 0);
        assert.equal(app.page.root.findAllByProps({ role: 'dialog' }).length, 0);
    } finally { app.close(); }
});
test('UC28 name plus DOB sends both fields and shows empty result response', async () => {
    const app = await mount(async () => ({ thongBao: 'No matching database rows', tongSoKetQua: 0, danhSachBenhNhan: [] }));
    try {
        await act(() => app.page.root.findAllByProps({ role: 'radio' })[1].props.onClick());
        await app.edit('uc28-name', ' Database Patient '); await app.submit();
        assert.equal(app.calls.length, 0);
        await app.edit('uc28-dob', '1990-01-01'); await app.submit();
        assert.equal(app.calls[0].hoTen, 'Database Patient'); assert.equal(app.calls[0].ngaySinh, '1990-01-01');
        assert.equal(app.calls[0].soDienThoai, undefined);
        assert.ok(text(app.page.root).includes('Không tìm thấy hồ sơ bệnh nhân'));
        assert.ok(!text(app.page.root).includes('Database Patient'));
    } finally { app.close(); }
});
test('UC28 future date and punctuation-only phone are rejected without API request', async () => {
    const app = await mount(async () => response);
    try {
        await app.edit('uc28-phone', '........'); await app.submit();
        assert.equal(app.calls.length, 0);
        await act(() => app.page.root.findAllByProps({ role: 'radio' })[1].props.onClick());
        await app.edit('uc28-name', 'Patient'); await app.edit('uc28-dob', '2999-01-01'); await app.submit();
        assert.equal(app.calls.length, 0);
    } finally { app.close(); }
});
test('UC28 transport uses relative API, POST JSON and session credentials', async () => {
    let request;
    const service = load('services/benhNhanTimKiemService.ts', {});
    // The production function resolves fetch in its VM context, supplied below.
    const source = fs.readFileSync(path.join(__dirname, '../src/services/benhNhanTimKiemService.ts'), 'utf8');
    const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
    const exports = {};
    vm.runInNewContext(compiled, { exports, Error, fetch: async (url, options) => { request = { url, options }; return { ok: true, json: async () => response }; } });
    assert.equal(await exports.timKiemHoSoBenhNhan({ soDienThoai: '0901234567' }), response);
    assert.equal(request.url, '/api/benhnhan/tim-kiem'); assert.equal(request.options.credentials, 'include');
    assert.equal(request.options.method, 'POST'); assert.deepEqual(JSON.parse(request.options.body), { soDienThoai: '0901234567' });
});
test('UC28 transport propagates 400/401/403 instead of substituting demo results', async () => {
    const source = fs.readFileSync(path.join(__dirname, '../src/services/benhNhanTimKiemService.ts'), 'utf8');
    const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
    for (const status of [400, 401, 403]) {
        const exports = {};
        vm.runInNewContext(compiled, { exports, Error, fetch: async () => ({ ok: false, status, text: async () => JSON.stringify({ message: `Rejected ${status}` }) }) });
        await assert.rejects(exports.timKiemHoSoBenhNhan({ soDienThoai: '0901234567' }), new RegExp(`Rejected ${status}`));
    }
});
test('merged router retains protected UC28 and UC06/07/10 routes and removes public demo', async () => {
    for (const [route, role, expected] of [
        ['/staff/patient-search', 'LE_TAN', 'UC28'], ['/staff/patient-search', 'BAC_SI', 'Từ chối truy cập'],
        ['/staff/schedules', 'BAC_SI', 'UC06'], ['/staff/medical-record/A', 'BAC_SI', 'UC07'],
        ['/staff/medical-record/A/record-exam', 'BAC_SI', 'UC10'], ['/dev/uc28', 'LE_TAN', '404'],
    ]) {
        const useAuth = () => ({ user: { vaiTro: role }, isInitializing: false });
        const protectedRoute = load('components/common/ProtectedRoute.tsx', {
            react: React, 'react-router-dom': router, '../../contexts/AuthContext': { useAuth },
            './Alert': { Alert: props => React.createElement('aside', null, props.title, props.children) }, './Button': { Button: container('button') },
        });
        const deps = { react: React, './contexts/AuthContext': { useAuth },
            'react-router-dom': { ...router, BrowserRouter: props => React.createElement(router.MemoryRouter, { initialEntries: [route] }, props.children) },
            './components/common/ProtectedRoute': protectedRoute };
        for (const [file, name, label] of [['Login', 'Login', 'LOGIN'], ['PatientDashboard', 'PatientDashboard', 'PATIENT'], ['StaffDashboard', 'StaffDashboard', 'STAFF'], ['DoctorSchedule', 'DoctorSchedule', 'UC06'], ['PatientRecord', 'PatientRecord', 'UC07'], ['RecordExamResult', 'RecordExamResult', 'UC10'], ['BenhNhanTimKiem', 'BenhNhanTimKiem', 'UC28']]) {
            deps['./pages/' + file] = { [name]: () => React.createElement('p', null, label) };
        }
        const { default: App } = load('App.tsx', deps); let page;
        try { await act(async () => { page = create(React.createElement(App)); }); assert.ok(text(page.root).includes(expected)); }
        finally { if (page) act(() => page.unmount()); }
    }
});
