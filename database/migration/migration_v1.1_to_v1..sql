-- ============================================================
-- MediCare Clinic
-- Migration chính thức: Baseline V1.1 -> V1.2
-- Không DROP database.
-- Chỉ chạy trên database đang ở Baseline V1.1.
-- ============================================================

USE medicare_clinic;

-- 1. Bổ sung lịch sử chỉnh sửa sinh hiệu (REQ-005)
CREATE TABLE lich_su_sinh_hieu (
    id VARCHAR(36) NOT NULL,
    id_sinh_hieu VARCHAR(36) NOT NULL,
    ma_dieu_duong VARCHAR(36) NOT NULL,
    thoi_gian_sua DATETIME NOT NULL,
    huyet_ap_tam_thu_cu INT,
    huyet_ap_tam_truong_cu INT,
    can_nang_cu DECIMAL(5,2),
    nhiet_do_cu DECIMAL(4,1),
    huyet_ap_tam_thu_moi INT,
    huyet_ap_tam_truong_moi INT,
    can_nang_moi DECIMAL(5,2),
    nhiet_do_moi DECIMAL(4,1),

    CONSTRAINT pk_lich_su_sinh_hieu
        PRIMARY KEY (id),

    CONSTRAINT fk_lich_su_sinh_hieu_sinh_hieu
        FOREIGN KEY (id_sinh_hieu)
        REFERENCES sinh_hieu(id_sinh_hieu),

    CONSTRAINT fk_lich_su_sinh_hieu_dieu_duong
        FOREIGN KEY (ma_dieu_duong)
        REFERENCES dieu_duong(ma_nv)
);

-- 2. Bổ sung chi tiết hóa đơn
CREATE TABLE chi_tiet_hoa_don (
    id VARCHAR(36) NOT NULL,
    id_hoa_don VARCHAR(36) NOT NULL,
    loai_chi_phi VARCHAR(30) NOT NULL,
    mo_ta VARCHAR(255) NOT NULL,
    so_luong INT NOT NULL,
    don_gia DECIMAL(12,2) NOT NULL,
    thanh_tien DECIMAL(12,2) NOT NULL,

    CONSTRAINT pk_chi_tiet_hoa_don
        PRIMARY KEY (id),

    CONSTRAINT fk_chi_tiet_hoa_don_hoa_don
        FOREIGN KEY (id_hoa_don)
        REFERENCES hoa_don(id),

    CONSTRAINT chk_chi_tiet_hoa_don_so_luong
        CHECK (so_luong > 0),

    CONSTRAINT chk_chi_tiet_hoa_don_don_gia
        CHECK (don_gia >= 0),

    CONSTRAINT chk_chi_tiet_hoa_don_thanh_tien
        CHECK (thanh_tien >= 0)
);

-- 3. Chuyển dữ liệu hóa đơn V1.1 sang chi_tiet_hoa_don.
-- Dữ liệu cũ được bảo toàn bằng:
--   1 dòng KHAM
--   1 dòng THUOC tổng hợp nếu tien_thuoc > 0

INSERT INTO chi_tiet_hoa_don
    (id, id_hoa_don, loai_chi_phi, mo_ta, so_luong, don_gia, thanh_tien)
SELECT
    CONCAT('MIG-KHAM-', id),
    id,
    'KHAM',
    'Phí khám',
    1,
    phi_kham,
    phi_kham
FROM hoa_don;

INSERT INTO chi_tiet_hoa_don
    (id, id_hoa_don, loai_chi_phi, mo_ta, so_luong, don_gia, thanh_tien)
SELECT
    CONCAT('MIG-THUOC-', id),
    id,
    'THUOC',
    'Tiền thuốc',
    1,
    tien_thuoc,
    tien_thuoc
FROM hoa_don
WHERE tien_thuoc > 0;

-- 4. Bổ sung tong_tien cho hoa_don
ALTER TABLE hoa_don
    ADD COLUMN tong_tien DECIMAL(12,2) NULL AFTER ngay_tao;

-- MySQL Workbench có thể bật Safe Updates.
SET SQL_SAFE_UPDATES = 0;

UPDATE hoa_don h
SET h.tong_tien = (
    SELECT COALESCE(SUM(ct.thanh_tien), 0)
    FROM chi_tiet_hoa_don ct
    WHERE ct.id_hoa_don = h.id
);

SET SQL_SAFE_UPDATES = 1;

ALTER TABLE hoa_don
    MODIFY COLUMN tong_tien DECIMAL(12,2) NOT NULL;

ALTER TABLE hoa_don
    ADD CONSTRAINT chk_hoa_don_tong_tien
    CHECK (tong_tien >= 0);

-- 5. Kiểm tra dữ liệu trước khi xóa phi_kham và tien_thuoc.
-- Tất cả chenh_lech phải bằng 0.
SELECT
    h.id,
    (h.phi_kham + h.tien_thuoc) AS tong_cu,
    h.tong_tien AS tong_moi,
    h.tong_tien - (h.phi_kham + h.tien_thuoc) AS chenh_lech
FROM hoa_don h
ORDER BY h.id;

-- 6. Xóa constraint và cột V1.1 đã được thay thế
ALTER TABLE hoa_don
    DROP CHECK chk_hoa_don_phi_kham;

ALTER TABLE hoa_don
    DROP CHECK chk_hoa_don_tien_thuoc;

ALTER TABLE hoa_don
    DROP COLUMN phi_kham,
    DROP COLUMN tien_thuoc;

-- 7. Kiểm tra cuối migration.
-- Tất cả chenh_lech phải bằng 0.
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

-- ============================================================
-- Kết thúc migration V1.1 -> V1.2
-- ============================================================
