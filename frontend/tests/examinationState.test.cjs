const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const source = fs.readFileSync(path.join(__dirname, '../src/pages/examinationState.ts'), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const exportsObject = {};
vm.runInNewContext(compiled, { exports: exportsObject });
const { getExaminationBlockReason, getSavedExam } = exportsObject;
const makeRecord = () => ({
    luotKhamHienTai: { idLuotKham: 'CURRENT', trangThai: 'CHO_KHAM', trieuChung: 'A', ketQuaKham: 'B', chanDoan: 'C' },
    sinhHieuHienTai: { idLuotKhamNguon: 'CURRENT', huyetApTamThu: 120, huyetApTamTruong: 80, canNang: 60, nhietDo: 36.5 },
});

test('waiting and in-progress visits are eligible with current vitals', () => {
    const record = makeRecord();
    assert.equal(getExaminationBlockReason(record), null);
    record.luotKhamHienTai.trangThai = 'DANG_KHAM';
    assert.equal(getExaminationBlockReason(record), null);
});
test('previous visit vitals cannot substitute for current visit vitals', () => {
    const record = makeRecord();
    record.sinhHieuMoiNhat = record.sinhHieuHienTai;
    record.sinhHieuHienTai = null;
    assert.match(getExaminationBlockReason(record), /lượt khám hiện tại/);
    record.sinhHieuHienTai = { ...record.sinhHieuMoiNhat, idLuotKhamNguon: 'OLD' };
    assert.match(getExaminationBlockReason(record), /lượt khám hiện tại/);
});
test('incomplete or invalid current vitals block examination', () => {
    for (const value of [null, undefined, 0, -1, NaN]) {
        const record = makeRecord();
        record.sinhHieuHienTai.nhietDo = value;
        assert.match(getExaminationBlockReason(record), /chưa đầy đủ/);
    }
});
test('unreceived and completed visits block examination', () => {
    const record = makeRecord();
    record.luotKhamHienTai.trangThai = 'HOAN_TAT';
    assert.match(getExaminationBlockReason(record), /hoàn tất/);
    record.luotKhamHienTai = null;
    assert.match(getExaminationBlockReason(record), /chưa được tiếp nhận/);
});
test('reset baseline uses the latest saved exam and normalizes empty fields', () => {
    const record = makeRecord();
    assert.equal(getSavedExam(record).chanDoan, 'C');
    const latest = { ...record, luotKhamHienTai: { ...record.luotKhamHienTai, chanDoan: 'Latest saved' } };
    assert.equal(getSavedExam(latest).chanDoan, 'Latest saved');
    assert.equal(getSavedExam(record).chanDoan, 'C');
    assert.equal(getSavedExam({ luotKhamHienTai: null }).trieuChung, '');
});
