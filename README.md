# MediCare Clinic – Hệ thống quản lý phòng khám

MediCare Clinic là ứng dụng web được xây dựng nhằm số hóa quy trình quản lý phòng khám, từ đặt lịch, tiếp nhận và thăm khám đến kê đơn, lập hóa đơn và thanh toán. Hệ thống tổ chức chức năng theo năm vai trò: lễ tân, điều dưỡng, bác sĩ, thu ngân và bệnh nhân.

## Phạm vi chức năng

| Vai trò | Chức năng |
| --- | --- |
| Lễ tân | Tìm kiếm và tạo hồ sơ bệnh nhân, tiếp nhận bệnh nhân, xem danh sách chờ, đặt lịch khám tại quầy |
| Điều dưỡng | Xem hàng chờ, xác nhận bệnh nhân, ghi nhận và cập nhật sinh hiệu |
| Bác sĩ | Xem lịch khám, hồ sơ, lịch sử khám và sinh hiệu; ghi kết quả khám; tạo/cập nhật đơn thuốc, cảnh báo dị ứng và in đơn thuốc |
| Thu ngân | Lập hóa đơn, tính tổng chi phí, thanh toán tiền mặt hoặc QR/ngân hàng, in và tra cứu hóa đơn, xem tổng doanh thu |
| Bệnh nhân | Đặt lịch trực tuyến, xem thông báo/nhắc lịch, xem hồ sơ y tế cá nhân và thanh toán trực tuyến |

Người dùng đăng nhập để truy cập các chức năng phù hợp với vai trò. Thông báo xác nhận và nhắc lịch được hiển thị trên hệ thống.

## Công nghệ sử dụng

| Thành phần | Công nghệ |
| --- | --- |
| Frontend | React, TypeScript, Vite |
| Backend | Java 17, Spring Boot 3.1.5 |
| Truy xuất dữ liệu | Spring Data JPA, Hibernate |
| Database | MySQL 8.0 |
| Giao tiếp | REST API, JSON |
| Xác thực | Cookie phiên, BCrypt cho mật khẩu |
| Build và đóng gói | Maven Wrapper, npm, Docker |
| Thanh toán thử nghiệm | VNPay Sandbox |

## Kiến trúc

Dự án sử dụng kiến trúc ba lớp:

- **Giao diện/API:** React và Spring Boot Controller tiếp nhận thao tác, request và trả kết quả.
- **Nghiệp vụ:** Service xử lý điều kiện, phân quyền và quy trình nghiệp vụ.
- **Truy xuất dữ liệu:** Repository, Entity/JPA và MySQL đọc, lưu dữ liệu.

Luồng xử lý: **React → Controller → Service → Repository/JPA → MySQL**.

## Chạy trên máy cá nhân

Chuẩn bị Git, Java JDK 17, Node.js 20 và MySQL 8.0. Backend có Maven Wrapper nên không cần cài Maven riêng.

Lấy mã nguồn nhánh tích hợp:

```bash
git clone --branch develop https://github.com/UThuu/medicare-clinic.git
cd medicare-clinic
```

Thực hiện theo [Hướng dẫn chạy local](docs/HUONG_DAN_CHAY_LOCAL.md), gồm:

1. Tạo bảng và nạp dữ liệu mẫu.
2. Đặt biến môi trường kết nối MySQL.
3. Chạy backend và frontend ở hai terminal riêng.
4. Mở web và đăng nhập bằng tài khoản mẫu.

Cách chạy local dùng backend ở **8082** và frontend qua Vite, thường ở **5173**. Cấu hình VNPay riêng chỉ cần khi thử thanh toán trực tuyến.

## Cấu trúc dự án

| Đường dẫn | Nội dung |
| --- | --- |
| backend/ | API, xử lý nghiệp vụ, truy xuất dữ liệu và kiểm thử backend |
| frontend/ | Giao diện, component dùng chung, gọi API và kiểm thử frontend |
| database/ | Schema, dữ liệu mẫu và script cập nhật |
| docs/ | Tài liệu hướng dẫn dự án |
| Dockerfile | Đóng gói frontend và backend vào image chạy ứng dụng |

## Tài liệu hướng dẫn

- [Chạy local](docs/HUONG_DAN_CHAY_LOCAL.md): hướng dẫn khởi động, tài khoản và dữ liệu demo.
- [Cấu hình backend](backend/CONFIGURATION.md): biến môi trường, cổng, profile và VNPay.
- [Docker/hosting](DEPLOYMENT.md): hướng dẫn đóng gói và cấu hình triển khai.
- [Cấu trúc dự án](PROJECT_STRUCTURE.txt): kiến trúc và quy ước tổ chức mã nguồn.

## Quản lý mã nguồn và cấu hình

`develop` là nhánh tích hợp chung. Các thay đổi cần được kiểm tra diff và build/test phù hợp trước khi tích hợp.

Người chạy tự cung cấp thông tin kết nối database và khóa thanh toán qua môi trường chạy. Không commit mật khẩu DB, khóa bí mật, token, cookie phiên hoặc cấu hình cá nhân. Dữ liệu seed dùng cho chạy thử; không nạp vào database thật.
