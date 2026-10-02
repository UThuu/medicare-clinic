Create Database If Not Exists medicare_clinic Character Set utf8mb4 Collate utf8mb4_unicode_ci;
Use medicare_clinic;

Create Table nhan_vien (
    ma_nv Varchar(36) Not Null,
    ho_ten Varchar(100) Not Null,
    sdt Varchar(15) Not Null,
    dia_chi Varchar(255),
    luong Decimal(12,2),
    Constraint pk_nhan_vien Primary Key (ma_nv)
);

Create Table bac_si (
    ma_nv Varchar(36) Not Null,
    chuyen_khoa Varchar(100) Not Null,
    bang_cap Varchar(100) Not Null,
    Constraint pk_bac_si Primary Key (ma_nv),
    Constraint fk_bac_si_nhan_vien Foreign Key (ma_nv) References nhan_vien(ma_nv)
);

Create Table dieu_duong (
    ma_nv Varchar(36) Not Null,
    khoa_lam_viec Varchar(100) Not Null,
    chung_chi Varchar(100),
    Constraint pk_dieu_duong Primary Key (ma_nv),
    Constraint fk_dieu_duong_nhan_vien Foreign Key (ma_nv) References nhan_vien(ma_nv)
);

Create Table le_tan (
    ma_nv Varchar(36) Not Null,
    ca_lam_viec Varchar(50) Not Null,
    quay_lam_viec Varchar(50),
    Constraint pk_le_tan Primary Key (ma_nv),
    Constraint fk_le_tan_nhan_vien Foreign Key (ma_nv) References nhan_vien(ma_nv)
);

Create Table thu_ngan (
    ma_nv Varchar(36) Not Null,
    ca_lam_viec Varchar(50) Not Null,
    quay_lam_viec Varchar(50),
    Constraint pk_thu_ngan Primary Key (ma_nv),
    Constraint fk_thu_ngan_nhan_vien Foreign Key (ma_nv) References nhan_vien(ma_nv)
);

Create Table benh_nhan (
    id_benh_nhan Varchar(36) Not Null,
    ho_ten Varchar(100) Not Null,
    ngay_sinh Date Not Null,
    gioi_tinh Varchar(20) Not Null,
    so_dien_thoai Varchar(20) Not Null,
    dia_chi Varchar(255),
    Constraint pk_benh_nhan Primary Key (id_benh_nhan),
    Constraint chk_benh_nhan_gioi_tinh Check (gioi_tinh In ('NAM', 'NU'))
);

Create Table tai_khoan (
    id_tai_khoan Varchar(36) Not Null,
    id_nhan_vien Varchar(36),
    id_benh_nhan Varchar(36),
    ten_dang_nhap Varchar(50) Not Null,
    mat_khau_hash Varchar(255) Not Null,
    trang_thai Varchar(30) Not Null,
    Constraint pk_tai_khoan Primary Key (id_tai_khoan),
    Constraint uq_tai_khoan_nhan_vien Unique (id_nhan_vien),
    Constraint uq_tai_khoan_benh_nhan Unique (id_benh_nhan),
    Constraint uq_tai_khoan_ten_dang_nhap Unique (ten_dang_nhap),
    Constraint fk_tai_khoan_nhan_vien Foreign Key (id_nhan_vien) References nhan_vien(ma_nv),
    Constraint fk_tai_khoan_benh_nhan Foreign Key (id_benh_nhan) References benh_nhan(id_benh_nhan),
    Constraint chk_tai_khoan_chu_so_huu Check (
        (id_nhan_vien Is Not Null And id_benh_nhan Is Null) Or
        (id_nhan_vien Is Null And id_benh_nhan Is Not Null)
    ),
    Constraint chk_tai_khoan_trang_thai Check (trang_thai In ('HOAT_DONG', 'KHOA'))
);

Create Table benh_nhan_di_ung (
    id_benh_nhan Varchar(36) Not Null,
    thanh_phan Varchar(255) Not Null,
    ghi_chu Varchar(255),
    Constraint pk_benh_nhan_di_ung Primary Key (id_benh_nhan, thanh_phan),
    Constraint fk_di_ung_benh_nhan Foreign Key (id_benh_nhan) References benh_nhan(id_benh_nhan)
);

