import os

# Update PatientRecord.tsx
f = 'frontend/src/pages/PatientRecord.tsx'
with open(f, 'r', encoding='utf-8') as file:
    content = file.read()

# Change vitals card: remove scrollable-content
content = content.replace(
    '<div className="card-body scrollable-content">\n                        {sinhHieuMoiNhat ? (',
    '<div className="card-body">\n                        {sinhHieuMoiNhat ? ('
)

with open(f, 'w', encoding='utf-8') as file:
    file.write(content)


# Update patientRecord.css
css_file = 'frontend/src/pages/patientRecord.css'
with open(css_file, 'r', encoding='utf-8') as file:
    css = file.read()

# Reduce card header padding
css = css.replace('padding: 0.6rem 1rem;', 'padding: 0.4rem 0.8rem;')

# Vital time centering and shrinking
css = css.replace('.vital-time {\n  font-size: 0.85rem;\n  color: #64748B;\n  text-align: right;\n}', '.vital-time {\n  font-size: 0.7rem;\n  color: #94A3B8;\n  text-align: center;\n  margin-top: 8px;\n}')

# Change top-row flex behavior to take only what it needs
css = css.replace('.top-row {\n  flex: 0 1 auto;\n  display: flex;\n  gap: 1rem;\n  min-height: 0;\n  height: 40%;\n}', '.top-row {\n  flex: 0 0 auto;\n  display: flex;\n  gap: 1rem;\n  min-height: 0;\n}')

# Bottom row takes remaining space
css = css.replace('.bottom-row {\n  flex: 1;\n  min-height: 0;\n  display: flex;\n}', '.bottom-row {\n  flex: 1;\n  min-height: 0;\n  display: flex;\n}')

# Force .patient-record-container to fit
css = css.replace('.patient-record-container {\n  display: flex;', '.patient-record-container {\n  display: flex;\n  max-height: calc(100vh - 64px);')

with open(css_file, 'w', encoding='utf-8') as file:
    file.write(css)

