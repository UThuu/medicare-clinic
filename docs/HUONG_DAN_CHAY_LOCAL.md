# Hướng Dẫn Chạy Môi Trường Local

Tài liệu này cung cấp các bước cần thiết để thiết lập và chạy hệ thống Medicare Clinic trên môi trường máy tính cá nhân.

## 1. Yêu cầu Môi trường
- **Java**: JDK 17
- **Node.js**: v18 trở lên (khuyến nghị v20)
- **Database**: MySQL 8.0
- **Hệ điều hành**: Windows/macOS/Linux

## 2. Cấu hình Cơ sở dữ liệu (MySQL)
1. Tạo một database trên MySQL local.
2. Cấu hình thông tin kết nối (url, username, password) trong file \ackend/src/main/resources/application.properties\ (Hoặc \pplication.yml\). **Lưu ý:** Không push thông tin kết nối cá nhân lên repository.
3. Thiết lập dữ liệu:
   - **Đối với database mới:** Chạy script \database/schema_v1.2.sql\ để tạo bảng, sau đó chạy \database/seed_v1.2.sql\ để nạp dữ liệu khởi tạo.
   - **Đối với database đã có sẵn (đã chạy seed cũ):** Chạy script \database/migration/update_demo_password_hash.sql\ để cập nhật lại hash mật khẩu (BCrypt) cho các tài khoản mẫu.

## 3. Khởi chạy Ứng dụng

Mở **hai terminal riêng biệt** để chạy backend và frontend.

### Chạy Backend
Mở terminal 1 và thực thi:
\\\ash
cd backend
./mvnw spring-boot:run
\\\
Backend sẽ khởi chạy trên cổng **8080**.

### Chạy Frontend
Mở terminal 2 (Nếu dùng Windows PowerShell, sử dụng lệnh \
pm.cmd\):
\\\powershell
cd frontend
npm.cmd install
npm.cmd run dev
\\\
Vite sẽ in ra một địa chỉ (thường là \http://localhost:5173\). Hãy mở địa chỉ này bằng trình duyệt. Vite đã được cấu hình proxy để tự động chuyển tiếp các request \/api\ sang backend \8080\.

## 4. Tài khoản Mẫu (Đăng nhập)
Các tài khoản mẫu sau đã được xác nhận hoạt động với mật khẩu đã cập nhật:
- **Tên đăng nhập (Bác sĩ):** \s_an\ hoặc \s_nam\
- **Mật khẩu:** \Medicare@123\

> **Ghi chú:** Không sử dụng \s01\ vì dữ liệu seed chưa ánh xạ chính xác với mã này. Chỉ dùng các tài khoản đã liệt kê ở trên.