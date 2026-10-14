# Kiểm tra dữ liệu kê đơn

POST/PUT kê đơn dùng Bean Validation cho danh sách và từng phần tử. Chi tiết không được null; mã thuốc không rỗng, tối đa 36 ký tự; số lượng là số nguyên dương; liều lượng không rỗng, tối đa 100; hướng dẫn và lý do bỏ qua cảnh báo tối đa 255 ký tự. Đơn giá request nếu có phải không âm, phù hợp DECIMAL(12,2); giá lưu vẫn lấy từ danh mục thuốc ở backend.

Lỗi đầu vào trả 400; tài nguyên không có trả 404; xung đột ràng buộc DB trả 409; lỗi truy xuất DB khác trả 503. ID lượt khám bắt buộc khi tạo; khi cập nhật đơn, dùng ID đơn trên URL.

Cấu hình DB yêu cầu DB_URL, DB_USERNAME, DB_PASSWORD từ môi trường; không có fallback tài khoản/mật khẩu local trong bản chạy.

Regression: `mvn -B -Dtest=PrescriptionValidationWorkflowTest test`.
