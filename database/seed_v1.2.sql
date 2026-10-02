-- ============================================================
-- MediCare Clinic - Seed Data
-- Baseline V1.2
-- Chạy sau schema.sql V1.2 trên database sạch.
-- Không chạy file này lên database đã được seed/migrate trước đó.
--
-- Cơ chế hash password: Chưa triển khai chính thức.
-- Placeholder BCrypt:
-- '$2a$10$demoHashPlaceholderChoTatCaTaiKhoan'
-- ============================================================

USE medicare_clinic;

-- 1. NHAN VIEN
INSERT INTO nhan_vien (ma_nv, ho_ten, sdt, dia_chi, luong) VALUES
('NV001', 'Nguyễn Minh An', '0901234567', 'Hà Nội', 20000000),
('NV002', 'Trần Hoàng Nam', '0901234568', 'Hà Nội', 20000000),
('NV003', 'Lê Thu Hà', '0901234569', 'Hà Nội', 20000000),
('NV004', 'Phạm Quỳnh Như', '0901234570', 'Hà Nội', 15000000),
('NV005', 'Hoàng Văn Thắng', '0901234571', 'Hà Nội', 15000000),
('NV006', 'Vũ Thị Lan', '0901234572', 'Hà Nội', 12000000),
('NV007', 'Đặng Tuấn Tú', '0901234573', 'Hà Nội', 12000000),
('NV008', 'Bùi Ngọc Yến', '0901234574', 'Hà Nội', 14000000),
('NV009', 'Đỗ Quang Huy', '0901234575', 'Hà Nội', 14000000);

-- 2. BAC SI / DIEU DUONG / LE TAN / THU NGAN
INSERT INTO bac_si (ma_nv, chuyen_khoa, bang_cap) VALUES
('NV001', 'Nội khoa', 'Tiến sĩ'),
('NV002', 'Ngoại khoa', 'Thạc sĩ'),
('NV003', 'Tai Mũi Họng', 'Thạc sĩ');

INSERT INTO dieu_duong (ma_nv, khoa_lam_viec, chung_chi) VALUES
('NV004', 'Nội khoa', 'Chứng chỉ điều dưỡng hạng 1'),
('NV005', 'Ngoại khoa', 'Chứng chỉ điều dưỡng hạng 2');

INSERT INTO le_tan (ma_nv, ca_lam_viec, quay_lam_viec) VALUES
('NV006', 'Sáng', 'Quầy 1'),
('NV007', 'Chiều', 'Quầy 2');

INSERT INTO thu_ngan (ma_nv, ca_lam_viec, quay_lam_viec) VALUES
('NV008', 'Sáng', 'Quầy 3'),
('NV009', 'Chiều', 'Quầy 3');

-- 3. BENH NHAN
INSERT INTO benh_nhan
(id_benh_nhan, ho_ten, ngay_sinh, gioi_tinh, so_dien_thoai, dia_chi) VALUES
('BN001', 'Nguyễn Văn Quyết', '1990-05-10', 'NAM', '0912345671', 'Hà Nội'),
('BN002', 'Lê Thị Oanh', '1992-08-20', 'NU', '0912345672', 'Hà Nội'),
('BN003', 'Trần Hữu Dũng', '1985-02-15', 'NAM', '0912345673', 'Hà Nội'),
('BN004', 'Phạm Mỹ Duyên', '2000-11-05', 'NU', '0912345674', 'Hà Nội'),
('BN005', 'Đinh Tiến Đạt', '1995-04-12', 'NAM', '0912345675', 'Hà Nội'),
('BN006', 'Vũ Thị Hồng', '1988-12-25', 'NU', '0912345676', 'Hà Nội'),
('BN007', 'Ngô Kiến Huy', '1991-07-30', 'NAM', '0912345677', 'Hà Nội'),
('BN008', 'Lý Nhã Kỳ', '1982-01-10', 'NU', '0912345678', 'Hà Nội');

