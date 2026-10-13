# Hướng dẫn chạy MediCare Clinic trên máy cá nhân

Cách chạy trong tài liệu: **MySQL local**, backend tại **8082**, frontend qua Vite (thường **5173**), không dùng profile prod.

## 1. Chuẩn bị

- Git.
- Java JDK 17.
- Node.js 20 và npm.
- MySQL 8.0; MySQL Workbench để thực thi SQL theo các bước bên dưới.

Không cần Maven riêng vì backend có Maven Wrapper. Kiểm tra `java -version`, `node -v`, `npm -v` và `git --version`.

## 2. Lấy mã nguồn

```powershell
git clone --branch develop https://github.com/UThuu/medicare-clinic.git
cd medicare-clinic
```

Các lệnh tiếp theo giả định bạn đang đứng tại thư mục gốc `medicare-clinic` sau bước này.

## 3. Tạo bảng và nạp dữ liệu mẫu

Dùng một MySQL local riêng cho chạy thử, không kết nối Railway hoặc database thật.

1. Mở MySQL Workbench, kết nối MySQL local của bạn.
2. Chọn File → Open SQL Script, mở `database/schema_v1.2.sql`.
3. Script tự tạo và chọn database **medicare_clinic** bằng `CREATE DATABASE IF NOT EXISTS` và `USE`. Kiểm tra database này chưa có bảng/dữ liệu cần giữ; chạy toàn bộ script bằng nút Execute.
4. Mở `database/seed_v1.2.sql` và chạy toàn bộ sau khi schema thành công. Seed cũng dùng `USE medicare_clinic`.
5. Refresh Schemas; kiểm tra database có bảng và dữ liệu.

Không cần tạo một database tên khác trước rồi chạy nguyên script: các câu `USE` sẽ vẫn chọn `medicare_clinic`. Hướng dẫn này giữ đúng tên database trong hai script.

Schema và seed dùng ID cố định, không phải bộ lệnh reset. Không chạy lại trên database đã nạp rồi. Nếu báo trùng bảng/khóa, kiểm tra database đang dùng trước khi tiếp tục; không xóa database có dữ liệu cần giữ.

Hiện dùng một bộ **seed_v1.2.sql**. Chưa có hướng dẫn nạp các bộ seed bổ sung. Script `database/migration/update_demo_password_hash.sql` dành cho trường hợp cập nhật mật khẩu seed cũ, không phải bước bắt buộc khi nạp seed mới.

## 4. Đặt cấu hình và chạy backend

### Windows PowerShell

Mở terminal thứ nhất tại thư mục gốc:

```powershell
cd backend
$env:DB_URL='jdbc:mysql://localhost:3306/medicare_clinic'
$env:DB_USERNAME='TEN_TAI_KHOAN_MYSQL_CUA_BAN'
$env:DB_PASSWORD='MAT_KHAU_MYSQL_CUA_BAN'
$env:PORT='8082'
Remove-Item Env:SPRING_PROFILES_ACTIVE -ErrorAction SilentlyContinue
.\mvnw.cmd spring-boot:run
```

Thay tài khoản/mật khẩu mẫu bằng thông tin của MySQL local; đổi 3306 nếu MySQL của bạn dùng cổng khác. Không cần lưu thông tin thật vào file được track bởi Git.

### macOS/Linux (bash)

```bash
cd backend
export DB_URL='jdbc:mysql://localhost:3306/medicare_clinic'
export DB_USERNAME='TEN_TAI_KHOAN_MYSQL_CUA_BAN'
export DB_PASSWORD='MAT_KHAU_MYSQL_CUA_BAN'
export PORT='8082'
unset SPRING_PROFILES_ACTIVE
bash ./mvnw spring-boot:run
```

Các biến chỉ áp dụng cho terminal hiện tại và các tiến trình được chạy từ nó. Mở terminal mới thì đặt lại biến. Một file `.env` không được Spring Boot tự nạp trong cách chạy này.

Chờ log xác nhận ứng dụng khởi động thành công và lắng nghe ở 8082. Backend dùng `ddl-auto=validate`: không tự tạo bảng hoặc chạy seed. Không bật profile `prod` trên HTTP local vì profile này dùng cookie Secure.

## 5. Chạy frontend

Giữ backend đang chạy. Mở terminal thứ hai tại thư mục gốc:

```powershell
cd frontend
npm ci
npm run dev
```

Trên macOS/Linux dùng cùng các lệnh. Nếu PowerShell chặn `npm.ps1`, dùng `npm.cmd ci` và `npm.cmd run dev`.

Mở URL Vite in trong terminal, thường là **http://localhost:5173/login**. Nếu Vite chọn cổng khác, dùng URL thực tế được in ra.

Vite chuyển tiếp `/api` tới **http://localhost:8082**. Giữ backend ở 8082 theo hướng dẫn để không phải sửa proxy. Nếu chủ động đổi cổng, xem [Cấu hình backend](../backend/CONFIGURATION.md#cong-local-va-proxy).

