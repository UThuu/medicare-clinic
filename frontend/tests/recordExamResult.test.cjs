const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { create, act } = require('react-test-renderer');

function fixture() {
    return {
        benhNhan: { idBenhNhan: 'PATIENT', hoTen: 'Synthetic Patient' },
        lichKhamHienTai: { ngayKham: '2026-10-10', gioKham: '09:00:00' },
        luotKhamHienTai: { idLuotKham: 'CURRENT', trangThai: 'CHO_KHAM', trieuChung: 'Saved symptoms', ketQuaKham: 'Saved results', chanDoan: 'Saved diagnosis' },
        sinhHieuHienTai: { idLuotKhamNguon: 'CURRENT', huyetApTamThu: 120, huyetApTamTruong: 80, canNang: 60, nhietDo: 36.5 },
    };
}
function load(file, dependencies) {
    const source = fs.readFileSync(path.join(__dirname, '../src/pages', file), 'utf8');
    const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true } }).outputText;
    const exports = {};
    vm.runInNewContext(compiled, { exports, require: id => {
        if (Object.hasOwn(dependencies, id)) return dependencies[id];
        if (id.endsWith('.css')) return {};
        throw new Error(`Unexpected import: ${id}`);
    }});
    return exports;
}
async function mount(record, options = {}) {
    const calls = { start: [], save: [], navigate: [] };
    const container = tag => props => React.createElement(tag, props, props.children);
    const state = load('examinationState.ts', {});
    const services = {
        medicalRecordService: { getMedicalRecord: async () => structuredClone(record) },
        khamBenhService: {
            startKhamBenh: async id => { calls.start.push(id); record.luotKhamHienTai.trangThai = 'DANG_KHAM'; },
            saveKetQuaKham: async body => { calls.save.push(body); if (options.failSave) throw new Error('Synthetic save failure'); Object.assign(record.luotKhamHienTai, body); },
        },
    };
    const { RecordExamResult } = load('RecordExamResult.tsx', {
        react: React,
        'react-router-dom': { useParams: () => ({ id: 'SCHEDULE' }), useNavigate: () => target => calls.navigate.push(target) },
        '../components/layout/MainLayout': { MainLayout: container('main') },
        '../components/common/Button': { Button: container('button') },
        '../components/common/PatientSummary': { PatientSummary: container('summary') },
        '../components': { Card: container('section'), Alert: container('aside'), Textarea: container('textarea') },
        '../services/medicalRecordService': services,
        '../services/khamBenhService': services,
        '../contexts/AuthContext': { useAuth: () => ({ user: { hoTen: 'Synthetic Doctor' } }) },
        './examinationState': state,
    });
    let rendered;
    await act(async () => { rendered = create(React.createElement(RecordExamResult)); });
    const fields = () => rendered.root.findAllByType('textarea');
    const buttons = () => rendered.root.findAllByType('button');
    const values = () => fields().map(field => field.props.value);
    const edit = async values => act(async () => { fields().forEach((field, i) => field.props.onChange({ target: { value: values[i] } })); });
    const click = async index => act(async () => { await buttons()[index].props.onClick(); });
    const close = () => act(() => rendered.unmount());
    return { calls, fields, buttons, values, edit, click, close };
}

test('exam page starts current visit and reset restores the most recent successful save', async () => {
    const page = await mount(fixture());
    try {
        assert.deepEqual(page.calls.start, ['SCHEDULE']);
        assert.equal(page.buttons()[1].props.disabled, false);
        await page.edit(['Draft symptoms', 'Draft results', 'Draft diagnosis']);
        await page.click(0);
        assert.deepEqual(page.values(), ['Saved symptoms', 'Saved results', 'Saved diagnosis']);
        await page.edit([' New symptoms ', ' New results ', ' New diagnosis ']);
        await page.click(1);
        assert.equal(page.calls.save[0].idLichKham, 'SCHEDULE');
        assert.equal(page.calls.save[0].chanDoan, 'New diagnosis');
        assert.equal(page.buttons()[1].props.disabled, false);
        await page.edit(['Unsaved symptoms', 'Unsaved results', 'Unsaved diagnosis']);
        await page.click(0);
        assert.deepEqual(page.values(), ['New symptoms', 'New results', 'New diagnosis']);
        assert.deepEqual(page.calls.navigate, []);
    } finally { page.close(); }
});

test('failed save leaves the previous reset baseline intact', async () => {
    const page = await mount(fixture(), { failSave: true });
    try {
        await page.edit(['Draft symptoms', 'Draft results', 'Draft diagnosis']);
        await page.click(1);
        await page.click(0);
        assert.deepEqual(page.values(), ['Saved symptoms', 'Saved results', 'Saved diagnosis']);
    } finally { page.close(); }
});

test('historical or incomplete vitals and completed visits never start examination or enable editing', async () => {
    for (const scenario of ['historical', 'incomplete', 'completed']) {
        const record = fixture();
        if (scenario === 'historical') record.sinhHieuHienTai.idLuotKhamNguon = 'OLD';
        if (scenario === 'incomplete') record.sinhHieuHienTai.nhietDo = null;
        if (scenario === 'completed') record.luotKhamHienTai.trangThai = 'HOAN_TAT';
        const page = await mount(record);
        try {
            assert.deepEqual(page.calls.start, []);
            assert.ok(page.fields().every(field => field.props.disabled));
            assert.ok(page.buttons().every(button => button.props.disabled));
        } finally { page.close(); }
    }
});
