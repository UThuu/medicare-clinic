-- ==============================================================================
-- Migration: Cập nhật mật khẩu mẫu (hash BCrypt hợp lệ)
-- Mô tả: Thay thế hash giữ chỗ '$2a$10$demoHashPlaceholderChoTatCaTaiKhoan'
--        bằng BCrypt hash của 'Medicare@123' cho 12 tài khoản mẫu.
--        Chỉ cập nhật những tài khoản chưa bị đổi mật khẩu.
-- 
-- Hướng dẫn chạy:
-- Nếu database local của bạn đã có sẵn dữ liệu từ seed cũ, hãy chạy thủ công 
-- file này trên database (ví dụ: thông qua MySQL Workbench, DBeaver, phpMyAdmin, 
-- hoặc dòng lệnh mysql). 
-- Lưu ý: File này KHÔNG tự động chạy. Nếu bạn tạo database mới từ đầu,
-- chỉ cần chạy schema và seed mới nhất, không cần chạy file này.
-- ==============================================================================

USE medicare_clinic;

START TRANSACTION;

UPDATE tai_khoan 
SET mat_khau_hash = '$2a$10$aCSumRzc22GMA0eOF1b/ievriSlliKWPhWzzRfYkgsvd6yC9EFAvy'
WHERE id_tai_khoan IN (
    'TK_NV001', 'TK_NV002', 'TK_NV003', 'TK_NV004', 
    'TK_NV005', 'TK_NV006', 'TK_NV007', 'TK_NV008', 'TK_NV009',
    'TK_BN001', 'TK_BN002', 'TK_BN003'
) 
AND mat_khau_hash = '$2a$10$demoHashPlaceholderChoTatCaTaiKhoan';

COMMIT;