## 6. Tài khoản mẫu

Seed khai báo mật khẩu chung **Medicare@123** cho các tài khoản dưới đây. Danh sách được đối chiếu từ seed; cần thử đăng nhập trong môi trường chạy thực tế để xác nhận toàn bộ luồng.

| Vai trò | Tài khoản đang hoạt động |
| --- | --- |
| Bác sĩ | bs_an, bs_nam, bs_ha |
| Điều dưỡng | dd_nhu, dd_thang |
| Lễ tân | lt_lan, lt_tu |
| Thu ngân | tn_yen |
| Bệnh nhân | bn_quyet, bn_oanh |

`tn_huy` và `bn_dung` bị khóa trong seed, không dùng để thử đăng nhập thành công. Mật khẩu demo chỉ dùng cho môi trường dữ liệu giả.

## 7. Quan sát dữ liệu mẫu

Seed dùng `CURDATE()`, `DATE_ADD` và `DATE_SUB`: ngày demo được tính theo **ngày của MySQL lúc nạp seed**, không tự chuyển sang ngày mới khi bạn mở web vào hôm sau.

| Tình huống | Dữ liệu trong seed |
| --- | --- |
| Bác sĩ bs_an xem lịch | LK007, LK008 ở ngày nạp; LK001 ở ngày sau ngày nạp |
| Điều dưỡng ghi nhận sinh hiệu | LK005/LUK002, bệnh nhân BN002: CHO_KHAM và chưa có sinh hiệu |
| Bác sĩ bs_ha xem lượt đang khám | LK006/LUK003, bệnh nhân BN003: DANG_KHAM, đã có sinh hiệu và triệu chứng có sẵn |
| Quan sát lịch sử khám | LK004/LUK001 ở ngày trước ngày nạp |
| Lượt hoàn tất | LUK001, LUK004, LUK005, LUK006; kiểm tra hóa đơn đã có trước khi thử lập thêm |

Dashboard mặc định ngày hôm nay có thể trống nếu seed được nạp ngày trước. Dùng bộ lọc ngày ở màn hình có hỗ trợ để xem đúng ngày nạp. Với màn hình chỉ xem ngày hiện tại, chuẩn bị database demo mới vào ngày thử; không nạp chồng seed lên dữ liệu cũ.

Seed chưa chứng minh luồng mới khám → hoàn tất → hóa đơn đã nối đầy đủ. UC11–14 và UC26 chưa hoàn thành; không dùng chúng làm bước bắt buộc trong kịch bản demo hiện tại.

## 8. Dừng, chạy lại và kiểm tra

Bấm Ctrl + C trong từng terminal để dừng. Khi chạy lại, đặt biến backend nếu terminal mới rồi chạy lệnh khởi động; frontend chỉ cần `npm run dev`. Chạy `npm ci` lại khi dependency thay đổi. Không nạp lại schema/seed mỗi lần chạy.

Các lệnh kiểm tra từ thư mục tương ứng:

```powershell
# Trong backend/
.\mvnw.cmd test
.\mvnw.cmd package

# Trong frontend/
npm test
npm run build
```

Trên macOS/Linux dùng `bash ./mvnw test` và `bash ./mvnw package`. Test có cấu hình riêng; không đặt DB_URL trỏ vào database thật để thử nghiệm.

## 9. Xử lý lỗi thường gặp

| Hiện tượng | Kiểm tra |
| --- | --- |
| Không kết nối được DB | MySQL đang chạy; URL, cổng, tài khoản, mật khẩu và quyền truy cập DB |
| Thiếu bảng/sai schema | Schema đã chạy xong trên medicare_clinic; không chỉ nạp seed |
| Lỗi 500 hoặc proxy không kết nối | Log backend; backend đã chạy ở 8082; Vite proxy đúng cổng |
| Không đăng nhập được | Đúng tài khoản hoạt động, mật khẩu theo seed; không bật prod trên HTTP local |
| Dashboard trống | Ngày nạp seed và ngày đang xem, vai trò và bác sĩ của lịch |
| Trùng bảng/ID khi nạp SQL | Database đã có dữ liệu; dừng và kiểm tra trước khi chạy lại |
| Cổng bị chiếm | Dừng tiến trình của bạn đang dùng cổng; không đổi riêng backend mà quên proxy |

## 10. VNPay và Docker

Không cần cấu hình VNPay để khởi động và thử đặt lịch, tiếp nhận, sinh hiệu hoặc khám. Khởi tạo thanh toán VNPay cần cấu hình Sandbox riêng; xem [Cấu hình VNPay](../backend/CONFIGURATION.md#vnpay-sandbox). Không dùng khóa giả để kết luận giao dịch hoạt động.

Cách đóng gói/triển khai Docker nằm trong [DEPLOYMENT.md](../DEPLOYMENT.md). Docker chạy profile prod và không tương đương cách chạy HTTP local trong tài liệu này.
