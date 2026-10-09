import os

f2 = 'frontend/src/components/common/PatientSummary.tsx'
with open(f2, 'r', encoding='utf-8') as file:
    content = file.read()

content = content.replace(
    '<StatusBadge status={trangThaiLuotKham} />',
    '''<StatusBadge tone={trangThaiLuotKham === "HOAN_TAT" ? "success" : trangThaiLuotKham === "DANG_KHAM" ? "warning" : "info"}>{trangThaiLuotKham === "HOAN_TAT" ? "Hoàn tất" : trangThaiLuotKham === "DANG_KHAM" ? "Đang khám" : trangThaiLuotKham === "CHO_KHAM" ? "Chờ khám" : trangThaiLuotKham === "DA_TIEP_NHAN" ? "Đã tiếp nhận" : "Đã hủy"}</StatusBadge>'''
)

with open(f2, 'w', encoding='utf-8') as file:
    file.write(content)

f = "frontend/src/pages/PatientRecord.tsx"
with open(f, 'r', encoding='utf-8') as file:
    content = file.read()

content = content.replace(
    'const { benhNhan, lichKhamHienTai, luotKhamHienTai, sinhHieuMoiNhat, diUng, lichSuKham } = record;',
    'const { benhNhan, luotKhamHienTai, sinhHieuMoiNhat, diUng, lichSuKham } = record;'
)

with open(f, 'w', encoding='utf-8') as file:
    file.write(content)
