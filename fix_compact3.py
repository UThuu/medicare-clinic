import os

css_file = 'frontend/src/pages/patientRecord.css'
with open(css_file, 'r', encoding='utf-8') as file:
    css = file.read()

# Extreme vertical optimization
css = css.replace('.form-group-inline {\n  display: flex;\n  margin-bottom: 0.8rem;\n  align-items: flex-start;\n}', '.form-group-inline {\n  display: flex;\n  margin-bottom: 4px;\n  align-items: flex-start;\n}')

css = css.replace('.form-group-inline label {\n  flex: 0 0 100px;\n  font-size: 0.9rem;', '.form-group-inline label {\n  flex: 0 0 100px;\n  font-size: 0.8rem;')

css = css.replace('.value-text {\n  flex: 1;\n  font-size: 0.9rem;', '.value-text {\n  flex: 1;\n  font-size: 0.8rem;')

css = css.replace('.mc-patient-summary {\n  background: #FFFFFF;\n  border: 1px solid #E2E8F0;\n  border-radius: 16px;\n  padding: 1rem 1.2rem;\n  margin-bottom: 0.8rem;\n}', '.mc-patient-summary {\n  background: #FFFFFF;\n  border: 1px solid #E2E8F0;\n  border-radius: 12px;\n  padding: 0.6rem 1rem;\n  margin-bottom: 0.5rem;\n}')

css = css.replace('.mc-patient-summary__header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 0.5rem;\n}', '.mc-patient-summary__header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 0.2rem;\n}')

css = css.replace('.tab-item {\n  padding: 6px 16px;\n  cursor: pointer;\n  color: #64748B;\n  font-weight: 500;\n  font-size: 0.95rem;\n  position: relative;\n}', '.tab-item {\n  padding: 4px 12px;\n  cursor: pointer;\n  color: #64748B;\n  font-weight: 500;\n  font-size: 0.85rem;\n  position: relative;\n}')

css = css.replace('.tabs-header {\n  flex: 0 0 auto;\n  display: flex;\n  border-bottom: 1px solid #E2E8F0;\n  margin-bottom: 0.5rem;\n}', '.tabs-header {\n  flex: 0 0 auto;\n  display: flex;\n  border-bottom: 1px solid #E2E8F0;\n  margin-bottom: 0.3rem;\n}')

css = css.replace('.patient-record-container {\n  display: flex;\n  max-height: calc(100vh - 64px);\n  flex-direction: column;\n  height: 100%;\n  width: 100%;\n  padding: 0.8rem 1.2rem;\n  font-family: \'Inter\', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;\n  color: #334155;\n  background-color: #F8FAFC;\n  overflow: hidden;\n}', '.patient-record-container {\n  display: flex;\n  max-height: calc(100vh - 64px);\n  flex-direction: column;\n  height: 100%;\n  width: 100%;\n  padding: 0.5rem 1rem;\n  font-family: \'Inter\', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;\n  color: #334155;\n  background-color: #F8FAFC;\n  overflow: hidden;\n}')

css = css.replace('.mc-patient-summary__name {\n  margin: 0 0 6px 0;\n  font-size: 1.2rem;', '.mc-patient-summary__name {\n  margin: 0 0 4px 0;\n  font-size: 1.1rem;')

css = css.replace('.vital-box {\n  background: #F8FAFC;\n  border: 1px solid #E2E8F0;\n  padding: 8px;\n  font-weight: 600;\n  font-size: 1.1rem;\n  color: #0F172A;\n  border-radius: 8px;\n  margin-bottom: 4px;\n}', '.vital-box {\n  background: #F8FAFC;\n  border: 1px solid #E2E8F0;\n  padding: 4px;\n  font-weight: 600;\n  font-size: 1rem;\n  color: #0F172A;\n  border-radius: 6px;\n  margin-bottom: 2px;\n}')

css = css.replace('.vital-label {\n  display: block;\n  font-size: 0.85rem;\n  color: #64748B;\n  margin-bottom: 6px;\n}', '.vital-label {\n  display: block;\n  font-size: 0.75rem;\n  color: #64748B;\n  margin-bottom: 2px;\n}')

css = css.replace('.vitals-grid {\n  display: flex;\n  gap: 1rem;\n  margin-bottom: 1rem;\n}', '.vitals-grid {\n  display: flex;\n  gap: 0.5rem;\n  margin-bottom: 0.2rem;\n}')

css = css.replace('.btn-large {\n  padding: 6px 16px;\n  font-size: 0.85rem;\n  border-radius: 8px;\n}', '.btn-large {\n  padding: 4px 12px;\n  font-size: 0.8rem;\n  border-radius: 6px;\n}')

css = css.replace('.card-body {\n  padding: 0.4rem 0.8rem;\n}', '.card-body {\n  padding: 0.3rem 0.6rem;\n}')

css = css.replace('.card-footer {\n  flex: 0 0 auto;\n  padding: 0.6rem 1rem;\n  border-top: 1px solid #E2E8F0;\n}', '.card-footer {\n  flex: 0 0 auto;\n  padding: 0.4rem 0.6rem;\n  border-top: 1px solid #E2E8F0;\n}')

css = css.replace('.card-header {\n  flex: 0 0 auto;\n  padding: 0.4rem 0.8rem;\n  border-bottom: 1px solid #E2E8F0;\n}', '.card-header {\n  flex: 0 0 auto;\n  padding: 0.3rem 0.6rem;\n  border-bottom: 1px solid #E2E8F0;\n}')

with open(css_file, 'w', encoding='utf-8') as file:
    file.write(css)

