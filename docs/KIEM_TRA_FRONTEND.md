# Kiểm tra frontend

Cần Node ^20.19.0, ^22.13.0 hoặc >=24 (xem engines trong package.json). Cài từ lockfile bằng npm ci. Các lệnh: npm test, npm run lint, npm run build; PowerShell có thể dùng npm.cmd nếu npm.ps1 bị chặn.

ESLint dùng flat config với parser TypeScript, kiểm tra lỗi JavaScript cơ bản, biến không dùng và Rules of Hooks. TypeScript tiếp tục strict/noUnusedLocals/noUnusedParameters. Quy tắc định dạng, exhaustive-deps và loại bỏ toàn bộ explicit any là các cải tiến riêng, không được báo là đã kiểm tra trong lần cấu hình này.

Dependency frontend được chốt phiên bản trong lockfile; chạy lại npm audit để theo dõi advisory. Vite và React Router đã nâng phiên bản sửa advisory trong đợt rà soát; cần chạy test/build sau khi tích hợp các nhánh.

Tài liệu cấu hình tham khảo: https://typescript-eslint.io/getting-started/ và https://eslint.org/docs/latest/use/configure/configuration-files.
