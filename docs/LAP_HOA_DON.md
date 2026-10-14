# Lập hóa đơn và bàn giao

Frontend khóa handler xác nhận bằng ref ngay khi gửi, hiển thị trạng thái đang xử lý và mở khóa trong finally. Một thao tác không gửi request lặp khi state chưa render lại. Lỗi nghiệp vụ lấy message/error từ API; lỗi kết nối có thông báo riêng. Backend tiếp tục khóa lượt khám và ràng buộc một hóa đơn cho một lượt.

Danh sách hóa đơn bệnh nhân được truy vấn/ánh xạ trong service và lọc theo bệnh nhân từ session. Controller không truy cập Repository trực tiếp. Repository dùng entity graph lấy dữ liệu hóa đơn/chi tiết liên quan.

Đã bỏ component chỉ export nhưng không được dùng: ConfirmDialog, AllergyWarning, PatientContextHeader, SearchSelect; bỏ ChiTietHoaDonRepository vì chi tiết được lưu bằng cascade. LichSuSinhHieuRepository được giữ cho lịch sử cập nhật.

Kiểm tra FE: `npm test` và `npm run build`; test gửi lặp/lỗi nằm ở billing.test.cjs. Test thanh toán cũ được cập nhật theo attempt thật và dữ liệu snapshot.

Seed chính: schema_v1.2.sql rồi seed_v1.2.sql trên MySQL sạch. seed_demo_presentation.sql là dữ liệu bổ sung chạy tay (ngày 13-16/10/2026, kích hoạt tn_huy). docs/seed_uc11_test_data.sql chạy tay, có cập nhật tên/chuyên khoa NV001 và thuốc có ID trùng; chỉ dùng DB demo riêng. Không nạp lại hoặc trộn seed trên dữ liệu cần giữ. Migration V1.1 -> V1.2 là script cho DB cũ, không chạy sau schema v1.2.
