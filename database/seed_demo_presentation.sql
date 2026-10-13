-- ============================================================
-- MediCare Clinic - Seed Data Demo Báo Cáo Hội Đồng
-- Dữ liệu 4 ngày liên tục: 13, 14, 15, 16 tháng 10 năm 2026
-- 
-- Phục vụ kiểm thử trực tiếp cho mọi Role:
--   - Bác sĩ: bs_nam (NV002), bs_ha (NV003)
--   - Điều dưỡng: dd_nhu (NV004), dd_thang (NV005)
--   - Lễ tân: lt_lan (NV006), lt_tu (NV007)
--   - Thu ngân: tn_yen (NV008), tn_huy (NV009)
-- 
-- Mỗi ngày gồm đầy đủ các ca trạng thái:
--   1. DA_DAT (Chưa tiếp nhận) -> Lễ tân test Tiếp nhận UC27
--   2. CHO_KHAM (Chưa có sinh hiệu) -> Điều dưỡng test Đo sinh hiệu UC03
--   3. CHO_KHAM (Đã có sinh hiệu) -> Điều dưỡng test Sửa sinh hiệu UC05 / Bác sĩ xem
--   4. DANG_KHAM (Đã khám, có dị ứng) -> Bác sĩ test Kê đơn & Cảnh báo dị ứng UC11-UC14
--   5. HOAN_TAT (Chưa thanh toán) -> Thu ngân test Thanh toán UC15-UC20
--   6. HOAN_TAT (Đã thanh toán) -> Dashboard tổng quan & Báo cáo doanh thu UC22-UC23
-- ============================================================

USE medicare_clinic;

-- 1. KÍCH HOẠT TÀI KHOẢN THU NGÂN tn_huy
UPDATE tai_khoan SET trang_thai = 'HOAT_DONG' WHERE ten_dang_nhap = 'tn_huy';

-- 2. TẠO CÁC BỆNH NHÂN MẪU (BN001 - BN024)
INSERT INTO benh_nhan (id_benh_nhan, ho_ten, ngay_sinh, gioi_tinh, so_dien_thoai, dia_chi) VALUES
('BN001', 'Nguyễn Văn Quyết', '1990-05-10', 'NAM', '0912345671', '45 Tràng Tiền, Hoàn Kiếm, Hà Nội'),
('BN002', 'Lê Thị Oanh', '1992-08-20', 'NU', '0912345672', '12 Kim Mã, Ba Đình, Hà Nội'),
('BN003', 'Trần Hữu Dũng', '1985-02-15', 'NAM', '0912345673', '88 Cầu Giấy, Hà Nội'),
('BN004', 'Phạm Mỹ Duyên', '2000-11-05', 'NU', '0912345674', '23 Lê Duẩn, Đống Đa, Hà Nội'),
('BN005', 'Đinh Tiến Đạt', '1995-04-12', 'NAM', '0912345675', '67 Nguyễn Trãi, Thanh Xuân, Hà Nội'),
('BN006', 'Vũ Thị Hồng', '1988-12-25', 'NU', '0912345676', '102 Hoàng Hoa Thám, Ba Đình, Hà Nội'),
('BN007', 'Ngô Kiến Huy', '1991-07-30', 'NAM', '0912345677', '54 Phố Huế, Hai Bà Trưng, Hà Nội'),
('BN008', 'Lý Nhã Kỳ', '1982-01-10', 'NU', '0912345678', '91 Hai Bà Trưng, Hoàn Kiếm, Hà Nội'),
('BN009', 'Hoàng Minh Tuấn', '1994-03-18', 'NAM', '0912345679', '15 Trần Phú, Hà Đông, Hà Nội'),
('BN010', 'Đặng Thùy Trang', '1997-09-22', 'NU', '0912345680', '36 Xuân Thủy, Cầu Giấy, Hà Nội'),
('BN011', 'Bùi Văn Hùng', '1983-06-14', 'NAM', '0912345681', '78 Láng Hạ, Đống Đa, Hà Nội'),
('BN012', 'Nguyễn Thị Mai', '1999-10-30', 'NU', '0912345682', '05 Chùa Bộc, Đống Đa, Hà Nội'),
('BN013', 'Dương Quốc Anh', '1993-01-25', 'NAM', '0912345683', '89 Giải Phóng, Hoàng Mai, Hà Nội'),
('BN014', 'Trịnh Kim Chi', '1989-07-08', 'NU', '0912345684', '42 Tây Sơn, Đống Đa, Hà Nội'),
('BN015', 'Phan Văn Đức', '1996-05-27', 'NAM', '0912345685', '19 Bạch Mai, Hai Bà Trưng, Hà Nội'),
('BN016', 'Lâm Khánh Chi', '1987-11-19', 'NU', '0912345686', '60 Đại Cồ Việt, Hai Bà Trưng, Hà Nội'),
('BN017', 'Võ Hoài Nam', '1992-04-03', 'NAM', '0912345687', '33 Lý Thường Kiệt, Hoàn Kiếm, Hà Nội'),
('BN018', 'Đỗ Mỹ Linh', '2001-08-16', 'NU', '0912345688', '17 Hàng Bài, Hoàn Kiếm, Hà Nội'),
('BN019', 'Tô Đình Phong', '1986-12-09', 'NAM', '0912345689', '28 Trần Duy Hưng, Cầu Giấy, Hà Nội'),
('BN020', 'Mai Phương Thúy', '1998-02-14', 'NU', '0912345690', '73 Nguyễn Chí Thanh, Đống Đa, Hà Nội'),
('BN021', 'Trương Bá Đạt', '1991-09-05', 'NAM', '0912345691', '14 Lạc Long Quân, Tây Hồ, Hà Nội'),
('BN022', 'Hồ Ngọc Hà', '1984-11-25', 'NU', '0912345692', '82 Thụy Khuê, Tây Hồ, Hà Nội'),
('BN023', 'Lê Hoàng Long', '1995-07-17', 'NAM', '0912345693', '51 Giảng Võ, Ba Đình, Hà Nội'),
('BN024', 'Nguyễn Bích Ngọc', '2002-03-29', 'NU', '0912345694', '99 Thái Hà, Đống Đa, Hà Nội')
ON DUPLICATE KEY UPDATE 
  ho_ten = VALUES(ho_ten),
  ngay_sinh = VALUES(ngay_sinh),
  gioi_tinh = VALUES(gioi_tinh),
  so_dien_thoai = VALUES(so_dien_thoai),
  dia_chi = VALUES(dia_chi);

