# Lịch sử sửa sinh hiệu

Mỗi PUT `/api/sinh-hieu/luot-kham/{id}` hợp lệ ghi một bản `lich_su_sinh_hieu`: chỉ số trước/sau, thời gian và mã điều dưỡng đang đăng nhập. `sinh_hieu.ma_dieu_duong` vẫn là người đo ban đầu. Không nhận danh tính người sửa từ client.

Khóa bản ghi sinh hiệu khi sửa; ghi lịch sử và cập nhật chỉ số trong cùng transaction. Dữ liệu không hợp lệ không đổi sinh hiệu hoặc thêm lịch sử. Dùng bảng đã có trong schema v1.2, không cần migration mới. Quy tắc trạng thái lượt khám được giữ nguyên; nếu cần khóa sửa sau HOAN_TAT phải chốt riêng với nhóm.

Regression: `mvn -B -Dtest=VitalsHistoryWorkflowTest test`.
