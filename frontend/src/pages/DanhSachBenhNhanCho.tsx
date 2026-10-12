import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import { Link } from "react-router-dom";

import {
    Button,
    Card,
    Input,
    SearchBox,
    StatusBadge,
    Table,
} from "../components";

import { MainLayout } from "../components/layout/MainLayout";
import { useAuth } from "../contexts/AuthContext";

import type { BenhNhanCho } from "../types/LuotKham";

import {
    layDanhSachBenhNhanCho,
} from "../services/DichVuLuotKham";

import { XacNhanBenhNhan } from "./XacNhanBenhNhan";
import GhiNhanSinhHieu from "./GhiNhanSinhHieu";
import CapNhatSinhHieu from "./CapNhatSinhHieu";
import { laySinhHieu } from "../services/DichVuSinhHieu";
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
            return gioiTinh || "—";
    }
}

export default function DanhSachBenhNhanCho() {
    const { user } = useAuth();

    // UC04: Bệnh nhân cần xác nhận
    const [
        benhNhanCanXacNhan,
        setBenhNhanCanXacNhan,
    ] = useState<BenhNhanCho | null>(null);

    // UC02: Danh sách bệnh nhân
    const [
        danhSachBenhNhan,
        setDanhSachBenhNhan,
    ] = useState<BenhNhanCho[]>([]);

    // Tìm kiếm
    const [tuKhoa, setTuKhoa] = useState("");

    // Ngày khám
    const [
        ngayKham,
        setNgayKham,
    ] = useState(
        () => {
            const homNay = new Date();
            const nam = homNay.getFullYear();
            const thang = String(
                homNay.getMonth() + 1
            ).padStart(2, "0");
            const ngay = String(
                homNay.getDate()
            ).padStart(2, "0");

            return `${nam}-${thang}-${ngay}`;
        }
    );

    // Trạng thái tải dữ liệu
    const [dangTai, setDangTai] = useState(false);
    const [loi, setLoi] = useState("");

    // Bệnh nhân đang được chọn để ghi nhận sinh hiệu (mới)
    const [
        benhNhanDangChon,
        setBenhNhanDangChon,
    ] = useState<BenhNhanCho | null>(null);

    // Bệnh nhân đang được chọn để cập nhật sinh hiệu (đã có)
    const [
        benhNhanCanCapNhat,
        setBenhNhanCanCapNhat,
    ] = useState<BenhNhanCho | null>(null);

    // Tập hợp ID lượt khám đã có sinh hiệu
    const [daCoSinhHieuIds, setDaCoSinhHieuIds] = useState<Set<string>>(
        new Set()
    );

    // Tải danh sách bệnh nhân và kiểm tra trạng thái sinh hiệu
    const taiDanhSach = useCallback(async () => {
        try {
            setDangTai(true);
            setLoi("");

            const duLieu =
                await layDanhSachBenhNhanCho(ngayKham);

            setDanhSachBenhNhan(duLieu);

            try {
                const ketQua = await Promise.allSettled(
                    duLieu.map(async (bn) => {
                        const sh = await laySinhHieu(bn.idLuotKham);
                        return { idLuotKham: bn.idLuotKham, daCo: Boolean(sh) };
                    })
                );

                const tapDaCo = new Set<string>();
                ketQua.forEach((item) => {
                    if (item.status === "fulfilled" && item.value.daCo) {
                        tapDaCo.add(item.value.idLuotKham);
                    }
                });

                setDaCoSinhHieuIds(tapDaCo);
            } catch {
                // Tiếp tục nếu kiểm tra sinh hiệu thất bại
            }
        } catch (error) {
            console.error(error);

            setLoi(
                error instanceof Error
                    ? error.message
                    : "Không thể tải danh sách bệnh nhân chờ."
            );
        } finally {
            setDangTai(false);
        }
    }, [ngayKham]);

    useEffect(() => {
        void taiDanhSach();
    }, [taiDanhSach]);

    // Lọc tìm kiếm theo mã, tên, số điện thoại và lý do khám
    const danhSachLoc = useMemo(() => {
        const tuKhoaTimKiem =
            tuKhoa.trim().toLowerCase();

        if (!tuKhoaTimKiem) {
            return danhSachBenhNhan;
        }

        return danhSachBenhNhan.filter((benhNhan) => {
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
        });
    }, [danhSachBenhNhan, tuKhoa]);

    const tieuDeDanhSach = tuKhoa.trim()
        ? `Kết quả tìm kiếm (${danhSachLoc.length}/${danhSachBenhNhan.length})`
        : `Danh sách chờ (${danhSachBenhNhan.length})`;

    // UC04: Xác nhận bệnh nhân trước khi ghi nhận sinh hiệu
    if (benhNhanCanXacNhan) {
        return (
            <XacNhanBenhNhan
                benhNhan={benhNhanCanXacNhan}
                onQuayLai={() => {
                    setBenhNhanCanXacNhan(null);
                }}
                onXacNhan={() => {
                    setBenhNhanDangChon(
                        benhNhanCanXacNhan
                    );

                    setBenhNhanCanXacNhan(null);
                }}
            />
        );
    }

    // UC03: Ghi nhận sinh hiệu cho bệnh nhân được chọn
    if (benhNhanDangChon) {
        return (
            <GhiNhanSinhHieu
                benhNhan={benhNhanDangChon}
                onQuayLai={() => {
                    setBenhNhanDangChon(null);
                }}
                onLuuThanhCong={() => {
                    setBenhNhanDangChon(null);
                    void taiDanhSach();
                }}
            />
        );
    }

    // UC05: Cập nhật sinh hiệu trực tiếp (không cần xác nhận thông tin lại)
    if (benhNhanCanCapNhat) {
        return (
            <CapNhatSinhHieu
                benhNhan={benhNhanCanCapNhat}
                onQuayLai={() => {
                    setBenhNhanCanCapNhat(null);
                }}
                onCapNhatThanhCong={() => {
                    setBenhNhanCanCapNhat(null);
                    void taiDanhSach();
                }}
            />
        );
    }

    const laDieuDuong = user?.vaiTro === "DIEU_DUONG";
    const laLeTan = user?.vaiTro === "LE_TAN";

    // Các cột của bảng bệnh nhân chờ
    const cacCotCoBan = [
        {
            key: "gioKham",
            header: "Giờ hẹn",
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
            width: "140px",
            render: (row: BenhNhanCho) => {
                const daCo = daCoSinhHieuIds.has(row.idLuotKham);
                return daCo ? (
                    <StatusBadge tone="success">
                        Đã có sinh hiệu
                    </StatusBadge>
                ) : (
                    <StatusBadge tone="warning">
                        Chờ sinh hiệu
                    </StatusBadge>
                );
            },
        },
    ];

    const cot = laDieuDuong
        ? [
            ...cacCotCoBan,
            {
                key: "thaoTac",
                header: "Thao tác",
                width: "180px",
                render: (row: BenhNhanCho) => {
                    const daCo = daCoSinhHieuIds.has(row.idLuotKham);
                    return daCo ? (
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setBenhNhanCanCapNhat(row);
                            }}
                        >
                            Cập nhật sinh hiệu
                        </Button>
                    ) : (
                        <Button
                            variant="primary"
                            onClick={() => {
                                setBenhNhanCanXacNhan(row);
                            }}
                        >
                            Ghi nhận sinh hiệu
                        </Button>
                    );
                },
            },
        ]
        : cacCotCoBan;

    const tenHienThi =
        user?.hoTen || user?.tenDangNhap || "Nhân viên";

    const vaiTroHienThi =
        user?.vaiTro || "Nhân viên";

    const sidebarItems = laLeTan
        ? [
            { label: 'Tổng quan', href: '/staff', active: false },
            { label: 'Tiếp nhận bệnh nhân', href: '/staff/patient-search', active: false },
            { label: 'Đặt lịch', href: '/staff/lich-kham/dat-tai-quay', active: false },
            { label: 'Danh sách chờ', href: '/staff/benh-nhan-cho', active: true },
        ]
        : [
            {
                label: 'Tổng quan',
                href: '/staff',
            },
            {
                label: 'Hàng chờ',
                href: '/staff/benh-nhan-cho',
                active: true,
            },
        ];

    return (
        <MainLayout
            doctorName={tenHienThi}
            roleLabel={vaiTroHienThi}
            sidebarLogout={laLeTan}
            sidebarItems={sidebarItems}
        >
            <div className="danh-sach-benh-nhan-cho">
                <div className="danh-sach-benh-nhan-cho__breadcrumb">
                    <Link to="/staff">
                        Dashboard
                    </Link>

                    <span>/</span>

                    <span>Bệnh nhân chờ</span>
                </div>

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
                            onClick={() => void taiDanhSach()}
                            loading={dangTai}
                            loadingText="Đang tải..."
                        >
                            ↻ Làm mới
                        </Button>
                    </div>
                </div>

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

                <Card>
                    <div className="danh-sach-benh-nhan-cho__filters">
                        <div className="filter-search">
                            <SearchBox
                                label="Tìm bệnh nhân"
                                placeholder="Nhập mã hoặc tên bệnh nhân..."
                                value={tuKhoa}
                                onChange={(event) => {
                                    setTuKhoa(
                                        event.target.value
                                    );
                                }}
                            />
                        </div>

                        <div className="filter-date">
                            <Input
                                id="ngay-kham"
                                type="date"
                                label="Ngày khám"
                                value={ngayKham}
                                onChange={(event) => {
                                    setNgayKham(
                                        event.target.value
                                    );
                                }}
                            />
                        </div>
                    </div>
                </Card>

                {loi && (
                    <div
                        className="danh-sach-benh-nhan-cho__error"
                        role="alert"
                    >
                        {loi}
                    </div>
                )}

                <Card title={tieuDeDanhSach}>
                    <Table
                        columns={cot}
                        data={danhSachLoc}
                        rowKey={(row) => row.idLuotKham}
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