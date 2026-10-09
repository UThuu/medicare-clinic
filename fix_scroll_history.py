import os

css_file = 'frontend/src/pages/patientRecord.css'
with open(css_file, 'r', encoding='utf-8') as file:
    css = file.read()

# Make history card scrollable internally
if '.history-card {' not in css:
    css += '''
.bottom-row {
  flex: 1;
  min-height: 0;
  display: flex;
  overflow: hidden;
}
.history-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}
.history-card .card-body {
  overflow-y: auto;
  flex: 1;
  min-height: 0;
  padding: 0;
}
.history-card .mc-table {
  margin: 0;
}
.history-card .mc-table th {
  position: sticky;
  top: 0;
  z-index: 1;
  background: #F8FAFC;
}
'''
else:
    print("Already added history card css")

with open(css_file, 'w', encoding='utf-8') as file:
    file.write(css)