-- 4. TAI KHOAN
INSERT INTO tai_khoan
(id_tai_khoan, id_nhan_vien, id_benh_nhan, ten_dang_nhap, mat_khau_hash, trang_thai) VALUES
('TK_NV001', 'NV001', NULL, 'bs_an', '$2a$10$demoHashPlaceholderChoTatCaTaiKhoan', 'HOAT_DONG'),
('TK_NV002', 'NV002', NULL, 'bs_nam', '$2a$10$demoHashPlaceholderChoTatCaTaiKhoan', 'HOAT_DONG'),
('TK_NV003', 'NV003', NULL, 'bs_ha', '$2a$10$demoHashPlaceholderChoTatCaTaiKhoan', 'HOAT_DONG'),
('TK_NV004', 'NV004', NULL, 'dd_nhu', '$2a$10$demoHashPlaceholderChoTatCaTaiKhoan', 'HOAT_DONG'),
('TK_NV005', 'NV005', NULL, 'dd_thang', '$2a$10$demoHashPlaceholderChoTatCaTaiKhoan', 'HOAT_DONG'),
('TK_NV006', 'NV006', NULL, 'lt_lan', '$2a$10$demoHashPlaceholderChoTatCaTaiKhoan', 'HOAT_DONG'),
('TK_NV007', 'NV007', NULL, 'lt_tu', '$2a$10$demoHashPlaceholderChoTatCaTaiKhoan', 'HOAT_DONG'),
('TK_NV008', 'NV008', NULL, 'tn_yen', '$2a$10$demoHashPlaceholderChoTatCaTaiKhoan', 'HOAT_DONG'),
('TK_NV009', 'NV009', NULL, 'tn_huy', '$2a$10$demoHashPlaceholderChoTatCaTaiKhoan', 'KHOA'),
('TK_BN001', NULL, 'BN001', 'bn_quyet', '$2a$10$demoHashPlaceholderChoTatCaTaiKhoan', 'HOAT_DONG'),
('TK_BN002', NULL, 'BN002', 'bn_oanh', '$2a$10$demoHashPlaceholderChoTatCaTaiKhoan', 'HOAT_DONG'),
('TK_BN003', NULL, 'BN003', 'bn_dung', '$2a$10$demoHashPlaceholderChoTatCaTaiKhoan', 'KHOA');

-- 5. BENH NHAN DI UNG
INSERT INTO benh_nhan_di_ung (id_benh_nhan, thanh_phan, ghi_chu) VALUES
('BN001', 'PARACETAMOL', 'Phát ban ngoài da'),
('BN002', 'AMOXICILLIN', 'Sốc phản vệ nhẹ'),
('BN003', 'HẢI SẢN', 'Buồn nôn');

-- 6. THUOC
INSERT INTO thuoc (id_thuoc, ten_thuoc, don_vi_tinh, don_gia) VALUES
('TH001', 'Panadol Extra', 'Viên', 2000),
('TH002', 'Amox 500', 'Viên', 5000),
('TH003', 'Advil Ibuprofen', 'Viên', 3000),
('TH004', 'Vitamin C', 'Viên', 1000),
('TH005', 'Thuốc ho Bảo Thanh', 'Chai', 45000),
('TH006', 'Berberin', 'Lọ', 20000);

-- 7. THUOC THANH PHAN
INSERT INTO thuoc_thanh_phan (id_thuoc, thanh_phan) VALUES
('TH001', 'PARACETAMOL'),
('TH001', 'CAFFEINE'),
('TH002', 'AMOXICILLIN'),
('TH003', 'IBUPROFEN'),
('TH004', 'VITAMIN C'),
('TH005', 'XUYEN BOI MAU'),
('TH006', 'BERBERINE');

-- 8. LICH KHAM
INSERT INTO lich_kham
(id_lich_kham, id_benh_nhan, ma_bac_si, ngay_kham, gio_kham, trang_thai, phuong_thuc_dat_lich) VALUES
('LK001', 'BN004', 'NV001', DATE_ADD(CURDATE(), INTERVAL 1 DAY), '08:00:00', 'DA_DAT', 'TRUC_TUYEN'),
('LK002', 'BN005', 'NV002', DATE_ADD(CURDATE(), INTERVAL 1 DAY), '09:00:00', 'DA_DAT', 'TRUC_TIEP'),
('LK003', 'BN006', 'NV003', DATE_SUB(CURDATE(), INTERVAL 1 DAY), '10:00:00', 'DA_HUY', 'TRUC_TUYEN'),
('LK004', 'BN001', 'NV001', DATE_SUB(CURDATE(), INTERVAL 1 DAY), '08:30:00', 'DA_TIEP_NHAN', 'TRUC_TIEP'),
('LK005', 'BN002', 'NV002', CURDATE(), '08:30:00', 'DA_TIEP_NHAN', 'TRUC_TUYEN'),
('LK006', 'BN003', 'NV003', CURDATE(), '09:00:00', 'DA_TIEP_NHAN', 'TRUC_TIEP'),
('LK007', 'BN001', 'NV001', CURDATE(), '10:00:00', 'DA_TIEP_NHAN', 'TRUC_TUYEN'),
('LK008', 'BN007', 'NV001', CURDATE(), '14:00:00', 'DA_TIEP_NHAN', 'TRUC_TIEP'),
('LK009', 'BN008', 'NV002', CURDATE(), '15:00:00', 'DA_TIEP_NHAN', 'TRUC_TUYEN');

