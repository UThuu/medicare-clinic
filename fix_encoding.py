import os

f2 = 'frontend/src/components/common/PatientSummary.tsx'
with open(f2, 'r', encoding='utf-8') as file:
    content = file.read()

content = content.replace('Hon tt', 'Hoàn tất')
content = content.replace('Đang khám', 'Đang khám') # just in case
content = content.replace('Chờ khám', 'Chờ khám')
content = content.replace('Đã tiếp nhận', 'Đã tiếp nhận')

with open(f2, 'w', encoding='utf-8') as file:
    file.write(content)