-- 3. TIỀN SỬ DỊ ỨNG MẪU (Cho kiểm tra Cảnh báo dị ứng UC12 & Ghi nhận UC03)
INSERT INTO benh_nhan_di_ung (id_benh_nhan, thanh_phan, ghi_chu) VALUES
('BN002', 'AMOXICILLIN', 'Sốc phản vệ nhẹ'),
('BN002', 'Aspirin', 'Phù môi, nổi mày đay cấp'),
('BN002', 'Hải sản (Tôm, Cua)', 'Ngứa rát toàn thân'),
('BN004', 'PARACETAMOL', 'Dị ứng phát ban ngứa toàn thân'),
('BN004', 'PENICILLIN', 'Khó thở, co thắt phế quản'),
('BN008', 'CEPHALEXIN', 'Nổi mẩn đỏ da'),
('BN010', 'ASPIRIN', 'Đau bụng, nổi mề đay'),
('BN014', 'IBUPROFEN', 'Khó thở nhẹ, sưng mí mắt'),
('BN016', 'PARACETAMOL', 'Sốt ngứa, phát ban'),
('BN020', 'PENICILLIN', 'Tiền sử sốc phản vệ độ 2'),
('BN022', 'AMOXICILLIN', 'Dị ứng da, ngứa họng')
ON DUPLICATE KEY UPDATE ghi_chu = VALUES(ghi_chu);

-- Xóa dữ liệu lịch khám cũ của các mã chuẩn bị tạo để tránh duplicate key khi nạp lại
DELETE FROM giao_dich_thanh_toan WHERE id_giao_dich LIKE 'GD-2610%';
DELETE FROM thanh_toan WHERE id LIKE 'TT-2610%';
DELETE FROM chi_tiet_hoa_don WHERE id LIKE 'CTHD-2610%';
DELETE FROM hoa_don WHERE id LIKE 'HD-2610%';
DELETE FROM chi_tiet_don_thuoc WHERE id LIKE 'CTDT-2610%';
DELETE FROM don_thuoc WHERE id LIKE 'DT-2610%';
DELETE FROM lich_su_sinh_hieu WHERE id LIKE 'LSSH-2610%';
DELETE FROM sinh_hieu WHERE id_sinh_hieu LIKE 'SH-2610%';
DELETE FROM luot_kham WHERE id_luot_kham LIKE 'LUK-2610%';
DELETE FROM lich_kham WHERE id_lich_kham LIKE 'LK-2610%';

-- ============================================================
-- NGÀY 1: 13/10/2026
-- ============================================================

-- Ca 1 (08:00): DA_DAT -> Dành cho Lễ tân test Tiếp nhận UC27
INSERT INTO lich_kham (id_lich_kham, id_benh_nhan, ma_bac_si, ngay_kham, gio_kham, trang_thai, phuong_thuc_dat_lich)
VALUES ('LK-261013-01', 'BN001', 'NV002', '2026-10-13', '08:00:00', 'DA_DAT', 'TRUC_TUYEN');

-- Ca 2 (08:30): DA_TIEP_NHAN, CHO_KHAM (Chưa có sinh hiệu) -> Cho Điều dưỡng test Ghi nhận sinh hiệu & Dị ứng UC03
INSERT INTO lich_kham (id_lich_kham, id_benh_nhan, ma_bac_si, ngay_kham, gio_kham, trang_thai, phuong_thuc_dat_lich)
VALUES ('LK-261013-02', 'BN002', 'NV003', '2026-10-13', '08:30:00', 'DA_TIEP_NHAN', 'TRUC_TIEP');
INSERT INTO luot_kham (id_luot_kham, id_lich_kham, trang_thai, ly_do_kham)
VALUES ('LUK-261013-02', 'LK-261013-02', 'CHO_KHAM', 'Sốt nhẹ, rát họng, mệt mỏi từ sáng');

-- Ca 3 (09:00): DA_TIEP_NHAN, CHO_KHAM (Đã có sinh hiệu) -> Cho Điều dưỡng test Sửa sinh hiệu UC05 / Bác sĩ chuẩn bị khám
INSERT INTO lich_kham (id_lich_kham, id_benh_nhan, ma_bac_si, ngay_kham, gio_kham, trang_thai, phuong_thuc_dat_lich)
VALUES ('LK-261013-03', 'BN003', 'NV002', '2026-10-13', '09:00:00', 'DA_TIEP_NHAN', 'TRUC_TIEP');
INSERT INTO luot_kham (id_luot_kham, id_lich_kham, trang_thai, ly_do_kham)
VALUES ('LUK-261013-03', 'LK-261013-03', 'CHO_KHAM', 'Đau khớp gối phải khi đi lại nhiều');
INSERT INTO sinh_hieu (id_sinh_hieu, id_luot_kham, ma_dieu_duong, huyet_ap_tam_thu, huyet_ap_tam_truong, can_nang, nhiet_do, thoi_diem_do)
VALUES ('SH-261013-03', 'LUK-261013-03', 'NV004', 120, 80, 68.5, 36.8, '2026-10-13 09:05:00');

