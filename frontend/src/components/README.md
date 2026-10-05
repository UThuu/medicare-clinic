# Shared UI — TV3

Shared UI này bám theo MediCare Clinic Mini Design System trong Figma của nhóm.

## Design tokens
- Font: Arial, sans-serif
- Primary: #0F8B8D / #0B7F81 / #0B6F71
- Success: #22A06B
- Warning: #E7A008
- Error: #D64545
- Secondary: #64748B
- Input/Button radius: 8px
- Card radius: 12px
- Pill radius: 999px
- Layout spacing: 8 / 16 / 24 / 32 / 40 / 48 / 64px

## Components
- Layout: Header, Sidebar, MainLayout
- Common: Button, Input, Select, Modal, ConfirmDialog, Table, SearchBox, StatusBadge, Card

## Scope rule
Các component chỉ chứa UI dùng chung. Không đặt business logic của UC02–UC05 hoặc UC27 vào Shared UI.

## Integration
Chưa chỉnh `main.tsx`, `routes/*`, `package.json` hoặc các file conflict-prone của nhóm. TV1 cần phối hợp trước khi tích hợp vào entry/router chung.
