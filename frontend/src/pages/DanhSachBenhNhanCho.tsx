import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Button,
    Card,
    Input,
    SearchBox,
    StatusBadge,
    Table,
} from "../components";

import { MainLayout } from "../components/layout/MainLayout";

import type { BenhNhanCho } from "../types/LuotKham";

import {
    layDanhSachBenhNhanCho,
} from "../services/DichVuLuotKham";

import GhiNhanSinhHieu from "./GhiNhanSinhHieu";

import "./danhSachBenhNhanCho.css";

function dinhDangNgay(ngay: string) {
    if (!ngay) return "";

    const [nam, thang, ngayTrongThang] = ngay.split("-");

    if (!nam || !thang || !ngayTrongThang) {
        return ngay;
    }

    return `${ngayTrongThang}/${thang}/${nam}`;
}

function dinhDangGio(gio: string) {
    if (!gio) return "";

    return gio.slice(0, 5);
}

function hienThiGioiTinh(gioiTinh: string) {
    switch (gioiTinh) {
        case "NAM":
            return "Nam";

        case "NU":
            return "Nữ";

        default:
            return gioiTinh;
    }
}

export default function DanhSachBenhNhanCho() {

    // =========================
    // DANH SÁCH BỆNH NHÂN
    // =========================

    const [danhSachBenhNhan, setDanhSachBenhNhan] =
        useState<BenhNhanCho[]>([]);

    // =========================
    // TÌM KIẾM
    // =========================

    const [tuKhoa, setTuKhoa] =
        useState("");

    // =========================
    // NGÀY KHÁM
    // =========================

    const [ngayKham, setNgayKham] =
        useState(
            () => new Date().toISOString().slice(0, 10)
        );

    // =========================
    // TRẠNG THÁI
    // =========================

    const [dangTai, setDangTai] =
        useState(false);

    const [loi, setLoi] =
        useState("");

    // =========================
    // BỆNH NHÂN ĐANG ĐƯỢC CHỌN
    //
    // null = đang ở UC02
    // có dữ liệu = đang ở UC03
    // =========================

    const [
        benhNhanDangChon,
        setBenhNhanDangChon,
    ] = useState<BenhNhanCho | null>(null);

    // =========================
    // TẢI DANH SÁCH
    // =========================

    const taiDanhSach = useCallback(async () => {

        try {
            setDangTai(true);
            setLoi("");

            const duLieu =
                await layDanhSachBenhNhanCho(ngayKham);

            setDanhSachBenhNhan(duLieu);

        } catch (error) {

            console.error(error);

            setLoi(
                "Không thể tải danh sách bệnh nhân chờ."
            );

        } finally {

            setDangTai(false);
        }

    }, [ngayKham]);

    useEffect(() => {
        void taiDanhSach();
    }, [taiDanhSach]);

    // =========================
    // LỌC TÌM KIẾM
    // =========================

    const danhSachLoc = useMemo(() => {

        const tuKhoaTimKiem =
            tuKhoa.trim().toLowerCase();

        // Không tìm kiếm
        if (!tuKhoaTimKiem) {
            return danhSachBenhNhan;
        }

        return danhSachBenhNhan.filter(
            (benhNhan) => {

                const thongTin = [
                    benhNhan.idBenhNhan,
                    benhNhan.idLuotKham,
                    benhNhan.hoTen,
                    benhNhan.soDienThoai,
                    benhNhan.lyDoKham,
                ];

                return thongTin
                    .filter(Boolean)
                    .some((giaTri) =>
                        String(giaTri)
                            .toLowerCase()
                            .includes(tuKhoaTimKiem)
                    );
            }
        );

    }, [danhSachBenhNhan, tuKhoa]);

    // =========================
    // TIÊU ĐỀ DANH SÁCH
    // =========================

    const tieuDeDanhSach =
        tuKhoa.trim()
            ? `Kết quả tìm kiếm (${danhSachLoc.length}/${danhSachBenhNhan.length})`
            : `Danh sách chờ (${danhSachBenhNhan.length})`;

    // =========================
    // NẾU ĐÃ CHỌN BỆNH NHÂN
    // → HIỂN THỊ UC03
    // =========================

    if (benhNhanDangChon) {

        return (
            <GhiNhanSinhHieu
                benhNhan={benhNhanDangChon}

                onQuayLai={() => {
                    setBenhNhanDangChon(null);
                }}

                onLuuThanhCong={() => {

                    // Quay về danh sách
                    setBenhNhanDangChon(null);

                    // Tải lại danh sách
                    void taiDanhSach();
                }}
            />
        );
    }

    // =========================
    // CỘT BẢNG
    // =========================

    const cot = [

        {
            key: "gioKham",
            header: "Giờ khám",
            width: "90px",

            render: (row: BenhNhanCho) =>
                dinhDangGio(row.gioKham),
        },

        {
            key: "idBenhNhan",
            header: "Mã bệnh nhân",
            width: "120px",

            render: (row: BenhNhanCho) =>
                row.idBenhNhan,
        },

        {
            key: "hoTen",
            header: "Họ và tên",

            render: (row: BenhNhanCho) =>
                row.hoTen,
        },

        {
            key: "ngaySinh",
            header: "Ngày sinh",
            width: "120px",

            render: (row: BenhNhanCho) =>
                dinhDangNgay(row.ngaySinh),
        },

        {
            key: "gioiTinh",
            header: "Giới tính",
            width: "90px",

            render: (row: BenhNhanCho) =>
                hienThiGioiTinh(row.gioiTinh),
        },

        {
            key: "lyDoKham",
            header: "Lý do khám",

            render: (row: BenhNhanCho) =>
                row.lyDoKham || "—",
        },

        {
            key: "trangThai",
            header: "Trạng thái",
            width: "120px",

            render: () => (
                <StatusBadge tone="warning">
                    Đang chờ
                </StatusBadge>
            ),
        },

        // =========================
        // NÚT UC03
        // =========================

        {
            key: "thaoTac",
            header: "Thao tác",
            width: "170px",

            render: (row: BenhNhanCho) => (
                <Button
                    onClick={() => {
                        setBenhNhanDangChon(row);
                    }}
                >
                    Ghi nhận sinh hiệu
                </Button>
            ),
        },
    ];

    // =========================
    // GIAO DIỆN UC02
    // =========================

    return (
        <MainLayout
            doctorName="Nguyễn Minh"
            roleLabel="Bác sĩ"
            hotline="Hotline: 1800 6868"

            sidebarItems={[
                {
                    label: "Dashboard",
                    href: "#",
                },

                {
                    label: "Lịch khám",
                    href: "#",
                },

                {
                    label: "Bệnh nhân chờ",
                    href: "#",
                    active: true,
                },
            ]}
        >

            <div className="danh-sach-benh-nhan-cho">

                {/* =========================
                    BREADCRUMB
                   ========================= */}

                <div className="danh-sach-benh-nhan-cho__breadcrumb">

                    <span>Lịch khám</span>

                    <span>/</span>

                    <span>Bệnh nhân chờ</span>

                </div>

                {/* =========================
                    HEADER
                   ========================= */}

                <div className="danh-sach-benh-nhan-cho__header">

                    <div>

                        <h1>
                            Danh sách bệnh nhân chờ
                        </h1>

                        <p>
                            Theo dõi bệnh nhân đang chờ khám trong ngày
                        </p>

                    </div>

                    <div className="danh-sach-benh-nhan-cho__toolbar">

                        <Button
                            variant="secondary"
                            onClick={taiDanhSach}
                            loading={dangTai}
                            loadingText="Đang tải..."
                        >
                            ↻ Làm mới
                        </Button>

                    </div>

                </div>

                {/* =========================
                    TỔNG SỐ BỆNH NHÂN
                   ========================= */}

                <div className="danh-sach-benh-nhan-cho__summary">

                    <Card>

                        <div className="summary-card">

                            <div>

                                <div className="summary-card__label">
                                    Bệnh nhân đang chờ
                                </div>

                                <div className="summary-card__number">
                                    {danhSachBenhNhan.length}
                                </div>

                            </div>

                            <div className="summary-card__icon">
                                👥
                            </div>

                        </div>

                    </Card>

                </div>

                {/* =========================
                    BỘ LỌC
                   ========================= */}

                <Card>

                    <div className="danh-sach-benh-nhan-cho__filters">

                        <div className="filter-search">

                            <SearchBox
                                label="Tìm bệnh nhân"
                                placeholder="Nhập mã hoặc tên bệnh nhân..."
                                value={tuKhoa}
                                onChange={(event) =>
                                    setTuKhoa(
                                        event.target.value
                                    )
                                }
                            />

                        </div>

                        <div className="filter-date">

                            <Input
                                id="ngay-kham"
                                type="date"
                                label="Ngày khám"
                                value={ngayKham}
                                onChange={(event) =>
                                    setNgayKham(
                                        event.target.value
                                    )
                                }
                            />

                        </div>

                    </div>

                </Card>

                {/* =========================
                    THÔNG BÁO LỖI
                   ========================= */}

                {loi && (

                    <div className="danh-sach-benh-nhan-cho__error">
                        {loi}
                    </div>

                )}

                {/* =========================
                    BẢNG
                   ========================= */}

                <Card title={tieuDeDanhSach}>

                    <Table
                        columns={cot}
                        data={danhSachLoc}
                        rowKey={(row) =>
                            row.idLuotKham
                        }

                        emptyText={
                            dangTai
                                ? "Đang tải danh sách..."
                                : tuKhoa.trim()
                                    ? "Không tìm thấy bệnh nhân phù hợp."
                                    : "Không có bệnh nhân đang chờ."
                        }
                    />

                </Card>

            </div>

        </MainLayout>
    );
}