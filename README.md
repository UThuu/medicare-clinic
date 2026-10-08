# MediCare Clinic – Hệ thống Quản lý Phòng khám

MediCare Clinic là dự án xây dựng hệ thống quản lý phòng khám, hướng tới số hóa các quy trình từ đặt lịch, tiếp nhận bệnh nhân, khám bệnh, kê đơn thuốc đến thanh toán viện phí.

---

## Công nghệ sử dụng
- **Frontend:** React + TypeScript
- **Build/Development Tool:** Vite
- **Backend:** Java 17 + Spring Boot 3.1.5
- **Database:** MySQL
- **ORM:** Spring Data JPA / Hibernate
- **API:** REST + JSON
- **Authentication/Authorization:** Chưa triển khai hoàn chỉnh.
- **Payment:** Hệ thống hiện sử dụng abstraction `PaymentGateway` chung; Payment provider chưa quyết định.

---

## Kiến trúc tổng quan
Dự án được xây dựng bám sát **Kiến trúc 3 lớp (3-Layer Architecture)**:

```text
[PRESENTATION LAYER]
React UI + Spring Boot Controller
   ↓
[BUSINESS LOGIC LAYER]
Service Interface + Service Impl
   ↓
[DATA ACCESS LAYER]
Repository + Entity + MySQL
```

Luồng xử lý:
```text
React UI
   ↓ HTTP / JSON
Controller
   ↓
Service Interface
   ↓
Service Implementation
   ↓
Repository
   ↓
Entity / JPA
   ↓
MySQL
```

---

## Cấu trúc project
- `backend/`: Source code Spring Boot backend.
- `frontend/`: Source code React frontend.
- `database/`: Các script SQL khởi tạo schema, dữ liệu mẫu (seed).
- `docs/`: Tài liệu thiết kế chính thức (Use Case, ERD, Sequence Diagram...).
- `context/`: Các bản tóm tắt, quy tắc nghiệp vụ nhanh để nắm bắt project.
- `tests/`: Thư mục tài nguyên và test chung.
- `README.md`: File hướng dẫn cài đặt và chạy project.
- `PROJECT_STRUCTURE.txt`: Hướng dẫn chi tiết cấu trúc code và quy tắc lập trình.

👉 **Xem `PROJECT_STRUCTURE.txt` để hiểu chi tiết chức năng từng package, layer và quy tắc implement Use Case.**

---

## Yêu cầu môi trường
Để chạy được toàn bộ dự án trên máy cá nhân, thành viên cần cài đặt:
- **Git**
- **Java JDK 17**
- **Node.js** và **npm**
- **MySQL**

Có thể kiểm tra nhanh bằng các lệnh sau:
```bash
java -version
node -v
npm -v
git --version
mvn -version
```

*Lưu ý về Maven:* Maven Wrapper của backend đã được cài đặt và kiểm tra thành công (PASS). Thành viên nên ưu tiên sử dụng Maven Wrapper (`mvnw`) để đảm bảo đồng bộ version trong toàn dự án.

---

## Clone project
Sử dụng Git để kéo mã nguồn về máy:
```bash
git clone <REPOSITORY_URL>
cd medicare-clinic
```

---

## Chạy Frontend
Frontend skeleton đã được tạo và kiểm tra build (PASS).

```bash
cd frontend
npm install
npm run dev
```

Để build ra bản production:
```bash
npm run build
```

---

## Chạy Backend
Khuyến nghị sử dụng Maven Wrapper để chạy dự án.

- **Trên Windows:**
```cmd
cd backend
.\mvnw.cmd clean compile
.\mvnw.cmd test
.\mvnw.cmd spring-boot:run
```

- **Trên macOS/Linux:**
```bash
cd backend
./mvnw clean compile
./mvnw test
./mvnw spring-boot:run
```
*(Bạn cũng có thể sử dụng Maven global `mvn` nếu máy đã cài đặt sẵn).*

---

## Database
Hệ thống sử dụng **MySQL**.
Hãy xem thư mục `database/` để tìm file `schema.sql` (và các script `seed.sql`) khi chúng được hoàn thiện. 

---

## Cấu hình môi trường
**Tuyệt đối KHÔNG commit các thông tin sau**:
- Database password
- API key
- Token/secret
- Payment secret
- Credential cá nhân

**Backend:** Ưu tiên sử dụng biến môi trường hệ thống hoặc cấu hình local không commit. Chỉ commit file cấu hình mẫu như `.env.example` nếu cần.
**Frontend:** Có thể sử dụng file `.env` local khi cần.

---

## Git workflow
- Nhánh `main`: **Không push trực tiếp lên main.**
- Nhánh `develop`: Nhánh làm việc chung. Sau khi tính năng hoàn thành và kiểm tra mới merge về develop.
- Nhánh `feature`: Tạo từ develop. Ví dụ: `feature/uc-xx-ten-chuc-nang`

**Commit convention:**
```text
feat(scope): mô tả ngắn gọn #UC-XX
```
Nếu chưa xác định UC ID thì không tự phát minh.

---

## Trạng thái hiện tại
Dự án hiện đang ở giai đoạn **Initial Project Skeleton** (Khởi tạo bộ khung), không phải phiên bản hệ thống hoàn chỉnh.
- Project structure: **PASS**
- 3-Layer Architecture: **PASS**
- Frontend skeleton: **PASS**
- Frontend build: **PASS**
- Backend skeleton: **PASS**
- Backend compile: **PASS**
- Backend test phase: **PASS** (Lưu ý: Chỉ vòng đời test của Maven chạy thành công, hiện tại chưa có test case nghiệp vụ thực tế)
- Maven Wrapper: **PASS**
- Entity mapping: Chưa hoàn thiện
- Business logic: Chưa implement
- Authentication/Authorization: Chưa triển khai hoàn chỉnh
- Payment provider: Chưa quyết định

---

## Tài liệu
- `README.md` → Setup và chạy project
- `PROJECT_STRUCTURE.txt` → Hiểu cấu trúc source code và quy tắc code
- `context/` → Context và business rule quan trọng
- `docs/` → Tài liệu thiết kế chính thức

**Trình tự đọc khuyến nghị cho thành viên mới:**
`README.md` ➔ `PROJECT_STRUCTURE.txt` ➔ `context/` ➔ Tài liệu Use Case được giao ➔ Source code.

---

## Lưu ý cho thành viên
- Không tự ý thay đổi architecture chung.
- Không tự phát minh Entity/table/field/business rule.
- Luôn đối chiếu tài liệu trước khi implement Use Case.
- Nếu tài liệu có sự mâu thuẫn, trao đổi với nhóm trước khi code.
- Không commit secret.

## Hu?ng d?n c�i d?t v� ch?y ?ng d?ng

Vui l�ng xem chi ti?t t?i: [Hu?ng d?n ch?y local](docs/HUONG_DAN_CHAY_LOCAL.md)