Create Table lich_kham (
    id_lich_kham Varchar(36) Not Null,
    id_benh_nhan Varchar(36) Not Null,
    ma_bac_si Varchar(36) Not Null,
    ngay_kham Date Not Null,
    gio_kham Time Not Null,
    trang_thai Varchar(30) Not Null,
    phuong_thuc_dat_lich Varchar(30) Not Null,
    Constraint pk_lich_kham Primary Key (id_lich_kham),
    Constraint fk_lich_kham_benh_nhan Foreign Key (id_benh_nhan) References benh_nhan(id_benh_nhan),
    Constraint fk_lich_kham_bac_si Foreign Key (ma_bac_si) References bac_si(ma_nv),
    Constraint chk_lich_kham_trang_thai Check (trang_thai In ('DA_DAT', 'DA_TIEP_NHAN', 'DA_HUY')),
    Constraint chk_lich_kham_phuong_thuc Check (phuong_thuc_dat_lich In ('TRUC_TUYEN', 'TRUC_TIEP'))
);

Create Table luot_kham (
    id_luot_kham Varchar(36) Not Null,
    id_lich_kham Varchar(36) Not Null,
    trang_thai Varchar(30) Not Null,
    ly_do_kham Varchar(255),
    trieu_chung Text,
    ket_qua_kham Text,
    chan_doan Text,
    Constraint pk_luot_kham Primary Key (id_luot_kham),
    Constraint uq_luot_kham_lich_kham Unique (id_lich_kham),
    Constraint fk_luot_kham_lich_kham Foreign Key (id_lich_kham) References lich_kham(id_lich_kham),
    Constraint chk_luot_kham_trang_thai Check (trang_thai In ('CHO_KHAM', 'DANG_KHAM', 'HOAN_TAT'))
);

Create Table sinh_hieu (
    id_sinh_hieu Varchar(36) Not Null,
    id_luot_kham Varchar(36) Not Null,
    ma_dieu_duong Varchar(36) Not Null,
    huyet_ap_tam_truong Int,
    huyet_ap_tam_thu Int,
    can_nang Decimal(5,2),
    nhiet_do Decimal(4,1),
    thoi_diem_do Datetime Not Null,
    Constraint pk_sinh_hieu Primary Key (id_sinh_hieu),
    Constraint uq_sinh_hieu_luot_kham Unique (id_luot_kham),
    Constraint fk_sinh_hieu_luot_kham Foreign Key (id_luot_kham) References luot_kham(id_luot_kham),
    Constraint fk_sinh_hieu_dieu_duong Foreign Key (ma_dieu_duong) References dieu_duong(ma_nv)
);

Create Table lich_su_sinh_hieu (
    id Varchar(36) Not Null,
    id_sinh_hieu Varchar(36) Not Null,
    ma_dieu_duong Varchar(36) Not Null,
    thoi_gian_sua Datetime Not Null,
    huyet_ap_tam_thu_cu Int,
    huyet_ap_tam_truong_cu Int,
    can_nang_cu Decimal(5,2),
    nhiet_do_cu Decimal(4,1),
    huyet_ap_tam_thu_moi Int,
    huyet_ap_tam_truong_moi Int,
    can_nang_moi Decimal(5,2),
    nhiet_do_moi Decimal(4,1),
    Constraint pk_lich_su_sinh_hieu Primary Key (id),
    Constraint fk_lich_su_sinh_hieu_sinh_hieu Foreign Key (id_sinh_hieu) References sinh_hieu(id_sinh_hieu),
    Constraint fk_lich_su_sinh_hieu_dieu_duong Foreign Key (ma_dieu_duong) References dieu_duong(ma_nv)
);

Create Table don_thuoc (
    id Varchar(36) Not Null,
    id_luot_kham Varchar(36) Not Null,
    ngay_ke Date Not Null,
    ghi_chu Text,
    Constraint pk_don_thuoc Primary Key (id),
    Constraint uq_don_thuoc_luot_kham Unique (id_luot_kham),
    Constraint fk_don_thuoc_luot_kham Foreign Key (id_luot_kham) References luot_kham(id_luot_kham)
);

Create Table thuoc (
    id_thuoc Varchar(36) Not Null,
    ten_thuoc Varchar(150) Not Null,
    don_vi_tinh Varchar(50) Not Null,
    don_gia Decimal(12,2) Not Null,
    Constraint pk_thuoc Primary Key (id_thuoc),
    Constraint chk_thuoc_don_gia Check (don_gia >= 0)
);

Create Table thuoc_thanh_phan (
    id_thuoc Varchar(36) Not Null,
    thanh_phan Varchar(255) Not Null,
    Constraint pk_thuoc_thanh_phan Primary Key (id_thuoc, thanh_phan),
    Constraint fk_thanh_phan_thuoc Foreign Key (id_thuoc) References thuoc(id_thuoc)
);

