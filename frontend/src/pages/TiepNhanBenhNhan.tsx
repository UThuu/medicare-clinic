import { useState } from "react";

import { MainLayout } from "../components/layout/MainLayout";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";

import {
    timBenhNhanTheoSoDienThoai,
    timBenhNhanTheoHoTenVaNgaySinh,
    layLichKhamHomNay,
    tiepNhanBenhNhan,
} from "../services/DichVuTiepNhan";

import type {
    BenhNhanTiepNhan,
    LichKhamTiepNhan,
} from "../types/TiepNhanBenhNhan";

import "./tiepNhanBenhNhan.css";

interface TiepNhanBenhNhanProps {
    onChuyenUC29?: () => void;
    onChuyenUC30?: (benhNhan: BenhNhanTiepNhan) => void;
    onTiepNhanThanhCong?: () => void;
}

function dinhDangNgay(ngay: string): string {
    if (!ngay) {
        return "";
    }

    const parts = ngay.split("-");

    if (parts.length !== 3) {
        return ngay;
    }

    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function dinhDangGio(gio: string): string {
    if (!gio) {
        return "";
    }

    return gio.length >= 5 ? gio.substring(0, 5) : gio;
}

function hienThiGioiTinh(gioiTinh: string): string {
    switch (gioiTinh) {
        case "NAM":
            return "Nam";

        case "NU":
            return "Nữ";

        case "KHAC":
            return "Khác";

        default:
            return gioiTinh || "—";
    }
}

function hienThiTrangThai(
    trangThai: LichKhamTiepNhan["trangThai"]
): string {
    switch (trangThai) {
        case "DA_DAT":
            return "Đã đặt";

        case "DA_TIEP_NHAN":
            return "Đã tiếp nhận";

        case "DA_HUY":
            return "Đã hủy";

        default:
            return trangThai;
    }
}

export default function TiepNhanBenhNhan({
                                             onChuyenUC29,
                                             onChuyenUC30,
                                             onTiepNhanThanhCong,
                                         }: TiepNhanBenhNhanProps) {
    // =========================
    // TÌM BỆNH NHÂN
    // =========================

    const [soDienThoai, setSoDienThoai] = useState("");
    const [hoTen, setHoTen] = useState("");
    const [ngaySinh, setNgaySinh] = useState("");

    const [benhNhans, setBenhNhans] = useState<BenhNhanTiepNhan[]>([]);
    const [benhNhanDangChon, setBenhNhanDangChon] =
        useState<BenhNhanTiepNhan | null>(null);

    // =========================
    // LỊCH KHÁM
    // =========================

    const [lichKham, setLichKham] = useState<LichKhamTiepNhan[]>([]);
    const [lichKhamDangChon, setLichKhamDangChon] =
        useState<LichKhamTiepNhan | null>(null);

    // =========================
    // TRẠNG THÁI
    // =========================

    const [dangTim, setDangTim] = useState(false);
    const [dangTaiLich, setDangTaiLich] = useState(false);
    const [dangTiepNhan, setDangTiepNhan] = useState(false);

    const [loi, setLoi] = useState("");
    const [thongBao, setThongBao] = useState("");

    // =========================
    // TÌM BỆNH NHÂN
    // =========================

    const timBenhNhan = async () => {
        setLoi("");
        setThongBao("");

        setBenhNhans([]);
        setBenhNhanDangChon(null);

        setLichKham([]);
        setLichKhamDangChon(null);

        const sdt = soDienThoai.trim();
        const ten = hoTen.trim();

        if (!sdt && !ten) {
            setLoi(
                "Vui lòng nhập số điện thoại hoặc họ tên và ngày sinh."
            );
            return;
        }

        if (!sdt && ten && !ngaySinh) {
            setLoi(
                "Vui lòng nhập ngày sinh khi tìm theo họ tên."
            );
            return;
        }

        try {
            setDangTim(true);

            let ketQua: BenhNhanTiepNhan[];

            if (sdt) {
                ketQua = await timBenhNhanTheoSoDienThoai(sdt);
            } else {
                ketQua = await timBenhNhanTheoHoTenVaNgaySinh(
                    ten,
                    ngaySinh
                );
            }

            setBenhNhans(ketQua);

            if (ketQua.length === 0) {
                setThongBao(
                    "Không tìm thấy bệnh nhân phù hợp."
                );
            }
        } catch (error) {
            console.error(error);

            setLoi(
                error instanceof Error
                    ? error.message
                    : "Không thể tìm kiếm bệnh nhân."
            );
        } finally {
            setDangTim(false);
        }
    };

    // =========================
    // XÁC NHẬN HỒ SƠ
    // =========================

    const xacNhanHoSo = async (
        benhNhan: BenhNhanTiepNhan
    ) => {
        setLoi("");
        setThongBao("");

        setBenhNhanDangChon(benhNhan);
        setLichKham([]);
        setLichKhamDangChon(null);

        try {
            setDangTaiLich(true);

            const ketQua = await layLichKhamHomNay(
                benhNhan.idBenhNhan
            );

            setLichKham(ketQua);

            if (ketQua.length === 0) {
                setThongBao(
                    "Bệnh nhân không có lịch khám hôm nay."
                );
            }
        } catch (error) {
            console.error(error);

            setLoi(
                error instanceof Error
                    ? error.message
                    : "Không thể tải lịch khám hôm nay."
            );
        } finally {
            setDangTaiLich(false);
        }
    };

    // =========================
    // CHỌN LỊCH KHÁM
    // =========================

    const chonLichKham = (
        lich: LichKhamTiepNhan
    ) => {
        if (
            lich.trangThai !== "DA_DAT" ||
            lich.daCoLuotKham
        ) {
            return;
        }

        setLoi("");
        setThongBao("");
        setLichKhamDangChon(lich);
    };

    // =========================
    // TIẾP NHẬN BỆNH NHÂN
    // =========================

    const xacNhanTiepNhan = async () => {
        if (!benhNhanDangChon) {
            setLoi("Vui lòng xác nhận hồ sơ bệnh nhân.");
            return;
        }

        if (!lichKhamDangChon) {
            setLoi("Vui lòng chọn lịch khám.");
            return;
        }

        setLoi("");
        setThongBao("");

        try {
            setDangTiepNhan(true);

            const ketQua = await tiepNhanBenhNhan({
                idBenhNhan: benhNhanDangChon.idBenhNhan,
                idLichKham: lichKhamDangChon.idLichKham,
            });

            if (!ketQua.thanhCong) {
                setLoi(
                    ketQua.thongBao ||
                    "Không thể tiếp nhận bệnh nhân."
                );
                return;
            }

            setThongBao(
                ketQua.thongBao ||
                "Tiếp nhận bệnh nhân thành công."
            );

            // Cập nhật trạng thái lịch trên giao diện
            setLichKham((danhSachCu) =>
                danhSachCu.map((item) =>
                    item.idLichKham ===
                    lichKhamDangChon.idLichKham
                        ? {
                            ...item,
                            trangThai: "DA_TIEP_NHAN",
                            daCoLuotKham: true,
                        }
                        : item
                )
            );

            setLichKhamDangChon(null);

            if (onTiepNhanThanhCong) {
                onTiepNhanThanhCong();
            }
        } catch (error) {
            console.error(error);

            setLoi(
                error instanceof Error
                    ? error.message
                    : "Có lỗi xảy ra khi tiếp nhận bệnh nhân."
            );
        } finally {
            setDangTiepNhan(false);
        }
    };

    // =========================
    // RESET
    // =========================

    const datLai = () => {
        setSoDienThoai("");
        setHoTen("");
        setNgaySinh("");

        setBenhNhans([]);
        setBenhNhanDangChon(null);

        setLichKham([]);
        setLichKhamDangChon(null);

        setLoi("");
        setThongBao("");
    };

    // =========================
    // RENDER
    // =========================

    return (
        <MainLayout
            doctorName="Nguyễn Thùy Trang"
            roleLabel="Lễ tân"
            hotline="1900 0000"
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
                    label: "Tiếp nhận",
                    href: "#",
                    active: true,
                },
                {
                    label: "Bệnh nhân chờ",
                    href: "#",
                },
                {
                    label: "Bệnh nhân",
                    href: "#",
                },
            ]}
        >
            <div className="tiep-nhan">

                {/* ================= HEADER ================= */}

                <header className="tiep-nhan__header">
                    <div>
                        <h1>Tiếp nhận bệnh nhân</h1>

                        <p>
                            Tìm hồ sơ, kiểm tra lịch khám và
                            tiếp nhận bệnh nhân đến khám.
                        </p>
                    </div>
                </header>

                {/* ================= TÌM HỒ SƠ ================= */}

                <Card>
                    <div className="tiep-nhan__search-card">
                        <div className="tiep-nhan__search-title">
                            <h2>Tìm hồ sơ bệnh nhân</h2>

                            <p>
                                Nhập số điện thoại hoặc họ tên
                                và ngày sinh để tìm kiếm.
                            </p>
                        </div>

                        <div className="tiep-nhan__search-grid">

                            {/* SỐ ĐIỆN THOẠI */}

                            <div className="tiep-nhan__field">
                                <label htmlFor="soDienThoai">
                                    Số điện thoại
                                </label>

                                <input
                                    id="soDienThoai"
                                    type="text"
                                    value={soDienThoai}
                                    onChange={(e) =>
                                        setSoDienThoai(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Nhập số điện thoại"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            timBenhNhan();
                                        }
                                    }}
                                />
                            </div>

                            {/* HOẶC */}

                            <div className="tiep-nhan__or">
                                <span>HOẶC</span>
                            </div>

                            {/* HỌ TÊN + NGÀY SINH */}

                            <div className="tiep-nhan__search-row">

                                <div className="tiep-nhan__field">
                                    <label htmlFor="hoTen">
                                        Họ và tên
                                    </label>

                                    <input
                                        id="hoTen"
                                        type="text"
                                        value={hoTen}
                                        onChange={(e) =>
                                            setHoTen(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Nhập họ và tên"
                                    />
                                </div>

                                <div className="tiep-nhan__field">
                                    <label htmlFor="ngaySinh">
                                        Ngày sinh
                                    </label>

                                    <input
                                        id="ngaySinh"
                                        type="date"
                                        value={ngaySinh}
                                        onChange={(e) =>
                                            setNgaySinh(
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>

                            </div>

                            {/* BUTTON */}

                            <div className="tiep-nhan__search-action">

                                <Button
                                    type="button"
                                    onClick={timBenhNhan}
                                    loading={dangTim}
                                    loadingText="Đang tìm..."
                                >
                                    Tìm bệnh nhân
                                </Button>

                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={datLai}
                                    disabled={dangTim}
                                >
                                    Đặt lại
                                </Button>

                            </div>
                        </div>
                    </div>
                </Card>

                {/* ================= THÔNG BÁO LỖI ================= */}

                {loi && (
                    <div
                        className="tiep-nhan__alert tiep-nhan__alert--error"
                        role="alert"
                    >
                        <span className="tiep-nhan__alert-icon">
                            !
                        </span>

                        <span>{loi}</span>
                    </div>
                )}

                {/* ================= THÔNG BÁO THÀNH CÔNG ================= */}

                {thongBao && !loi && (
                    <div
                        className="tiep-nhan__alert tiep-nhan__alert--success"
                        role="status"
                    >
                        <span className="tiep-nhan__alert-icon">
                            ✓
                        </span>

                        <span>{thongBao}</span>
                    </div>
                )}

                {/* ================= KẾT QUẢ TÌM KIẾM ================= */}

                {benhNhans.length > 0 && (
                    <section className="tiep-nhan__result">

                        <div className="tiep-nhan__section-title">
                            <div>
                                <h2>Kết quả tìm kiếm</h2>

                                <span>
                                    {benhNhans.length} bệnh nhân
                                    được tìm thấy
                                </span>
                            </div>
                        </div>

                        <div className="tiep-nhan__patient-list">

                            {benhNhans.map((benhNhan) => {

                                const dangChon =
                                    benhNhanDangChon?.idBenhNhan ===
                                    benhNhan.idBenhNhan;

                                return (
                                    <div
                                        className={`tiep-nhan__patient-card ${
                                            dangChon
                                                ? "tiep-nhan__patient-card--selected"
                                                : ""
                                        }`}
                                        key={benhNhan.idBenhNhan}
                                    >

                                        {/* TOP */}

                                        <div className="patient-card__top">

                                            <div className="patient-card__identity">

                                                <div className="patient-card__avatar">
                                                    {benhNhan.hoTen
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>

                                                <div>
                                                    <h3>
                                                        {
                                                            benhNhan.hoTen
                                                        }
                                                    </h3>

                                                    <span>
                                                        Bệnh nhân
                                                    </span>
                                                </div>

                                            </div>

                                            <span className="patient-card__code">
                                                {
                                                    benhNhan.idBenhNhan
                                                }
                                            </span>

                                        </div>

                                        {/* INFO */}

                                        <div className="patient-card__info">

                                            <div className="patient-info">
                                                <span>
                                                    Ngày sinh
                                                </span>

                                                <strong>
                                                    {dinhDangNgay(
                                                        benhNhan.ngaySinh
                                                    )}
                                                </strong>
                                            </div>

                                            <div className="patient-info">
                                                <span>
                                                    Giới tính
                                                </span>

                                                <strong>
                                                    {hienThiGioiTinh(
                                                        benhNhan.gioiTinh
                                                    )}
                                                </strong>
                                            </div>

                                            <div className="patient-info">
                                                <span>
                                                    Số điện thoại
                                                </span>

                                                <strong>
                                                    {
                                                        benhNhan.soDienThoai
                                                    }
                                                </strong>
                                            </div>

                                            {benhNhan.diaChi && (
                                                <div className="patient-info patient-info--address">
                                                    <span>
                                                        Địa chỉ
                                                    </span>

                                                    <strong>
                                                        {
                                                            benhNhan.diaChi
                                                        }
                                                    </strong>
                                                </div>
                                            )}

                                        </div>

                                        {/* ACTION */}

                                        <div className="patient-card__action">

                                            <Button
                                                type="button"
                                                variant={
                                                    dangChon
                                                        ? "primary"
                                                        : "secondary"
                                                }
                                                onClick={() =>
                                                    xacNhanHoSo(
                                                        benhNhan
                                                    )
                                                }
                                                loading={
                                                    dangChon &&
                                                    dangTaiLich
                                                }
                                                loadingText="Đang tải..."
                                            >
                                                {dangChon
                                                    ? "Đã chọn hồ sơ"
                                                    : "Xác nhận hồ sơ"}
                                            </Button>

                                        </div>

                                    </div>
                                );
                            })}

                        </div>
                    </section>
                )}

                {/* ================= KHÔNG TÌM THẤY ================= */}

                {!dangTim &&
                    benhNhans.length === 0 &&
                    thongBao.includes(
                        "Không tìm thấy"
                    ) && (

                        <div className="tiep-nhan__empty">

                            <div className="tiep-nhan__empty-icon">
                                ?
                            </div>

                            <h3>
                                Không tìm thấy bệnh nhân
                            </h3>

                            <p>
                                Kiểm tra lại thông tin tìm kiếm
                                hoặc tạo hồ sơ bệnh nhân mới.
                            </p>

                            {onChuyenUC29 && (
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={onChuyenUC29}
                                >
                                    Tạo hồ sơ bệnh nhân
                                </Button>
                            )}

                        </div>
                    )}

                {/* ================= LỊCH KHÁM ================= */}

                {benhNhanDangChon && (
                    <section className="tiep-nhan__appointments">

                        <div className="tiep-nhan__section-title">

                            <div>

                                <h2>
                                    Lịch khám hôm nay
                                </h2>

                                <span>
                                    {benhNhanDangChon.hoTen}
                                    {" · "}
                                    {dinhDangNgay(
                                        new Date()
                                            .toISOString()
                                            .split("T")[0]
                                    )}
                                </span>

                            </div>

                        </div>

                        {dangTaiLich ? (

                            <div className="tiep-nhan__loading">
                                Đang tải lịch khám...
                            </div>

                        ) : lichKham.length === 0 ? (

                            <div className="tiep-nhan__empty">

                                <div className="tiep-nhan__empty-icon">
                                    !
                                </div>

                                <h3>
                                    Không có lịch khám hôm nay
                                </h3>

                                <p>
                                    Bệnh nhân chưa có lịch khám
                                    trong ngày hôm nay.
                                </p>

                                {onChuyenUC30 && (
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() =>
                                            onChuyenUC30(
                                                benhNhanDangChon
                                            )
                                        }
                                    >
                                        Đặt lịch khám tại quầy
                                    </Button>
                                )}

                            </div>

                        ) : (

                            <>

                                <div className="appointment-list">

                                    {lichKham.map((lich) => {

                                        const coTheChon =
                                            lich.trangThai ===
                                            "DA_DAT" &&
                                            !lich.daCoLuotKham;

                                        const dangChon =
                                            lichKhamDangChon?.idLichKham ===
                                            lich.idLichKham;

                                        return (
                                            <button
                                                type="button"
                                                key={lich.idLichKham}
                                                className={`appointment-card ${
                                                    dangChon
                                                        ? "appointment-card--selected"
                                                        : ""
                                                } ${
                                                    !coTheChon
                                                        ? "appointment-card--disabled"
                                                        : ""
                                                }`}
                                                disabled={!coTheChon}
                                                onClick={() =>
                                                    chonLichKham(
                                                        lich
                                                    )
                                                }
                                            >

                                                <div className="appointment-card__time">
                                                    {dinhDangGio(
                                                        lich.gioKham
                                                    )}
                                                </div>

                                                <div className="appointment-card__content">

                                                    <div className="appointment-card__title">
                                                        Lịch khám
                                                    </div>

                                                    <div className="appointment-card__doctor">
                                                        Bác sĩ:{" "}
                                                        {
                                                            lich.maBacSi
                                                        }
                                                    </div>

                                                    <div className="appointment-card__id">
                                                        {
                                                            lich.idLichKham
                                                        }
                                                    </div>

                                                </div>

                                                <div className="appointment-card__status">

                                                    <span
                                                        className={`appointment-status appointment-status--${lich.trangThai.toLowerCase()}`}
                                                    >
                                                        {
                                                            hienThiTrangThai(
                                                                lich.trangThai
                                                            )
                                                        }
                                                    </span>

                                                    {lich.daCoLuotKham && (
                                                        <span className="appointment-card__note">
                                                            Đã có lượt
                                                            khám
                                                        </span>
                                                    )}

                                                </div>

                                                <div className="appointment-card__radio">

                                                    <span
                                                        className={
                                                            dangChon
                                                                ? "appointment-radio appointment-radio--selected"
                                                                : "appointment-radio"
                                                        }
                                                    >
                                                        {dangChon
                                                            ? "✓"
                                                            : ""}
                                                    </span>

                                                </div>

                                            </button>
                                        );
                                    })}

                                </div>

                                {/* ================= XÁC NHẬN TIẾP NHẬN ================= */}

                                <div className="tiep-nhan__confirm">

                                    <div>

                                        {lichKhamDangChon ? (

                                            <>
                                                <strong>
                                                    Đã chọn lịch{" "}
                                                    {
                                                        lichKhamDangChon.idLichKham
                                                    }
                                                </strong>

                                                <span>
                                                    {dinhDangGio(
                                                        lichKhamDangChon.gioKham
                                                    )}{" "}
                                                    ·{" "}
                                                    {
                                                        benhNhanDangChon.hoTen
                                                    }
                                                </span>
                                            </>

                                        ) : (

                                            <>
                                                <strong>
                                                    Chưa chọn lịch khám
                                                </strong>

                                                <span>
                                                    Vui lòng chọn một
                                                    lịch hợp lệ để
                                                    tiếp nhận.
                                                </span>
                                            </>

                                        )}

                                    </div>

                                    <Button
                                        type="button"
                                        onClick={
                                            xacNhanTiepNhan
                                        }
                                        disabled={
                                            !lichKhamDangChon ||
                                            dangTiepNhan
                                        }
                                        loading={dangTiepNhan}
                                        loadingText="Đang tiếp nhận..."
                                    >
                                        Xác nhận tiếp nhận
                                    </Button>

                                </div>

                            </>

                        )}

                    </section>
                )}

            </div>
        </MainLayout>
    );
}