-- Ca 4 (09:30): DANG_KHAM (Đã có sinh hiệu & chẩn đoán, có dị ứng PARACETAMOL) -> Cho Bác sĩ test Kê đơn & Cảnh báo dị ứng UC11-14
INSERT INTO lich_kham (id_lich_kham, id_benh_nhan, ma_bac_si, ngay_kham, gio_kham, trang_thai, phuong_thuc_dat_lich)
VALUES ('LK-261013-04', 'BN004', 'NV003', '2026-10-13', '09:30:00', 'DA_TIEP_NHAN', 'TRUC_TUYEN');
INSERT INTO luot_kham (id_luot_kham, id_lich_kham, trang_thai, ly_do_kham, trieu_chung, ket_qua_kham, chan_doan)
VALUES ('LUK-261013-04', 'LK-261013-04', 'DANG_KHAM', 'Sốt cao, đau rát họng, nuốt đau 2 ngày', 'Họng đỏ rực, amidan sưng to có chấm mủ trắng, hạch góc hàm sưng đau', 'Niêm mạc họng phù nề, tim phổi bình thường', 'Viêm amidan cấp mủ');
INSERT INTO sinh_hieu (id_sinh_hieu, id_luot_kham, ma_dieu_duong, huyet_ap_tam_thu, huyet_ap_tam_truong, can_nang, nhiet_do, thoi_diem_do)
VALUES ('SH-261013-04', 'LUK-261013-04', 'NV005', 115, 75, 52.0, 38.6, '2026-10-13 09:35:00');

-- Ca 5 (10:00): HOAN_TAT, ĐÃ CÓ ĐƠN, CHƯA THANH TOÁN -> Cho Thu ngân test Thanh toán UC15-UC20
INSERT INTO lich_kham (id_lich_kham, id_benh_nhan, ma_bac_si, ngay_kham, gio_kham, trang_thai, phuong_thuc_dat_lich)
VALUES ('LK-261013-05', 'BN005', 'NV002', '2026-10-13', '10:00:00', 'DA_TIEP_NHAN', 'TRUC_TIEP');
INSERT INTO luot_kham (id_luot_kham, id_lich_kham, trang_thai, ly_do_kham, trieu_chung, ket_qua_kham, chan_doan)
VALUES ('LUK-261013-05', 'LK-261013-05', 'HOAN_TAT', 'Chấn thương bầm tím cẳng tay trái', 'Cẳng tay trái sưng nề nhẹ, ấn đau, không biến dạng xương', 'X-quang cẳng tay không gãy xương, tổn thương mô mềm', 'Chấn thương mô mềm cẳng tay trái');
INSERT INTO sinh_hieu (id_sinh_hieu, id_luot_kham, ma_dieu_duong, huyet_ap_tam_thu, huyet_ap_tam_truong, can_nang, nhiet_do, thoi_diem_do)
VALUES ('SH-261013-05', 'LUK-261013-05', 'NV004', 125, 82, 65.0, 36.7, '2026-10-13 10:05:00');
INSERT INTO don_thuoc (id, id_luot_kham, ngay_ke, ghi_chu)
VALUES ('DT-261013-05', 'LUK-261013-05', '2026-10-13', 'Uống sau ăn no, chườm lạnh 48h đầu');
INSERT INTO chi_tiet_don_thuoc (id, id_don_thuoc, id_thuoc, so_luong, lieu_luong, huong_dan_su_dung, don_gia)
VALUES 
('CTDT-261013-05-1', 'DT-261013-05', 'TH003', 10, '1 viên x 2 lần/ngày', 'Uống sau ăn sáng, tối', 3000.00),
('CTDT-261013-05-2', 'DT-261013-05', 'TH004', 10, '1 viên/ngày', 'Uống vào buổi sáng', 1000.00);
INSERT INTO hoa_don (id, id_luot_kham, id_thu_ngan, ngay_tao, tong_tien, trang_thai)
VALUES ('HD-261013-05', 'LUK-261013-05', 'NV008', '2026-10-13 10:30:00', 190000.00, 'CHUA_THANH_TOAN');
INSERT INTO chi_tiet_hoa_don (id, id_hoa_don, loai_chi_phi, mo_ta, so_luong, don_gia, thanh_tien)
VALUES 
('CTHD-261013-05-1', 'HD-261013-05', 'TIEN_KHAM', 'Phí khám chuyên khoa Ngoại', 1, 150000.00, 150000.00),
('CTHD-261013-05-2', 'HD-261013-05', 'TIEN_THUOC', 'Tiền thuốc theo đơn DT-261013-05', 1, 40000.00, 40000.00);

-- Ca 6 (10:30): HOAN_TAT, ĐÃ THANH TOÁN -> Có dữ liệu hiển thị Doanh thu & Dashboard UC21-23
INSERT INTO lich_kham (id_lich_kham, id_benh_nhan, ma_bac_si, ngay_kham, gio_kham, trang_thai, phuong_thuc_dat_lich)
VALUES ('LK-261013-06', 'BN006', 'NV003', '2026-10-13', '10:30:00', 'DA_TIEP_NHAN', 'TRUC_TUYEN');
INSERT INTO luot_kham (id_luot_kham, id_lich_kham, trang_thai, ly_do_kham, trieu_chung, ket_qua_kham, chan_doan)
VALUES ('LUK-261013-06', 'LK-261013-06', 'HOAN_TAT', 'Ho đờm, ngạt mũi 4 ngày', 'Ho nhiều về đêm, đờm trắng đục, niêm mạc mũi sung huyết', 'Soi tai mũi họng viêm mũi xoang cấp', 'Viêm phế quản cấp / Viêm mũi xoang');
INSERT INTO sinh_hieu (id_sinh_hieu, id_luot_kham, ma_dieu_duong, huyet_ap_tam_thu, huyet_ap_tam_truong, can_nang, nhiet_do, thoi_diem_do)
VALUES ('SH-261013-06', 'LUK-261013-06', 'NV005', 110, 70, 50.0, 37.2, '2026-10-13 10:35:00');
INSERT INTO don_thuoc (id, id_luot_kham, ngay_ke, ghi_chu)
VALUES ('DT-261013-06', 'LUK-261013-06', '2026-10-13', 'Uống nhiều nước ấm, tránh nằm quạt thốc vào mặt');
INSERT INTO chi_tiet_don_thuoc (id, id_don_thuoc, id_thuoc, so_luong, lieu_luong, huong_dan_su_dung, don_gia)
VALUES 
('CTDT-261013-06-1', 'DT-261013-06', 'TH005', 2, '15ml x 3 lần/ngày', 'Uống sau ăn', 45000.00),
('CTDT-261013-06-2', 'DT-261013-06', 'TH004', 10, '1 viên/ngày', 'Uống sáng sau ăn', 1000.00);
INSERT INTO hoa_don (id, id_luot_kham, id_thu_ngan, ngay_tao, tong_tien, trang_thai)
VALUES ('HD-261013-06', 'LUK-261013-06', 'NV009', '2026-10-13 11:00:00', 250000.00, 'DA_THANH_TOAN');
INSERT INTO chi_tiet_hoa_don (id, id_hoa_don, loai_chi_phi, mo_ta, so_luong, don_gia, thanh_tien)
VALUES 
('CTHD-261013-06-1', 'HD-261013-06', 'TIEN_KHAM', 'Phí khám Tai Mũi Họng', 1, 150000.00, 150000.00),
('CTHD-261013-06-2', 'HD-261013-06', 'TIEN_THUOC', 'Tiền thuốc theo đơn DT-261013-06', 1, 100000.00, 100000.00);
INSERT INTO thanh_toan (id, id_hoa_don, so_tien, trang_thai, ngay_tao)
VALUES ('TT-261013-06', 'HD-261013-06', 250000.00, 'THANH_CONG', '2026-10-13 11:05:00');
INSERT INTO giao_dich_thanh_toan (id_giao_dich, id_thanh_toan, ma_giao_dich, phuong_thuc, so_tien, trang_thai, thoi_gian)
VALUES ('GD-261013-06', 'TT-261013-06', 'VCB-261013-8899', 'QR_NGAN_HANG', 250000.00, 'THANH_CONG', '2026-10-13 11:05:00');