Create Table chi_tiet_don_thuoc (
    id Varchar(36) Not Null,
    id_don_thuoc Varchar(36) Not Null,
    id_thuoc Varchar(36) Not Null,
    so_luong Int Not Null,
    lieu_luong Varchar(100) Not Null,
    huong_dan_su_dung Varchar(255),
    don_gia Decimal(12,2) Not Null,
    ly_do_bo_qua_canh_bao Varchar(255),
    Constraint pk_chi_tiet_don_thuoc Primary Key (id),
    Constraint fk_chi_tiet_don_thuoc_don_thuoc Foreign Key (id_don_thuoc) References don_thuoc(id),
    Constraint fk_chi_tiet_don_thuoc_thuoc Foreign Key (id_thuoc) References thuoc(id_thuoc),
    Constraint chk_chi_tiet_so_luong Check (so_luong > 0),
    Constraint chk_chi_tiet_don_gia Check (don_gia >= 0)
);

Create Table hoa_don (
    id Varchar(36) Not Null,
    id_luot_kham Varchar(36) Not Null,
    id_thu_ngan Varchar(36) Not Null,
    ngay_tao Datetime Not Null,
    tong_tien Decimal(12,2) Not Null,
    trang_thai Varchar(30) Not Null,
    Constraint pk_hoa_don Primary Key (id),
    Constraint uq_hoa_don_luot_kham Unique (id_luot_kham),
    Constraint fk_hoa_don_luot_kham Foreign Key (id_luot_kham) References luot_kham(id_luot_kham),
    Constraint fk_hoa_don_thu_ngan Foreign Key (id_thu_ngan) References thu_ngan(ma_nv),
    Constraint chk_hoa_don_tong_tien Check (tong_tien >= 0),
    Constraint chk_hoa_don_trang_thai Check (trang_thai In ('CHUA_THANH_TOAN', 'DA_THANH_TOAN'))
);

Create Table chi_tiet_hoa_don (
    id Varchar(36) Not Null,
    id_hoa_don Varchar(36) Not Null,
    loai_chi_phi Varchar(30) Not Null,
    mo_ta Varchar(255) Not Null,
    so_luong Int Not Null,
    don_gia Decimal(12,2) Not Null,
    thanh_tien Decimal(12,2) Not Null,
    Constraint pk_chi_tiet_hoa_don Primary Key (id),
    Constraint fk_chi_tiet_hoa_don_hoa_don Foreign Key (id_hoa_don) References hoa_don(id),
    Constraint chk_chi_tiet_hoa_don_so_luong Check (so_luong > 0),
    Constraint chk_chi_tiet_hoa_don_don_gia Check (don_gia >= 0),
    Constraint chk_chi_tiet_hoa_don_thanh_tien Check (thanh_tien >= 0)
);

Create Table thanh_toan (
    id Varchar(36) Not Null,
    id_hoa_don Varchar(36) Not Null,
    so_tien Decimal(12,2) Not Null,
    trang_thai Varchar(30) Not Null,
    ngay_tao Datetime Not Null,
    Constraint pk_thanh_toan Primary Key (id),
    Constraint uq_thanh_toan_hoa_don Unique (id_hoa_don),
    Constraint fk_thanh_toan_hoa_don Foreign Key (id_hoa_don) References hoa_don(id),
    Constraint chk_thanh_toan_so_tien Check (so_tien >= 0),
    Constraint chk_thanh_toan_trang_thai Check (trang_thai In ('DANG_XU_LY', 'THANH_CONG', 'THAT_BAI'))
);

Create Table giao_dich_thanh_toan (
    id_giao_dich Varchar(36) Not Null,
    id_thanh_toan Varchar(36) Not Null,
    ma_giao_dich Varchar(100),
    phuong_thuc Varchar(30) Not Null,
    so_tien Decimal(12,2) Not Null,
    trang_thai Varchar(30) Not Null,
    thoi_gian Datetime Not Null,
    Constraint pk_giao_dich_thanh_toan Primary Key (id_giao_dich),
    Constraint fk_giao_dich_thanh_toan Foreign Key (id_thanh_toan) References thanh_toan(id),
    Constraint chk_giao_dich_phuong_thuc Check (phuong_thuc In ('TIEN_MAT', 'QR_NGAN_HANG', 'TRUC_TUYEN')),
    Constraint chk_giao_dich_trang_thai Check (trang_thai In ('DANG_XU_LY', 'THANH_CONG', 'THAT_BAI')),
    Constraint chk_giao_dich_so_tien Check (so_tien >= 0)
);