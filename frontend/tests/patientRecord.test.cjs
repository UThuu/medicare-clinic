const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { create, act } = require('react-test-renderer');

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
function text(node) {
    if (typeof node === 'string') return node;
    return (node.children || []).map(text).join('');
}
async function mount(status = 'CHO_KHAM') {
    const container = tag => props => React.createElement(tag, props, props.children);
    const history = ['CHO_KHAM', 'CHO_KHAM', 'DANG_KHAM', 'HOAN_TAT'].map((trangThai, i) => ({
        idLuotKham: `HISTORY-${i}`, ngayKham: '2026-10-10', tenBacSi: 'Test Doctor',
        lyDoKham: 'Test visit', trangThai, chanDoan: i === 2 ? 'Saved diagnosis' : null,
    }));
    const record = {
        benhNhan: { idBenhNhan: 'PATIENT', hoTen: 'Test Patient' },
        lichKhamHienTai: { ngayKham: '2026-10-10' },
        luotKhamHienTai: { idLuotKham: 'CURRENT', trangThai: status, chanDoan: null },
        sinhHieuHienTai: null, sinhHieuMoiNhat: null, diUng: [], lichSuKham: history,
        lichSuSinhHieu: Array.from({ length: 4 }, () => ({ thoiDiemDo: '2026-10-10T11:08:54', huyetApTamThu: 120, huyetApTamTruong: 80, canNang: 60, nhietDo: 36.5 })),
    };
    const { PatientRecord } = load('PatientRecord.tsx', {
        react: React,
        'react-router-dom': { useParams: () => ({ id: 'SCHEDULE' }), useNavigate: () => () => {} },
        '../contexts/AuthContext': { useAuth: () => ({ user: { hoTen: 'Test Doctor', vaiTro: 'BAC_SI' } }) },
        '../components/layout/MainLayout': { MainLayout: container('main') },
        '../components/common/Button': { Button: container('button') },
        '../components/common/PatientSummary': { PatientSummary: container('summary') },
        '../services/medicalRecordService': { medicalRecordService: { getMedicalRecord: async () => record } },
        './examinationState': load('examinationState.ts', {}),
    });
    let page;
    await act(async () => { page = create(React.createElement(PatientRecord)); });
    return page;
}
test('history keeps distinct visits with equal values and renders actual status/empty diagnosis', async () => {
    const page = await mount();
    try {
        const rows = page.root.findByType('tbody').findAllByType('tr');
        assert.equal(rows.length, 4);
        assert.deepEqual(rows.map(row => text(row.findAllByType('td')[4])), ['Chờ khám', 'Chờ khám', 'Đang khám', 'Hoàn tất']);
        assert.deepEqual(rows.map(row => text(row.findAllByType('td')[3])), ['Chưa có chẩn đoán', 'Chưa có chẩn đoán', 'Saved diagnosis', 'Chưa có chẩn đoán']);
        assert.ok(!text(page.root).includes('Không bệnh'));
        const vitalsTab = page.root.findAllByType('div').find(node => node.props.className?.includes('tab-item') && text(node) === 'Sinh hi\u1ec7u');
        assert.ok(vitalsTab);
        await act(() => vitalsTab.props.onClick());
        assert.equal(page.root.findByType('tbody').findAllByType('tr').length, 4);
    } finally { act(() => page.unmount()); }
});
test('current visit distinguishes waiting, examining, completed and unknown states', async () => {
    for (const [status, label] of [['CHO_KHAM', 'Chờ khám'], ['DANG_KHAM', 'Đang khám'], ['HOAN_TAT', 'Hoàn tất'], ['UNKNOWN', 'Chưa rõ']]) {
        const page = await mount(status);
        try {
            const current = page.root.findAll(node => node.type === 'span' && node.props.className === 'value-text' && text(node) === label);
            assert.equal(current.length, 1);
        } finally { act(() => page.unmount()); }
    }
});