-- ============================================================
-- NGÀY 2: 14/10/2026
-- ============================================================

-- Ca 1 (08:00): DA_DAT (Chưa tiếp nhận) -> Lễ tân lt_tu test Tiếp nhận
INSERT INTO lich_kham (id_lich_kham, id_benh_nhan, ma_bac_si, ngay_kham, gio_kham, trang_thai, phuong_thuc_dat_lich)
VALUES ('LK-261014-01', 'BN007', 'NV003', '2026-10-14', '08:00:00', 'DA_DAT', 'TRUC_TUYEN');

-- Ca 2 (08:30): DA_TIEP_NHAN, CHO_KHAM (Chưa có sinh hiệu, có dị ứng CEPHALEXIN) -> Điều dưỡng dd_thang test Đo sinh hiệu
INSERT INTO lich_kham (id_lich_kham, id_benh_nhan, ma_bac_si, ngay_kham, gio_kham, trang_thai, phuong_thuc_dat_lich)
VALUES ('LK-261014-02', 'BN008', 'NV002', '2026-10-14', '08:30:00', 'DA_TIEP_NHAN', 'TRUC_TIEP');
INSERT INTO luot_kham (id_luot_kham, id_lich_kham, trang_thai, ly_do_kham)
VALUES ('LUK-261014-02', 'LK-261014-02', 'CHO_KHAM', 'Đau mỏi vai gáy, tê ngón tay út');

-- Ca 3 (09:00): DA_TIEP_NHAN, CHO_KHAM (Đã có sinh hiệu) -> Điều dưỡng test Sửa sinh hiệu
INSERT INTO lich_kham (id_lich_kham, id_benh_nhan, ma_bac_si, ngay_kham, gio_kham, trang_thai, phuong_thuc_dat_lich)
VALUES ('LK-261014-03', 'BN009', 'NV003', '2026-10-14', '09:00:00', 'DA_TIEP_NHAN', 'TRUC_TIEP');
INSERT INTO luot_kham (id_luot_kham, id_lich_kham, trang_thai, ly_do_kham)
VALUES ('LUK-261014-03', 'LK-261014-03', 'CHO_KHAM', 'Ù tai trái, nghẹt mũi kéo dài');
INSERT INTO sinh_hieu (id_sinh_hieu, id_luot_kham, ma_dieu_duong, huyet_ap_tam_thu, huyet_ap_tam_truong, can_nang, nhiet_do, thoi_diem_do)
VALUES ('SH-261014-03', 'LUK-261014-03', 'NV005', 122, 78, 64.0, 36.6, '2026-10-14 09:05:00');

-- Ca 4 (09:30): DANG_KHAM (Có dị ứng ASPIRIN) -> Bác sĩ bs_nam test Kê đơn & Cảnh báo dị ứng
INSERT INTO lich_kham (id_lich_kham, id_benh_nhan, ma_bac_si, ngay_kham, gio_kham, trang_thai, phuong_thuc_dat_lich)
VALUES ('LK-261014-04', 'BN010', 'NV002', '2026-10-14', '09:30:00', 'DA_TIEP_NHAN', 'TRUC_TUYEN');
INSERT INTO luot_kham (id_luot_kham, id_lich_kham, trang_thai, ly_do_kham, trieu_chung, ket_qua_kham, chan_doan)
VALUES ('LUK-261014-04', 'LK-261014-04', 'DANG_KHAM', 'Trẹo cổ chân phải khi đá bóng', 'Cổ chân phải sưng nề nhẹ mắt cá ngoài, đi khập khiễng', 'Dây chằng sên mác trước căng đau, không rách đứt hoàn toàn', 'Bong gân cổ chân phải độ 1');
INSERT INTO sinh_hieu (id_sinh_hieu, id_luot_kham, ma_dieu_duong, huyet_ap_tam_thu, huyet_ap_tam_truong, can_nang, nhiet_do, thoi_diem_do)
VALUES ('SH-261014-04', 'LUK-261014-04', 'NV004', 118, 76, 58.0, 36.9, '2026-10-14 09:35:00');

