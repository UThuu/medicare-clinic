-- ==============================================================================
-- MEDICARE CLINIC - BỘ DỮ LIỆU DÀNH RIÊNG ĐỂ TEST UC11, UC12, UC13, UC14
-- Không đụng chạm hay làm ảnh hưởng đến dữ liệu nghiệp vụ khác của hệ thống
-- ==============================================================================

-- 1. ĐẢM BẢO CÓ BÁC SĨ (NV001: BS. Nguyễn Minh)
INSERT INTO nhan_vien (ma_nv, ho_ten, sdt, dia_chi, luong) VALUES
('NV001', 'BS. Nguyễn Minh', '0901234567', 'TP. Hồ Chí Minh', 25000000)
ON DUPLICATE KEY UPDATE ho_ten = VALUES(ho_ten);

INSERT INTO bac_si (ma_nv, chuyen_khoa, bang_cap) VALUES
('NV001', 'Tai Mũi Họng', 'Thạc sĩ')
ON DUPLICATE KEY UPDATE chuyen_khoa = VALUES(chuyen_khoa);

-- 2. ĐẢM BẢO CÓ DANH MỤC THUỐC VÀ HOẠT CHẤT ĐỂ TEST CẢNH BÁO DỊ ỨNG
INSERT INTO thuoc (id_thuoc, ten_thuoc, don_vi_tinh, don_gia) VALUES
('TH-PARA500', 'Paracetamol 500mg', 'Viên', 2000),
('TH-AMOX500', 'Amoxicillin 500mg', 'Viên', 5000),
('TH-CEPHA500', 'Cephalexin 500mg', 'Viên', 4500),
('TH-VITC500', 'Vitamin C 500mg', 'Viên', 1000)
ON DUPLICATE KEY UPDATE ten_thuoc = VALUES(ten_thuoc), don_gia = VALUES(don_gia);

-- Thành phần hoạt chất (Amoxicillin có chứa hoạt chất Penicillin gây dị ứng)
INSERT INTO thuoc_thanh_phan (id_thuoc, thanh_phan) VALUES
('TH-PARA500', 'Paracetamol'),
('TH-AMOX500', 'Amoxicillin'),
('TH-AMOX500', 'Penicillin'),
('TH-CEPHA500', 'Cephalexin'),
('TH-VITC500', 'Acid ascorbic')
ON DUPLICATE KEY UPDATE thanh_phan = VALUES(thanh_phan);

-- ==============================================================================
-- KỊCH BẢN 1 (TEST CHÍNH: UC-11 TẠO ĐƠN & UC-13 CẢNH BÁO DỊ ỨNG)
-- Giống 100% Ảnh Hi-Fi 1 & 2: Bệnh nhân Nguyễn Văn A có tiền sử dị ứng Penicillin
-- Link test: http://localhost:5173/staff/medical-record/LK-TEST-UC11/prescription
-- ==============================================================================

-- Xóa dữ liệu cũ của lượt test này nếu có
DELETE FROM chi_tiet_don_thuoc WHERE id_don_thuoc = 'DT-TEST-UC11';
DELETE FROM don_thuoc WHERE id_luot_kham = 'LK-TEST-UC11' OR id = 'DT-TEST-UC11';
DELETE FROM luot_kham WHERE id_luot_kham = 'LK-TEST-UC11';
DELETE FROM lich_kham WHERE id_lich_kham = 'LK-TEST-UC11';
DELETE FROM benh_nhan_di_ung WHERE id_benh_nhan = 'BN-TEST-UC11';
DELETE FROM benh_nhan WHERE id_benh_nhan = 'BN-TEST-UC11';

-- Tạo bệnh nhân Nguyễn Văn A (35 tuổi, dị ứng Penicillin)
INSERT INTO benh_nhan (id_benh_nhan, ho_ten, ngay_sinh, gioi_tinh, so_dien_thoai, dia_chi) VALUES
('BN-TEST-UC11', 'Nguyễn Văn A', '1991-05-15', 'NAM', '0123456789', '123 Trần Phú, Quận 1, TP. Hồ Chí Minh');

INSERT INTO benh_nhan_di_ung (id_benh_nhan, thanh_phan, ghi_chu) VALUES
('BN-TEST-UC11', 'Penicillin', 'Dị ứng kháng sinh nhóm Beta-lactam, nổi mề đay, khó thở');

INSERT INTO lich_kham (id_lich_kham, id_benh_nhan, ma_bac_si, ngay_kham, gio_kham, trang_thai, phuong_thuc_dat_lich) VALUES
('LK-TEST-UC11', 'BN-TEST-UC11', 'NV001', CURDATE(), '08:30:00', 'DA_TIEP_NHAN', 'TRUC_TIEP');

INSERT INTO luot_kham (id_luot_kham, id_lich_kham, trang_thai, ly_do_kham, trieu_chung, chan_doan, ket_qua_kham) VALUES
('LK-TEST-UC11', 'LK-TEST-UC11', 'DANG_KHAM', 'Ho, sốt', 'Sốt nhẹ 38°C, ho rát họng 3 ngày', 'Viêm họng cấp', 'Họng đỏ nhẹ, amidan không sưng mủ');

-- (LƯU Ý: Lượt khám LK-TEST-UC11 CHƯA CÓ ĐƠN THUỐC -> Để test màn hình trống Empty State và bấm Thêm thuốc)


-- ==============================================================================
-- KỊCH BẢN 2 (TEST RIÊNG: UC-12 CẬP NHẬT ĐƠN THUỐC ĐÃ CÓ)
-- Lượt khám đã có đơn thuốc sẵn để test chức năng sửa, thêm/bớt thuốc, cập nhật độc lập
-- Link test: http://localhost:5173/staff/medical-record/LK-TEST-UC12/prescription
-- ==============================================================================

