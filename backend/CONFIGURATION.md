# Cấu hình MediCare Clinic

Thao tác chạy từng bước nằm trong [Hướng dẫn chạy local](../docs/HUONG_DAN_CHAY_LOCAL.md). File này giải thích cấu hình; không phải một quy trình chạy khác.

## Biến kết nối và cổng

| Biến | Ý nghĩa | Ví dụ mẫu |
| --- | --- | --- |
| DB_URL | URL JDBC đến MySQL và database đã tạo | jdbc:mysql://localhost:3306/medicare_clinic |
| DB_USERNAME | Tài khoản MySQL của người chạy | TEN_TAI_KHOAN_MYSQL_CUA_BAN |
| DB_PASSWORD | Mật khẩu MySQL của người chạy | MAT_KHAU_MYSQL_CUA_BAN |
| PORT | Cổng HTTP backend | 8082 local; 8080 mặc định prod |
| SPRING_PROFILES_ACTIVE | Chọn profile | Để không đặt khi chạy local; prod trên hosting HTTPS |

Người chạy tự đặt thông tin thật trong terminal hoặc hệ thống quản lý biến của hosting. Không commit giá trị thật. Backend không tự đọc `.env`.

Cấu hình hiện tại có giá trị DB mặc định dành cho local trong `application.properties`. Hướng dẫn chạy yêu cầu đặt rõ cả ba biến DB để không phụ thuộc các mặc định đó. Tài liệu này không thay đổi cấu hình chương trình.

Hibernate dùng `ddl-auto=validate`: schema phải tồn tại trước khi khởi động; không tự tạo/cập nhật bảng, không tự chạy migration hoặc seed. Hai script v1.2 dùng database `medicare_clinic`.

<a id="cong-local-va-proxy"></a>
## Cổng local và proxy

- Backend local: 8082.
- Frontend Vite: thường 5173; dùng URL thực tế từ terminal.
- Vite proxy `/api` mặc định tới `http://localhost:8082`.
- Profile prod/Docker mặc định 8080; PORT có thể ghi đè.

Nếu cần đổi backend local sang cổng khác, đặt PORT ở terminal backend và VITE_API_PROXY ở terminal frontend trước khi chạy Vite. Ví dụ đổi sang 8090:

```powershell
# Terminal backend, trước lệnh chạy backend
$env:PORT='8090'

# Terminal frontend, trước npm run dev
$env:VITE_API_PROXY='http://localhost:8090'
```

Không đổi đường dẫn API thành localhost cố định trong các service frontend. VITE_API_PROXY là cấu hình proxy phục vụ phát triển, không phải URL để trình duyệt gọi DB hoặc API production.

## Profile và cookie

Chạy HTTP local bằng profile mặc định, không đặt SPRING_PROFILES_ACTIVE=prod. Profile prod bật cookie Secure/HttpOnly/SameSite=Lax, phù hợp HTTPS phía sau proxy tin cậy.

Bản đóng gói phục vụ frontend và `/api` cùng origin. Nếu triển khai tách origin, cần cấu hình và kiểm chứng CORS/cookie riêng. Yêu cầu hosting nằm trong [DEPLOYMENT.md](../DEPLOYMENT.md).

Profile test dùng H2 riêng theo cấu hình test; không dùng profile này để triển khai hoặc thay MySQL khi chạy demo thông thường.

<a id="vnpay-sandbox"></a>
## VNPay Sandbox

Không bắt buộc có VNPay để khởi động các chức năng cơ bản. Khi thử thanh toán trực tuyến, backend cần:

| Biến | Nội dung |
| --- | --- |
| VNPAY_TMN_CODE | Mã merchant Sandbox do VNPay cung cấp |
| VNPAY_HASH_SECRET | Khóa ký Sandbox; chỉ lưu ở môi trường chạy |
| VNPAY_RETURN_URL | URL trình duyệt quay về sau thanh toán, phù hợp môi trường và cấu hình merchant |

Đặt các biến trước khi khởi động backend và khởi động lại nếu thay đổi. URL thanh toán mặc định trong code là `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html`.

Trang kết quả frontend có route `/payment/vnpay-return`; backend xử lý kết quả tại `/api/thanhtoan/vnpay/callback`. Giá trị Return URL phải được xác nhận theo luồng của môi trường triển khai; không dùng placeholder như URL thật. Tài liệu này chưa cung cấp quy trình đăng ký merchant hoặc xác nhận Return/IPN công khai đã được kiểm thử.

Thiếu cấu hình thì chức năng tạo liên kết VNPay báo chưa được cấu hình. Không lưu mã merchant thật, khóa ký hoặc dữ liệu giao dịch thật vào tài liệu/seed. Cấu hình đúng chưa đồng nghĩa giao dịch Sandbox đã được kiểm chứng thành công.

## Thông tin trên hóa đơn

Các biến tùy chọn `CLINIC_NAME`, `CLINIC_ADDRESS`, `CLINIC_HOTLINE`, `CLINIC_EMAIL`, `CLINIC_WEBSITE` ghi đè thông tin phòng khám trên hóa đơn. Chúng không yêu cầu thay đổi schema. Nếu không đặt, dùng giá trị mặc định của ứng dụng.