-- Ca 5 (10:00): HOAN_TAT, ĐÃ CÓ ĐƠN, CHƯA THANH TOÁN -> Thu ngân tn_huy test Thanh toán
INSERT INTO lich_kham (id_lich_kham, id_benh_nhan, ma_bac_si, ngay_kham, gio_kham, trang_thai, phuong_thuc_dat_lich)
VALUES ('LK-261014-05', 'BN011', 'NV003', '2026-10-14', '10:00:00', 'DA_TIEP_NHAN', 'TRUC_TIEP');
INSERT INTO luot_kham (id_luot_kham, id_lich_kham, trang_thai, ly_do_kham, trieu_chung, ket_qua_kham, chan_doan)
VALUES ('LUK-261014-05', 'LK-261014-05', 'HOAN_TAT', 'Đau họng, khàn tiếng 3 ngày', 'Dây thanh sung huyết nhẹ, họng có dịch nhầy', 'Viêm thanh quản cấp tính', 'Viêm thanh quản cấp');
INSERT INTO sinh_hieu (id_sinh_hieu, id_luot_kham, ma_dieu_duong, huyet_ap_tam_thu, huyet_ap_tam_truong, can_nang, nhiet_do, thoi_diem_do)
VALUES ('SH-261014-05', 'LUK-261014-05', 'NV005', 128, 84, 72.0, 37.1, '2026-10-14 10:05:00');
INSERT INTO don_thuoc (id, id_luot_kham, ngay_ke, ghi_chu)
VALUES ('DT-261014-05', 'LUK-261014-05', '2026-10-14', 'Hạn chế nói to, súc họng nước muối');
INSERT INTO chi_tiet_don_thuoc (id, id_don_thuoc, id_thuoc, so_luong, lieu_luong, huong_dan_su_dung, don_gia)
VALUES 
('CTDT-261014-05-1', 'DT-261014-05', 'TH005', 1, '15ml x 3 lần/ngày', 'Ngậm rồi nuốt từ từ', 45000.00),
('CTDT-261014-05-2', 'DT-261014-05', 'TH004', 10, '1 viên/ngày', 'Uống buổi sáng', 1000.00);
INSERT INTO hoa_don (id, id_luot_kham, id_thu_ngan, ngay_tao, tong_tien, trang_thai)
VALUES ('HD-261014-05', 'LUK-261014-05', 'NV009', '2026-10-14 10:30:00', 205000.00, 'CHUA_THANH_TOAN');
INSERT INTO chi_tiet_hoa_don (id, id_hoa_don, loai_chi_phi, mo_ta, so_luong, don_gia, thanh_tien)
VALUES 
('CTHD-261014-05-1', 'HD-261014-05', 'TIEN_KHAM', 'Phí khám Tai Mũi Họng', 1, 150000.00, 150000.00),
('CTHD-261014-05-2', 'HD-261014-05', 'TIEN_THUOC', 'Tiền thuốc theo đơn DT-261014-05', 1, 55000.00, 55000.00);

-- Ca 6 (10:30): HOAN_TAT, ĐÃ THANH TOÁN TIỀN MẶT -> Doanh thu ngày 14
INSERT INTO lich_kham (id_lich_kham, id_benh_nhan, ma_bac_si, ngay_kham, gio_kham, trang_thai, phuong_thuc_dat_lich)
VALUES ('LK-261014-06', 'BN012', 'NV002', '2026-10-14', '10:30:00', 'DA_TIEP_NHAN', 'TRUC_TUYEN');
INSERT INTO luot_kham (id_luot_kham, id_lich_kham, trang_thai, ly_do_kham, trieu_chung, ket_qua_kham, chan_doan)
VALUES ('LUK-261014-06', 'LK-261014-06', 'HOAN_TAT', 'Khám kiểm tra vết mổ bã đậu sau 1 tuần', 'Vết mổ khô, liền sẹo tốt, không sưng đỏ', 'Vết thương hồi phục hoàn toàn', 'Hồi phục sau phẫu thuật tiểu phẫu');
INSERT INTO sinh_hieu (id_sinh_hieu, id_luot_kham, ma_dieu_duong, huyet_ap_tam_thu, huyet_ap_tam_truong, can_nang, nhiet_do, thoi_diem_do)
VALUES ('SH-261014-06', 'LUK-261014-06', 'NV004', 115, 75, 49.0, 36.5, '2026-10-14 10:35:00');
INSERT INTO hoa_don (id, id_luot_kham, id_thu_ngan, ngay_tao, tong_tien, trang_thai)
VALUES ('HD-261014-06', 'LUK-261014-06', 'NV008', '2026-10-14 11:00:00', 150000.00, 'DA_THANH_TOAN');
INSERT INTO chi_tiet_hoa_don (id, id_hoa_don, loai_chi_phi, mo_ta, so_luong, don_gia, thanh_tien)
VALUES ('CTHD-261014-06-1', 'HD-261014-06', 'TIEN_KHAM', 'Phí tái khám kiểm tra vết thương', 1, 150000.00, 150000.00);
INSERT INTO thanh_toan (id, id_hoa_don, so_tien, trang_thai, ngay_tao)
VALUES ('TT-261014-06', 'HD-261014-06', 150000.00, 'THANH_CONG', '2026-10-14 11:05:00');
INSERT INTO giao_dich_thanh_toan (id_giao_dich, id_thanh_toan, ma_giao_dich, phuong_thuc, so_tien, trang_thai, thoi_gian)
VALUES ('GD-261014-06', 'TT-261014-06', NULL, 'TIEN_MAT', 150000.00, 'THANH_CONG', '2026-10-14 11:05:00');

-- ============================================================
-- NGÀY 3: 15/10/2026
-- ============================================================

-- Ca 1 (08:00): DA_DAT (Chưa tiếp nhận) -> Lễ tân lt_lan test Tiếp nhận
INSERT INTO lich_kham (id_lich_kham, id_benh_nhan, ma_bac_si, ngay_kham, gio_kham, trang_thai, phuong_thuc_dat_lich)
VALUES ('LK-261015-01', 'BN013', 'NV002', '2026-10-15', '08:00:00', 'DA_DAT', 'TRUC_TUYEN');

