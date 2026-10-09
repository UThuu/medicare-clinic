import os

css_file = 'frontend/src/pages/patientRecord.css'
with open(css_file, 'r', encoding='utf-8') as file:
    css_content = file.read()

# Reduce card footer padding
css_content = css_content.replace('padding: 1rem 1.2rem;', 'padding: 0.6rem 1rem;')

# Reduce body padding
css_content = css_content.replace('padding: 1rem 1.2rem;', 'padding: 0.6rem 1rem;')

# Further reduce Patient summary margin if needed
css_content = css_content.replace('.patient-summary-wrapper {\n  flex: 0 0 auto;\n  margin-bottom: 0.8rem;\n}', '.patient-summary-wrapper {\n  flex: 0 0 auto;\n  margin-bottom: 0.4rem;\n}')

with open(css_file, 'w', encoding='utf-8') as file:
    file.write(css_content)