-- 9. LUOT KHAM
INSERT INTO luot_kham
(id_luot_kham, id_lich_kham, trang_thai, ly_do_kham, trieu_chung, ket_qua_kham, chan_doan) VALUES
('LUK001', 'LK004', 'HOAN_TAT', 'Khám tổng quát', 'Bình thường', 'Khỏe mạnh', 'Không bệnh'),
('LUK002', 'LK005', 'CHO_KHAM', 'Đau đầu', NULL, NULL, NULL),
('LUK003', 'LK006', 'DANG_KHAM', 'Sốt cao', '39 độ', NULL, NULL),
('LUK004', 'LK007', 'HOAN_TAT', 'Khám lại', 'Ho', 'Viêm họng nhẹ', 'Viêm họng'),
('LUK005', 'LK008', 'HOAN_TAT', 'Đau bụng', 'Đau dạ dày', 'Viêm loét dạ dày', 'Viêm dạ dày'),
('LUK006', 'LK009', 'HOAN_TAT', 'Đau vai', 'Nhức mỏi', 'Căng cơ', 'Đau cơ');

-- 10. SINH HIEU
INSERT INTO sinh_hieu
(id_sinh_hieu, id_luot_kham, ma_dieu_duong, huyet_ap_tam_truong, huyet_ap_tam_thu, can_nang, nhiet_do, thoi_diem_do) VALUES
('SH001', 'LUK001', 'NV004', 80, 120, 65.5, 36.5, DATE_SUB(CURDATE(), INTERVAL 1 DAY)),
('SH002', 'LUK003', 'NV005', 90, 130, 70.0, 39.0, NOW()),
('SH003', 'LUK004', 'NV004', 85, 125, 66.0, 37.0, NOW()),
('SH004', 'LUK005', 'NV005', 80, 120, 68.0, 36.8, NOW()),
('SH005', 'LUK006', 'NV004', 75, 115, 55.0, 36.5, NOW());

-- 11. LICH SU SINH HIEU
-- Dữ liệu mẫu cho REQ-005: SH003 đã được điều dưỡng NV004 chỉnh sửa một lần.
INSERT INTO lich_su_sinh_hieu
(id, id_sinh_hieu, ma_dieu_duong, thoi_gian_sua,
 huyet_ap_tam_thu_cu, huyet_ap_tam_truong_cu, can_nang_cu, nhiet_do_cu,
 huyet_ap_tam_thu_moi, huyet_ap_tam_truong_moi, can_nang_moi, nhiet_do_moi) VALUES
('LSSH001', 'SH003', 'NV004', NOW(),
 123, 83, 65.5, 37.2,
 125, 85, 66.0, 37.0);

-- 12. DON THUOC
INSERT INTO don_thuoc (id, id_luot_kham, ngay_ke, ghi_chu) VALUES
('DT001', 'LUK001', DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'Uống sau ăn'),
('DT002', 'LUK004', CURDATE(), 'Tái khám sau 3 ngày'),
('DT003', 'LUK005', CURDATE(), 'Uống nhiều nước');

-- 13. CHI TIET DON THUOC
INSERT INTO chi_tiet_don_thuoc
(id, id_don_thuoc, id_thuoc, so_luong, lieu_luong, huong_dan_su_dung, don_gia, ly_do_bo_qua_canh_bao) VALUES
('CT001', 'DT001', 'TH004', 10, '1 viên/ngày', 'Sáng', 1000, NULL),
('CT002', 'DT002', 'TH001', 20, '2 viên/ngày', 'Sáng và tối', 2000,
 'Bác sĩ đã đánh giá cảnh báo và quyết định tiếp tục kê thuốc.'),
('CT003', 'DT002', 'TH005', 1, '10ml/lần', 'Khi ho', 45000, NULL),
('CT004', 'DT003', 'TH006', 2, '2 lọ/đợt', 'Uống theo đơn', 20000, NULL);

