import os

css_file = 'frontend/src/pages/patientRecord.css'
with open(css_file, 'r', encoding='utf-8') as file:
    css = file.read()

# Reduce card body padding
css = css.replace('.card-body {\n  padding: 0.6rem 1rem;\n}', '.card-body {\n  padding: 0.4rem 0.8rem;\n}')

# Ensure button isn't too tall
css = css.replace('.btn-large {\n  padding: 8px 16px;\n  font-size: 0.95rem;\n  border-radius: 8px;\n}', '.btn-large {\n  padding: 6px 16px;\n  font-size: 0.85rem;\n  border-radius: 8px;\n}')

with open(css_file, 'w', encoding='utf-8') as file:
    file.write(css)