DELETE FROM chi_tiet_don_thuoc WHERE id_don_thuoc = 'DT-TEST-UC12';
DELETE FROM don_thuoc WHERE id_luot_kham = 'LK-TEST-UC12' OR id = 'DT-TEST-UC12';
DELETE FROM luot_kham WHERE id_luot_kham = 'LK-TEST-UC12';
DELETE FROM lich_kham WHERE id_lich_kham = 'LK-TEST-UC12';
DELETE FROM benh_nhan_di_ung WHERE id_benh_nhan = 'BN-TEST-UC12';
DELETE FROM benh_nhan WHERE id_benh_nhan = 'BN-TEST-UC12';

INSERT INTO benh_nhan (id_benh_nhan, ho_ten, ngay_sinh, gioi_tinh, so_dien_thoai, dia_chi) VALUES
('BN-TEST-UC12', 'Lê Thị Thảo', '1998-03-20', 'NU', '0988776655', '45 Hai Bà Trưng, Quận 3, TP. Hồ Chí Minh');

INSERT INTO lich_kham (id_lich_kham, id_benh_nhan, ma_bac_si, ngay_kham, gio_kham, trang_thai, phuong_thuc_dat_lich) VALUES
('LK-TEST-UC12', 'BN-TEST-UC12', 'NV001', CURDATE(), '09:00:00', 'DA_TIEP_NHAN', 'TRUC_TIEP');

INSERT INTO luot_kham (id_luot_kham, id_lich_kham, trang_thai, ly_do_kham, trieu_chung, chan_doan, ket_qua_kham) VALUES
('LK-TEST-UC12', 'LK-TEST-UC12', 'DANG_KHAM', 'Đau đầu, mệt mỏi', 'Đau đầu căng thẳng, chóng mặt', 'Rối loạn tiền đình nhẹ', 'Sinh hiệu ổn định');

-- Đã có sẵn đơn thuốc DT-TEST-UC12
INSERT INTO don_thuoc (id, id_luot_kham, ngay_ke, ghi_chu) VALUES
('DT-TEST-UC12', 'LK-TEST-UC12', CURDATE(), 'Uống sau ăn 30 phút, nghỉ ngơi điều độ');

INSERT INTO chi_tiet_don_thuoc (id, id_don_thuoc, id_thuoc, so_luong, lieu_luong, huong_dan_su_dung, don_gia, ly_do_bo_qua_canh_bao) VALUES
('CTDT-TEST-01', 'DT-TEST-UC12', 'TH-PARA500', 10, '1 viên/lần khi đau', 'Uống sau ăn', 2000, NULL),
('CTDT-TEST-02', 'DT-TEST-UC12', 'TH-VITC500',  15, '1 viên/ngày vào buổi sáng', 'Uống nhiều nước', 1000, NULL);


-- ==============================================================================
-- KỊCH BẢN 3 (TEST RIÊNG: UC-14 XEM TRƯỚC VÀ IN ĐƠN THUỐC)
-- Đơn thuốc đầy đủ đã hoàn tất để test in PDF
-- Link test: http://localhost:5173/staff/medical-record/LK-TEST-UC14/prescription
-- ==============================================================================

DELETE FROM chi_tiet_don_thuoc WHERE id_don_thuoc = 'DT-TEST-UC14';
DELETE FROM don_thuoc WHERE id_luot_kham = 'LK-TEST-UC14' OR id = 'DT-TEST-UC14';
DELETE FROM luot_kham WHERE id_luot_kham = 'LK-TEST-UC14';
DELETE FROM lich_kham WHERE id_lich_kham = 'LK-TEST-UC14';
DELETE FROM benh_nhan WHERE id_benh_nhan = 'BN-TEST-UC14';

INSERT INTO benh_nhan (id_benh_nhan, ho_ten, ngay_sinh, gioi_tinh, so_dien_thoai, dia_chi) VALUES
('BN-TEST-UC14', 'Trần Hữu Nam', '1985-11-12', 'NAM', '0912334455', '78 Lê Duẩn, Quận 1, TP. Hồ Chí Minh');

INSERT INTO lich_kham (id_lich_kham, id_benh_nhan, ma_bac_si, ngay_kham, gio_kham, trang_thai, phuong_thuc_dat_lich) VALUES
('LK-TEST-UC14', 'BN-TEST-UC14', 'NV001', CURDATE(), '10:00:00', 'DA_TIEP_NHAN', 'TRUC_TIEP');

INSERT INTO luot_kham (id_luot_kham, id_lich_kham, trang_thai, ly_do_kham, trieu_chung, chan_doan, ket_qua_kham) VALUES
('LK-TEST-UC14', 'LK-TEST-UC14', 'HOAN_TAT', 'Sốt siêu vi', 'Sốt 38.5°C, đau mình mẩy', 'Sốt siêu vi', 'Đã khỏi sốt');

INSERT INTO don_thuoc (id, id_luot_kham, ngay_ke, ghi_chu) VALUES
('DT-TEST-UC14', 'LK-TEST-UC14', CURDATE(), 'Uống thuốc đều đặn theo toa, tái khám sau 5 ngày nếu còn sốt');

INSERT INTO chi_tiet_don_thuoc (id, id_don_thuoc, id_thuoc, so_luong, lieu_luong, huong_dan_su_dung, don_gia, ly_do_bo_qua_canh_bao) VALUES
('CTDT-TEST-03', 'DT-TEST-UC14', 'TH-PARA500', 20, '1 viên/lần, ngày 2 lần', 'Uống sau ăn', 2000, NULL),
('CTDT-TEST-04', 'DT-TEST-UC14', 'TH-CEPHA500', 14, '1 viên/lần, ngày 2 lần', 'Uống sau ăn', 4500, NULL);