-- 14. HOA DON - V1.2
INSERT INTO hoa_don
(id, id_luot_kham, id_thu_ngan, ngay_tao, tong_tien, trang_thai) VALUES
('HD001', 'LUK001', 'NV008', DATE_SUB(CURDATE(), INTERVAL 1 DAY), 110000, 'DA_THANH_TOAN'),
('HD002', 'LUK004', 'NV008', NOW(), 185000, 'DA_THANH_TOAN'),
('HD003', 'LUK005', 'NV009', NOW(), 190000, 'CHUA_THANH_TOAN'),
('HD004', 'LUK006', 'NV009', NOW(), 120000, 'DA_THANH_TOAN');

-- 15. CHI TIET HOA DON - V1.2
-- HD001 = 100.000 khám + 10 x Vitamin C 1.000 = 110.000
-- HD002 = 100.000 khám + 20 x Panadol 2.000 + 1 x Bảo Thanh 45.000 = 185.000
-- HD003 = 150.000 khám + 2 x Berberin 20.000 = 190.000
-- HD004 = 120.000 khám = 120.000
INSERT INTO chi_tiet_hoa_don
(id, id_hoa_don, loai_chi_phi, mo_ta, so_luong, don_gia, thanh_tien) VALUES
('CTHD001', 'HD001', 'KHAM',  'Phí khám',             1, 100000, 100000),
('CTHD002', 'HD001', 'THUOC', 'Vitamin C',           10,   1000,  10000),

('CTHD003', 'HD002', 'KHAM',  'Phí khám',             1, 100000, 100000),
('CTHD004', 'HD002', 'THUOC', 'Panadol Extra',       20,   2000,  40000),
('CTHD005', 'HD002', 'THUOC', 'Thuốc ho Bảo Thanh',   1,  45000,  45000),

('CTHD006', 'HD003', 'KHAM',  'Phí khám',             1, 150000, 150000),
('CTHD007', 'HD003', 'THUOC', 'Berberin',             2,  20000,  40000),

('CTHD008', 'HD004', 'KHAM',  'Phí khám',             1, 120000, 120000);

-- 16. THANH TOAN
INSERT INTO thanh_toan (id, id_hoa_don, so_tien, trang_thai, ngay_tao) VALUES
('TT001', 'HD001', 110000, 'THANH_CONG', DATE_SUB(CURDATE(), INTERVAL 1 DAY)),
('TT002', 'HD002', 185000, 'THANH_CONG', NOW()),
('TT003', 'HD003', 190000, 'DANG_XU_LY', NOW()),
('TT004', 'HD004', 120000, 'THANH_CONG', NOW());

-- 17. GIAO DICH THANH TOAN
INSERT INTO giao_dich_thanh_toan
(id_giao_dich, id_thanh_toan, ma_giao_dich, phuong_thuc, so_tien, trang_thai, thoi_gian) VALUES
('GD001', 'TT001', NULL, 'TIEN_MAT', 110000, 'THANH_CONG', DATE_SUB(CURDATE(), INTERVAL 1 DAY)),
('GD002', 'TT002', 'DEMO-QR-001', 'QR_NGAN_HANG', 185000, 'THANH_CONG', NOW()),
('GD003', 'TT003', 'DEMO-ONLINE-001', 'TRUC_TUYEN', 190000, 'DANG_XU_LY', NOW()),
('GD004', 'TT004', 'DEMO-QR-002', 'QR_NGAN_HANG', 120000, 'THAT_BAI', NOW()),
('GD005', 'TT004', 'DEMO-QR-003', 'QR_NGAN_HANG', 120000, 'THANH_CONG', NOW());

-- ============================================================
-- Kiểm tra nhanh sau khi seed
-- ============================================================

SELECT
    h.id,
    h.tong_tien,
    COALESCE(SUM(ct.thanh_tien), 0) AS tong_chi_tiet,
    h.tong_tien - COALESCE(SUM(ct.thanh_tien), 0) AS chenh_lech
FROM hoa_don h
LEFT JOIN chi_tiet_hoa_don ct
    ON ct.id_hoa_don = h.id
GROUP BY h.id, h.tong_tien
ORDER BY h.id;

-- Kỳ vọng:
-- HD001 = 110000, chenh_lech = 0
-- HD002 = 185000, chenh_lech = 0
-- HD003 = 190000, chenh_lech = 0
-- HD004 = 120000, chenh_lech = 0
