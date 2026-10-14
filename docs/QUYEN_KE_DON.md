# Quyền kê đơn

API `/api/don-thuoc` dành cho bác sĩ. Danh mục thuốc yêu cầu vai trò BAC_SI; xem lượt khám, cảnh báo dị ứng, tạo/sửa/in đơn yêu cầu đúng bác sĩ phụ trách lượt khám. Danh tính lấy từ session AUTH_USER, không lấy từ request body.

Không đăng nhập: 401. Sai vai trò hoặc không phụ trách: 403. Không tìm thấy lượt khám/đơn: 404. ID không hợp lệ: 400. Bệnh nhân xem đơn của mình qua hồ sơ y tế cá nhân, không dùng endpoint kê đơn để sửa.

Regression: `mvn -B -Dtest=PrescriptionAccessWorkflowTest test`. Test dùng H2 riêng, kiểm tra các vai trò khác, bác sĩ khác, bác sĩ phụ trách và truy cập ẩn danh.