-- Ca 2 (08:30): DA_TIEP_NHAN, CHO_KHAM (Chưa có sinh hiệu, có dị ứng IBUPROFEN) -> Điều dưỡng dd_nhu test Đo sinh hiệu
INSERT INTO lich_kham (id_lich_kham, id_benh_nhan, ma_bac_si, ngay_kham, gio_kham, trang_thai, phuong_thuc_dat_lich)
VALUES ('LK-261015-02', 'BN014', 'NV003', '2026-10-15', '08:30:00', 'DA_TIEP_NHAN', 'TRUC_TIEP');
INSERT INTO luot_kham (id_luot_kham, id_lich_kham, trang_thai, ly_do_kham)
VALUES ('LUK-261015-02', 'LK-261015-02', 'CHO_KHAM', 'Ngứa mũi, hắt hơi liên tục vào buổi sáng');

-- Ca 3 (09:00): DA_TIEP_NHAN, CHO_KHAM (Đã có sinh hiệu) -> Điều dưỡng test Sửa sinh hiệu
INSERT INTO lich_kham (id_lich_kham, id_benh_nhan, ma_bac_si, ngay_kham, gio_kham, trang_thai, phuong_thuc_dat_lich)
VALUES ('LK-261015-03', 'BN015', 'NV002', '2026-10-15', '09:00:00', 'DA_TIEP_NHAN', 'TRUC_TIEP');
INSERT INTO luot_kham (id_luot_kham, id_lich_kham, trang_thai, ly_do_kham)
VALUES ('LUK-261015-03', 'LK-261015-03', 'CHO_KHAM', 'Đau nhức vùng thắt lưng khi ngồi lâu');
INSERT INTO sinh_hieu (id_sinh_hieu, id_luot_kham, ma_dieu_duong, huyet_ap_tam_thu, huyet_ap_tam_truong, can_nang, nhiet_do, thoi_diem_do)
VALUES ('SH-261015-03', 'LUK-261015-03', 'NV004', 124, 80, 70.0, 36.7, '2026-10-15 09:05:00');

-- Ca 4 (09:30): DANG_KHAM (Có dị ứng PARACETAMOL) -> Bác sĩ bs_ha test Kê đơn thuốc
INSERT INTO lich_kham (id_lich_kham, id_benh_nhan, ma_bac_si, ngay_kham, gio_kham, trang_thai, phuong_thuc_dat_lich)
VALUES ('LK-261015-04', 'BN016', 'NV003', '2026-10-15', '09:30:00', 'DA_TIEP_NHAN', 'TRUC_TUYEN');
INSERT INTO luot_kham (id_luot_kham, id_lich_kham, trang_thai, ly_do_kham, trieu_chung, ket_qua_kham, chan_doan)
VALUES ('LUK-261015-04', 'LK-261015-04', 'DANG_KHAM', 'Chảy mũi vàng, nhức vùng trán và hốc mắt', 'Ấn đau điểm xoang trán 2 bên, niêm mạc cuốn mũi phù nề', 'Viêm xoang trán cấp tính', 'Viêm đa xoang cấp');
INSERT INTO sinh_hieu (id_sinh_hieu, id_luot_kham, ma_dieu_duong, huyet_ap_tam_thu, huyet_ap_tam_truong, can_nang, nhiet_do, thoi_diem_do)
VALUES ('SH-261015-04', 'LUK-261015-04', 'NV005', 116, 74, 53.0, 37.8, '2026-10-15 09:35:00');

-- Ca 5 (10:00): HOAN_TAT, ĐÃ CÓ ĐƠN, CHƯA THANH TOÁN -> Thu ngân tn_yen test Thanh toán
INSERT INTO lich_kham (id_lich_kham, id_benh_nhan, ma_bac_si, ngay_kham, gio_kham, trang_thai, phuong_thuc_dat_lich)
VALUES ('LK-261015-05', 'BN017', 'NV002', '2026-10-15', '10:00:00', 'DA_TIEP_NHAN', 'TRUC_TIEP');
INSERT INTO luot_kham (id_luot_kham, id_lich_kham, trang_thai, ly_do_kham, trieu_chung, ket_qua_kham, chan_doan)
VALUES ('LUK-261015-05', 'LK-261015-05', 'HOAN_TAT', 'Vết rách nhỏ cẳng chân đã sát trùng', 'Vết rách nông 2cm, mép gọn, không có dị vật', 'Vết thương phần mềm đã xử trí', 'Vết thương rách da cẳng chân');
INSERT INTO sinh_hieu (id_sinh_hieu, id_luot_kham, ma_dieu_duong, huyet_ap_tam_thu, huyet_ap_tam_truong, can_nang, nhiet_do, thoi_diem_do)
VALUES ('SH-261015-05', 'LUK-261015-05', 'NV004', 120, 80, 66.0, 36.8, '2026-10-15 10:05:00');
INSERT INTO don_thuoc (id, id_luot_kham, ngay_ke, ghi_chu)
VALUES ('DT-261015-05', 'LUK-261015-05', '2026-10-15', 'Giữ vết thương khô sạch, thay băng hằng ngày');
INSERT INTO chi_tiet_don_thuoc (id, id_don_thuoc, id_thuoc, so_luong, lieu_luong, huong_dan_su_dung, don_gia)
VALUES 
('CTDT-261015-05-1', 'DT-261015-05', 'TH002', 14, '1 viên x 2 lần/ngày', 'Uống sau ăn sáng, tối', 5000.00),
('CTDT-261015-05-2', 'DT-261015-05', 'TH001', 10, '1 viên khi đau', 'Uống sau ăn', 2000.00);
INSERT INTO hoa_don (id, id_luot_kham, id_thu_ngan, ngay_tao, tong_tien, trang_thai)
VALUES ('HD-261015-05', 'LUK-261015-05', 'NV008', '2026-10-15 10:30:00', 240000.00, 'CHUA_THANH_TOAN');
INSERT INTO chi_tiet_hoa_don (id, id_hoa_don, loai_chi_phi, mo_ta, so_luong, don_gia, thanh_tien)
VALUES 
('CTHD-261015-05-1', 'HD-261015-05', 'TIEN_KHAM', 'Phí khám và xử lý vết thương', 1, 150000.00, 150000.00),
('CTHD-261015-05-2', 'HD-261015-05', 'TIEN_THUOC', 'Tiền thuốc theo đơn DT-261015-05', 1, 90000.00, 90000.00);

