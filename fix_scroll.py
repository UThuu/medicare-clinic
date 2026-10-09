import os

f = 'frontend/src/pages/PatientRecord.tsx'
with open(f, 'r', encoding='utf-8') as file:
    content = file.read()

content = content.replace(
    '<style>{.mc-main { padding: 0 !important; display: flex; flex-direction: column; overflow: hidden; }}</style>',
    '<style>{.mc-shell { height: calc(100vh - 64px); overflow: hidden; } .mc-main { padding: 0 !important; display: flex; flex-direction: column; overflow: hidden; height: 100%; }}</style>'
)

with open(f, 'w', encoding='utf-8') as file:
    file.write(content)

css_file = 'frontend/src/pages/patientRecord.css'
with open(css_file, 'r', encoding='utf-8') as file:
    css_content = file.read()

# Reduce card header padding
css_content = css_content.replace('padding: 1rem 1.2rem;', 'padding: 0.6rem 1rem;')

# Reduce tab padding and margin
css_content = css_content.replace('padding: 8px 16px;', 'padding: 6px 16px;')
css_content = css_content.replace('margin-bottom: 1.5rem;', 'margin-bottom: 0.5rem;')

# Reduce breadcrumb margin
css_content = css_content.replace('margin-bottom: 0.8rem;', 'margin-bottom: 0.4rem;')

with open(css_file, 'w', encoding='utf-8') as file:
    file.write(css_content)
