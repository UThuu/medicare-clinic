import os

f = 'frontend/src/pages/PatientRecord.tsx'
with open(f, 'r', encoding='utf-8') as file:
    content = file.read()

# Replace the LuotKham card content to be a grid
old_luotkham = '''<div className="form-group-inline">
                            <label>Mã lượt khám</label>
                            <span className="value-text">{idLuotKham}</span>
                        </div>
                        <div className="form-group-inline">
                            <label>Thời gian</label>
                            <span className="value-text">{luotKhamHienTai.thoiGianBatDau}</span>
                        </div>
                        <div className="form-group-inline">
                            <label>Lý do khám</label>
                            <span className="value-text">{luotKhamHienTai.lyDoKham}</span>
                        </div>
                        <div className="form-group-inline">
                            <label>Chẩn đoán</label>
                            <span className="value-text">{luotKhamHienTai.chanDoan || 'Chưa có chẩn đoán'}</span>
                        </div>
                        <div className="form-group-inline">
                            <label>Trạng thái</label>
                            <span className="value-text">{luotKhamHienTai.trangThai === 'HOAN_TAT' ? 'Hoàn tất' : 'Đang khám'}</span>
                        </div>'''

new_luotkham = '''<div className="lkh-grid">
                            <div className="form-group-inline">
                                <label>Mã LK</label>
                                <span className="value-text">{idLuotKham}</span>
                            </div>
                            <div className="form-group-inline">
                                <label>Thời gian</label>
                                <span className="value-text">{luotKhamHienTai.thoiGianBatDau}</span>
                            </div>
                            <div className="form-group-inline">
                                <label>Lý do</label>
                                <span className="value-text">{luotKhamHienTai.lyDoKham}</span>
                            </div>
                            <div className="form-group-inline">
                                <label>Chẩn đoán</label>
                                <span className="value-text">{luotKhamHienTai.chanDoan || '...'}</span>
                            </div>
                            <div className="form-group-inline">
                                <label>Trạng thái</label>
                                <span className="value-text">{luotKhamHienTai.trangThai === 'HOAN_TAT' ? 'Hoàn tất' : 'Đang khám'}</span>
                            </div>
                        </div>'''

content = content.replace(old_luotkham, new_luotkham)
with open(f, 'w', encoding='utf-8') as file:
    file.write(content)

css_file = 'frontend/src/pages/patientRecord.css'
with open(css_file, 'r', encoding='utf-8') as file:
    css = file.read()

css += '\n.lkh-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; }'
css += '\n.lkh-grid .form-group-inline { margin-bottom: 0; }'
css += '\n.lkh-grid label { flex: 0 0 60px; }'

with open(css_file, 'w', encoding='utf-8') as file:
    file.write(css)