-- Ca 6 (10:30): HOAN_TAT, ĐÃ THANH TOÁN VNPay -> Doanh thu ngày 15
INSERT INTO lich_kham (id_lich_kham, id_benh_nhan, ma_bac_si, ngay_kham, gio_kham, trang_thai, phuong_thuc_dat_lich)
VALUES ('LK-261015-06', 'BN018', 'NV003', '2026-10-15', '10:30:00', 'DA_TIEP_NHAN', 'TRUC_TUYEN');
INSERT INTO luot_kham (id_luot_kham, id_lich_kham, trang_thai, ly_do_kham, trieu_chung, ket_qua_kham, chan_doan)
VALUES ('LUK-261015-06', 'LK-261015-06', 'HOAN_TAT', 'Khám họng định kỳ, vướng họng khi nuốt', 'Thành sau họng có vài nang lympho quá phát', 'Viêm họng hạt mạn tính', 'Viêm họng mạn tính');
INSERT INTO sinh_hieu (id_sinh_hieu, id_luot_kham, ma_dieu_duong, huyet_ap_tam_thu, huyet_ap_tam_truong, can_nang, nhiet_do, thoi_diem_do)
VALUES ('SH-261015-06', 'LUK-261015-06', 'NV005', 110, 72, 48.0, 36.6, '2026-10-15 10:35:00');
INSERT INTO hoa_don (id, id_luot_kham, id_thu_ngan, ngay_tao, tong_tien, trang_thai)
VALUES ('HD-261015-06', 'LUK-261015-06', 'NV008', '2026-10-15 11:00:00', 150000.00, 'DA_THANH_TOAN');
INSERT INTO chi_tiet_hoa_don (id, id_hoa_don, loai_chi_phi, mo_ta, so_luong, don_gia, thanh_tien)
VALUES ('CTHD-261015-06-1', 'HD-261015-06', 'TIEN_KHAM', 'Phí khám nội soi Tai Mũi Họng', 1, 150000.00, 150000.00);
INSERT INTO thanh_toan (id, id_hoa_don, so_tien, trang_thai, ngay_tao)
VALUES ('TT-261015-06', 'HD-261015-06', 150000.00, 'THANH_CONG', '2026-10-15 11:05:00');
INSERT INTO giao_dich_thanh_toan (id_giao_dich, id_thanh_toan, ma_giao_dich, phuong_thuc, so_tien, trang_thai, thoi_gian)
VALUES ('GD-261015-06', 'TT-261015-06', 'VNP-261015-9988', 'TRUC_TUYEN', 150000.00, 'THANH_CONG', '2026-10-15 11:05:00');

-- ============================================================
-- NGÀY 4: 16/10/2026
-- ============================================================

-- Ca 1 (08:00): DA_DAT (Chưa tiếp nhận) -> Lễ tân lt_tu test Tiếp nhận
INSERT INTO lich_kham (id_lich_kham, id_benh_nhan, ma_bac_si, ngay_kham, gio_kham, trang_thai, phuong_thuc_dat_lich)
VALUES ('LK-261016-01', 'BN019', 'NV003', '2026-10-16', '08:00:00', 'DA_DAT', 'TRUC_TUYEN');

-- Ca 2 (08:30): DA_TIEP_NHAN, CHO_KHAM (Chưa có sinh hiệu, có dị ứng PENICILLIN) -> Điều dưỡng dd_thang test Đo sinh hiệu
INSERT INTO lich_kham (id_lich_kham, id_benh_nhan, ma_bac_si, ngay_kham, gio_kham, trang_thai, phuong_thuc_dat_lich)
VALUES ('LK-261016-02', 'BN020', 'NV002', '2026-10-16', '08:30:00', 'DA_TIEP_NHAN', 'TRUC_TIEP');
INSERT INTO luot_kham (id_luot_kham, id_lich_kham, trang_thai, ly_do_kham)
VALUES ('LUK-261016-02', 'LK-261016-02', 'CHO_KHAM', 'Ngứa lòng bàn tay, phát ban sau ăn hải sản');

-- Ca 3 (09:00): DA_TIEP_NHAN, CHO_KHAM (Đã có sinh hiệu) -> Điều dưỡng test Sửa sinh hiệu
INSERT INTO lich_kham (id_lich_kham, id_benh_nhan, ma_bac_si, ngay_kham, gio_kham, trang_thai, phuong_thuc_dat_lich)
VALUES ('LK-261016-03', 'BN021', 'NV003', '2026-10-16', '09:00:00', 'DA_TIEP_NHAN', 'TRUC_TIEP');
INSERT INTO luot_kham (id_luot_kham, id_lich_kham, trang_thai, ly_do_kham)
VALUES ('LUK-261016-03', 'LK-261016-03', 'CHO_KHAM', 'Đau nhức tai phải, ngứa ống tai');
INSERT INTO sinh_hieu (id_sinh_hieu, id_luot_kham, ma_dieu_duong, huyet_ap_tam_thu, huyet_ap_tam_truong, can_nang, nhiet_do, thoi_diem_do)
VALUES ('SH-261016-03', 'LUK-261016-03', 'NV005', 120, 80, 67.0, 36.9, '2026-10-16 09:05:00');

-- Ca 4 (09:30): DANG_KHAM (Có dị ứng AMOXICILLIN) -> Bác sĩ bs_nam test Kê đơn & Cảnh báo dị ứng
INSERT INTO lich_kham (id_lich_kham, id_benh_nhan, ma_bac_si, ngay_kham, gio_kham, trang_thai, phuong_thuc_dat_lich)
VALUES ('LK-261016-04', 'BN022', 'NV002', '2026-10-16', '09:30:00', 'DA_TIEP_NHAN', 'TRUC_TUYEN');
INSERT INTO luot_kham (id_luot_kham, id_lich_kham, trang_thai, ly_do_kham, trieu_chung, ket_qua_kham, chan_doan)
VALUES ('LUK-261016-04', 'LK-261016-04', 'DANG_KHAM', 'Đau gót chân trái khi bước đi buổi sáng', 'Ấn đau chói điểm bám gân gót trái, không sưng nóng', 'Viêm điểm bám gân gót Achilles', 'Viêm gân gót chân trái');
INSERT INTO sinh_hieu (id_sinh_hieu, id_luot_kham, ma_dieu_duong, huyet_ap_tam_thu, huyet_ap_tam_truong, can_nang, nhiet_do, thoi_diem_do)
VALUES ('SH-261016-04', 'LUK-261016-04', 'NV004', 118, 76, 54.0, 36.7, '2026-10-16 09:35:00');

