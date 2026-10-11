const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { create, act } = require('react-test-renderer');
const text = n => typeof n === 'string' ? n : (n.children || []).map(text).join('');
const container = tag => props => React.createElement(tag, props, props.children);
function load(file, dependencies = {}, globals = {}) {
  const source = fs.readFileSync(path.join(__dirname, '../src', file), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
  const exports = {};
  vm.runInNewContext(compiled, { exports, Error, setTimeout, clearTimeout, ...globals, require: id => {
    if (Object.hasOwn(dependencies, id)) return dependencies[id];
    if (id === 'react/jsx-runtime') return require(id);
    if (id.endsWith('.css')) return {};
    throw new Error('Unexpected import: ' + id);
  } });
  return exports;
}
const valid = { hoTen: ' Hồ sơ thử ', ngaySinh: '1992-04-05', gioiTinh: 'NU', soDienThoai: '090-888-7777', diaChi: ' Địa chỉ ' };
const saved = { ...valid, hoTen: 'Hồ sơ thử', soDienThoai: '0908887777', diaChi: 'Địa chỉ', idBenhNhan: 'SAVED-ID', thongBao: 'Saved in database' };
function moduleFor(save, check = async () => ({ tongSoKetQua: 0, danhSachBenhNhan: [] })) {
  return load('pages/BenhNhanTaoMoi.tsx', {
    react: React,
    '../components/common/Alert': { Alert: props => React.createElement('aside', null, props.title, props.children) },
    '../components/common/Card': { Card: container('section') },
    '../components/common/Input': { Input: container('input') },
    '../components/common/Textarea': { Textarea: container('textarea') },
    '../components/common/Button': load('components/common/Button.tsx'),
    '../services/benhNhanTaoMoiService': { taoHoSoBenhNhanMoi: save, kiemTraSoDienThoai: check },
    '../components/common/Table': load('components/common/Table.tsx'),
  });
}
test('UC29 validation follows schema, real dates, enum, and phone digit rules', () => {
  const { kiemTraForm } = moduleFor(async () => saved);
  assert.equal(Object.keys(kiemTraForm(valid)).length, 0);
  for (const [field, value] of [
    ['hoTen', ' '], ['hoTen', 'x'.repeat(101)], ['ngaySinh', '2999-01-01'],
    ['ngaySinh', '1992-02-30'], ['ngaySinh', '0001-01-01'], ['ngaySinh', 'bad'],
    ['gioiTinh', 'KHAC'], ['soDienThoai', '........'], ['soDienThoai', '0901234'],
    ['soDienThoai', '09+01234567'], ['diaChi', 'x'.repeat(256)],
  ]) assert.ok(kiemTraForm({ ...valid, [field]: value })[field], field + ' ' + value);
});
test('UC29 rejects invalid form locally and preserves entered values after server rejection', async () => {
  let calls = 0; let page;
  const { BenhNhanTaoMoi } = moduleFor(async () => { calls++; throw new Error('Máy chủ không thể lưu hồ sơ'); });
  try {
    await act(async () => { page = create(React.createElement(BenhNhanTaoMoi, { initialValues: valid, onBack() {}, onSaved() {} })); });
    await act(() => page.root.findByProps({ id: 'bn-ho-ten' }).props.onChange({ target: { value: '' } }));
    await act(async () => page.root.findByType('form').props.onSubmit({ preventDefault() {} }));
    assert.equal(calls, 0);
    await act(() => page.root.findByProps({ id: 'bn-ho-ten' }).props.onChange({ target: { value: valid.hoTen } }));
    await act(async () => page.root.findByType('form').props.onSubmit({ preventDefault() {} }));
    assert.equal(calls, 1); assert.ok(text(page.root).includes('Máy chủ không thể lưu hồ sơ'));
    assert.equal(page.root.findByProps({ id: 'bn-ho-ten' }).props.value, valid.hoTen);
    assert.equal(page.root.findByProps({ id: 'bn-so-dien-thoai' }).props.value, valid.soDienThoai);
    assert.equal(page.root.findByProps({ id: 'bn-dia-chi' }).props.value, valid.diaChi);
    assert.equal(page.root.findByType('fieldset').props.disabled, false);
  } finally { if (page) act(() => page.unmount()); }
});
test('UC29 prevents repeated submit, disables form while saving and displays returned persisted profile', async () => {
  let release; const calls = []; const onSaved = []; let page;
  const { BenhNhanTaoMoi } = moduleFor(req => { calls.push(req); return new Promise(resolve => { release = resolve; }); });
  try {
    await act(async () => { page = create(React.createElement(BenhNhanTaoMoi, { initialValues: valid, onBack() {}, onSaved: value => onSaved.push(value) })); });
    const submit = page.root.findByType('form').props.onSubmit;
    let pending;
    await act(async () => { pending = submit({ preventDefault() {} }); submit({ preventDefault() {} }); });
    assert.equal(calls.length, 1); assert.equal(calls[0].hoTen, 'Hồ sơ thử'); assert.equal(calls[0].diaChi, 'Địa chỉ');
    assert.equal(page.root.findByType('fieldset').props.disabled, true);
    assert.equal(page.root.findAllByType('button').find(n => text(n).includes('Đang lưu hồ sơ')).props.disabled, true);
    await act(async () => { release(saved); await pending; });
    assert.equal(onSaved[0], saved); assert.ok(text(page.root).includes('SAVED-ID'));
    assert.ok(text(page.root).includes('0908887777')); assert.equal(page.root.findAllByType('form').length, 0);
    assert.ok(!text(page.root).includes('DEMO'));
  } finally { if (page) act(() => page.unmount()); }
});
test('UC29 transport posts relative API with session cookie and propagates rejection without fabricated success', async () => {
  let captured;
  const service = load('services/benhNhanTaoMoiService.ts', {}, { fetch: async (url, options) => {
    captured = { url, options }; return { ok: true, json: async () => saved };
  } });
  assert.equal(await service.taoHoSoBenhNhanMoi(valid), saved);
  assert.equal(captured.url, '/api/benhnhan/tao-moi'); assert.equal(captured.options.credentials, 'include');
  assert.equal(captured.options.method, 'POST'); assert.equal(JSON.parse(captured.options.body).hoTen, valid.hoTen);
  for (const status of [400, 401, 403, 409, 500]) {
    const rejected = load('services/benhNhanTaoMoiService.ts', {}, { fetch: async () => ({ ok: false, status, json: async () => ({ message: 'Rejected ' + status }) }) });
    await assert.rejects(rejected.taoHoSoBenhNhanMoi(valid), new RegExp('Rejected ' + status));
  }
});


test('shared guardian phone displays real matching identities but allows saving another patient', async () => {
  const match = { ...saved, idBenhNhan: 'GUARDIAN-PROFILE', hoTen: 'Người dùng chung SĐT', ngaySinh: '1980-01-01' };
  let writes = 0; let page;
  const { BenhNhanTaoMoi } = moduleFor(async () => { writes++; return saved; },
    async () => ({ tongSoKetQua: 1, danhSachBenhNhan: [match] }));
  try {
    await act(async () => { page = create(React.createElement(BenhNhanTaoMoi, { initialValues: valid, onBack() {}, onSaved() {} })); });
    await act(async () => new Promise(resolve => setTimeout(resolve, 400)));
    assert.ok(text(page.root).includes('Số điện thoại đã tồn tại'));
    assert.ok(text(page.root).includes('GUARDIAN-PROFILE')); assert.ok(text(page.root).includes('Người dùng chung SĐT'));
    assert.ok(text(page.root).includes('01/01/1980'));
    const saveButton = page.root.findAllByType('button').find(n => text(n) === 'Lưu hồ sơ mới với SĐT này');
    assert.equal(saveButton.props.disabled, false); assert.equal(writes, 0);
    await act(async () => page.root.findByType('form').props.onSubmit({ preventDefault() {} }));
    assert.equal(writes, 1); assert.ok(text(page.root).includes('Tạo hồ sơ thành công'));
  } finally { if (page) act(() => page.unmount()); }
});
test('phone warning discards stale responses when the number changes', async () => {
  const releases = new Map(); let page;
  const { BenhNhanTaoMoi } = moduleFor(async () => saved, phone => new Promise(resolve => releases.set(phone, resolve)));
  try {
    await act(async () => { page = create(React.createElement(BenhNhanTaoMoi, { initialValues: valid, onBack() {}, onSaved() {} })); });
    await act(async () => new Promise(resolve => setTimeout(resolve, 400)));
    await act(() => page.root.findByProps({ id: 'bn-so-dien-thoai' }).props.onChange({ target: { value: '0909999999' } }));
    await act(async () => new Promise(resolve => setTimeout(resolve, 400)));
    await act(async () => { releases.get('0909999999')({ tongSoKetQua: 0, danhSachBenhNhan: [] }); });
    await act(async () => { releases.get(valid.soDienThoai)({ tongSoKetQua: 1, danhSachBenhNhan: [{ ...saved, idBenhNhan: 'STALE-ID' }] }); });
    assert.ok(!text(page.root).includes('STALE-ID')); assert.ok(!text(page.root).includes('Số điện thoại đã tồn tại'));
  } finally { if (page) act(() => page.unmount()); }
});
test('phone check transport uses exact-match API and session cookies', async () => {
  let captured; const result = { tongSoKetQua: 2, danhSachBenhNhan: [] };
  const service = load('services/benhNhanTaoMoiService.ts', {}, { fetch: async (url, options) => {
    captured = { url, options }; return { ok: true, json: async () => result };
  } });
  assert.equal(await service.kiemTraSoDienThoai('0901234567'), result);
  assert.equal(captured.url, '/api/benhnhan/kiem-tra-so-dien-thoai');
  assert.equal(captured.options.credentials, 'include');
  assert.equal(JSON.parse(captured.options.body).soDienThoai, '0901234567');
});


test('identical name, DOB and normalized phone require confirmation and allow selecting existing without writing', async () => {
  const match = { ...saved, hoTen: ' HỒ   SƠ THỬ ', idBenhNhan: 'EXISTING-ID' };
  let writes = 0; let selected; let page;
  const { BenhNhanTaoMoi } = moduleFor(async () => { writes++; return saved; },
    async () => ({ tongSoKetQua: 1, danhSachBenhNhan: [match] }));
  try {
    await act(async () => { page = create(React.createElement(BenhNhanTaoMoi, {
      initialValues: valid, onBack() {}, onSaved() {}, onSelectExisting: p => { selected = p; },
    })); });
    await act(async () => new Promise(resolve => setTimeout(resolve, 400)));
    assert.ok(text(page.root).includes('Hồ sơ có thể đã tồn tại'));
    assert.equal(page.root.findAllByType('button').find(n => text(n) === 'Lưu hồ sơ mới với SĐT này').props.disabled, true);
    await act(async () => page.root.findByType('form').props.onSubmit({ preventDefault() {} }));
    assert.equal(writes, 0);
    await act(() => page.root.findAllByType('button').find(n => text(n) === 'Chọn hồ sơ này').props.onClick());
    assert.equal(selected.idBenhNhan, 'EXISTING-ID'); assert.equal(writes, 0);
    await act(() => page.root.findByProps({ type: 'checkbox' }).props.onChange({ target: { checked: true } }));
    assert.equal(page.root.findAllByType('button').find(n => text(n) === 'Lưu hồ sơ mới với SĐT này').props.disabled, false);
    await act(async () => page.root.findByType('form').props.onSubmit({ preventDefault() {} }));
    assert.equal(writes, 1);
  } finally { if (page) act(() => page.unmount()); }
});

test('duplicate confirmation resets when name, DOB or phone changes', async () => {
  let page;
  const { BenhNhanTaoMoi } = moduleFor(async req => { assert.equal(req.xacNhanTaoMoi, true); return saved; },
    async () => ({ tongSoKetQua: 1, danhSachBenhNhan: [saved] }));
  try {
    await act(async () => { page = create(React.createElement(BenhNhanTaoMoi, { initialValues: valid, onBack() {}, onSaved() {} })); });
    await act(async () => new Promise(resolve => setTimeout(resolve, 400)));
    for (const [id, value] of [['bn-ho-ten', 'Hồ sơ thử'], ['bn-ngay-sinh', valid.ngaySinh], ['bn-so-dien-thoai', valid.soDienThoai]]) {
      await act(() => page.root.findByProps({ type: 'checkbox' }).props.onChange({ target: { checked: true } }));
      await act(() => page.root.findByProps({ id }).props.onChange({ target: { value } }));
      if (id === 'bn-so-dien-thoai') await act(async () => new Promise(resolve => setTimeout(resolve, 400)));
      assert.equal(page.root.findByProps({ type: 'checkbox' }).props.checked, false);
    }
    await act(() => page.root.findByProps({ type: 'checkbox' }).props.onChange({ target: { checked: true } }));
    await act(async () => page.root.findByType('form').props.onSubmit({ preventDefault() {} }));
    assert.ok(text(page.root).includes('Tạo hồ sơ thành công'));
  } finally { if (page) act(() => page.unmount()); }
});