-- Ca 5 (10:00): HOAN_TAT, ĐÃ CÓ ĐƠN, CHƯA THANH TOÁN -> Thu ngân tn_huy test Thanh toán
INSERT INTO lich_kham (id_lich_kham, id_benh_nhan, ma_bac_si, ngay_kham, gio_kham, trang_thai, phuong_thuc_dat_lich)
VALUES ('LK-261016-05', 'BN023', 'NV003', '2026-10-16', '10:00:00', 'DA_TIEP_NHAN', 'TRUC_TIEP');
INSERT INTO luot_kham (id_luot_kham, id_lich_kham, trang_thai, ly_do_kham, trieu_chung, ket_qua_kham, chan_doan)
VALUES ('LUK-261016-05', 'LK-261016-05', 'HOAN_TAT', 'Sốt nhẹ, rát họng, mệt mỏi', 'Họng đỏ nhẹ, không giả mạc, tim phổi bình thường', 'Viêm họng cấp thông thường', 'Viêm họng cấp');
INSERT INTO sinh_hieu (id_sinh_hieu, id_luot_kham, ma_dieu_duong, huyet_ap_tam_thu, huyet_ap_tam_truong, can_nang, nhiet_do, thoi_diem_do)
VALUES ('SH-261016-05', 'LUK-261016-05', 'NV005', 125, 80, 69.0, 37.5, '2026-10-16 10:05:00');
INSERT INTO don_thuoc (id, id_luot_kham, ngay_ke, ghi_chu)
VALUES ('DT-261016-05', 'LUK-261016-05', '2026-10-16', 'Nghỉ ngơi, uống nhiều nước');
INSERT INTO chi_tiet_don_thuoc (id, id_don_thuoc, id_thuoc, so_luong, lieu_luong, huong_dan_su_dung, don_gia)
VALUES 
('CTDT-261016-05-1', 'DT-261016-05', 'TH001', 10, '1 viên khi sốt > 38.5C', 'Cách nhau 4-6 tiếng', 2000.00),
('CTDT-261016-05-2', 'DT-261016-05', 'TH004', 10, '1 viên/ngày', 'Uống sáng sau ăn', 1000.00);
INSERT INTO hoa_don (id, id_luot_kham, id_thu_ngan, ngay_tao, tong_tien, trang_thai)
VALUES ('HD-261016-05', 'LUK-261016-05', 'NV009', '2026-10-16 10:30:00', 180000.00, 'CHUA_THANH_TOAN');
INSERT INTO chi_tiet_hoa_don (id, id_hoa_don, loai_chi_phi, mo_ta, so_luong, don_gia, thanh_tien)
VALUES 
('CTHD-261016-05-1', 'HD-261016-05', 'TIEN_KHAM', 'Phí khám Tai Mũi Họng', 1, 150000.00, 150000.00),
('CTHD-261016-05-2', 'HD-261016-05', 'TIEN_THUOC', 'Tiền thuốc theo đơn DT-261016-05', 1, 30000.00, 30000.00);

-- Ca 6 (10:30): HOAN_TAT, ĐÃ THANH TOÁN TIỀN MẶT -> Doanh thu ngày 16
INSERT INTO lich_kham (id_lich_kham, id_benh_nhan, ma_bac_si, ngay_kham, gio_kham, trang_thai, phuong_thuc_dat_lich)
VALUES ('LK-261016-06', 'BN024', 'NV002', '2026-10-16', '10:30:00', 'DA_TIEP_NHAN', 'TRUC_TUYEN');
INSERT INTO luot_kham (id_luot_kham, id_lich_kham, trang_thai, ly_do_kham, trieu_chung, ket_qua_kham, chan_doan)
VALUES ('LUK-261016-06', 'LK-261016-06', 'HOAN_TAT', 'Khám sức khỏe tổng quát định kỳ', 'Thể trạng tốt, tim phổi bình thường, bụng mềm', 'Không phát hiện bất thường lâm sàng', 'Khám sức khỏe định kỳ bình thường');
INSERT INTO sinh_hieu (id_sinh_hieu, id_luot_kham, ma_dieu_duong, huyet_ap_tam_thu, huyet_ap_tam_truong, can_nang, nhiet_do, thoi_diem_do)
VALUES ('SH-261016-06', 'LUK-261016-06', 'NV004', 115, 75, 51.0, 36.6, '2026-10-16 10:35:00');
INSERT INTO hoa_don (id, id_luot_kham, id_thu_ngan, ngay_tao, tong_tien, trang_thai)
VALUES ('HD-261016-06', 'LUK-261016-06', 'NV008', '2026-10-16 11:00:00', 150000.00, 'DA_THANH_TOAN');
INSERT INTO chi_tiet_hoa_don (id, id_hoa_don, loai_chi_phi, mo_ta, so_luong, don_gia, thanh_tien)
VALUES ('CTHD-261016-06-1', 'HD-261016-06', 'TIEN_KHAM', 'Phí khám sức khỏe tổng quát', 1, 150000.00, 150000.00);
INSERT INTO thanh_toan (id, id_hoa_don, so_tien, trang_thai, ngay_tao)
VALUES ('TT-261016-06', 'HD-261016-06', 150000.00, 'THANH_CONG', '2026-10-16 11:05:00');
INSERT INTO giao_dich_thanh_toan (id_giao_dich, id_thanh_toan, ma_giao_dich, phuong_thuc, so_tien, trang_thai, thoi_gian)
VALUES ('GD-261016-06', 'TT-261016-06', NULL, 'TIEN_MAT', 150000.00, 'THANH_CONG', '2026-10-16 11:05:00');
