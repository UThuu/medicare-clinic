import {
    useMemo,
    useState,
    type FormEvent,
    type MouseEvent,
} from "react";

import {
    Button,
    Card,
    Input,
    StatusBadge,
} from "../components";

import { MainLayout } from "../components/layout/MainLayout";

import type { BenhNhanCho } from "../types/LuotKham";

import {
    ghiNhanSinhHieu,
} from "../services/DichVuSinhHieu";

import "./ghiNhanSinhHieu.css";

interface GhiNhanSinhHieuProps {
    benhNhan: BenhNhanCho;
    onQuayLai?: () => void;
    onLuuThanhCong?: () => void;
}

function dinhDangNgay(ngay: string) {
    if (!ngay) return "—";

    const [nam, thang, ngayTrongThang] =
        ngay.split("-");

    if (!nam || !thang || !ngayTrongThang) {
        return ngay;
    }

    return `${ngayTrongThang}/${thang}/${nam}`;
}

function dinhDangGio(gio: string) {
    if (!gio) return "—";

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

export default function GhiNhanSinhHieu({
                                            benhNhan,
                                            onQuayLai,
                                            onLuuThanhCong,
                                        }: GhiNhanSinhHieuProps) {

    // =========================
    // DỮ LIỆU FORM
    // =========================

    const [huyetApTamThu, setHuyetApTamThu] =
        useState("");

    const [huyetApTamTruong, setHuyetApTamTruong] =
        useState("");

    const [canNang, setCanNang] =
        useState("");

    const [nhietDo, setNhietDo] =
        useState("");

    // =========================
    // TRẠNG THÁI
    // =========================

    const [dangLuu, setDangLuu] =
        useState(false);

    const [loi, setLoi] =
        useState("");

    const [thanhCong, setThanhCong] =
        useState("");

    // =========================
    // MÃ ĐIỀU DƯỠNG TEST
    // =========================

    const maDieuDuong = "NV004";

    // =========================
    // KIỂM TRA FORM
    // =========================

    const bieuMauHopLe = useMemo(() => {

        const tamThu =
            Number(huyetApTamThu);

        const tamTruong =
            Number(huyetApTamTruong);

        const trongLuong =
            Number(canNang);

        const nhiet =
            Number(nhietDo);

        return (
            huyetApTamThu.trim() !== "" &&
            huyetApTamTruong.trim() !== "" &&
            canNang.trim() !== "" &&
            nhietDo.trim() !== "" &&

            Number.isFinite(tamThu) &&
            Number.isFinite(tamTruong) &&
            Number.isFinite(trongLuong) &&
            Number.isFinite(nhiet) &&

            tamThu > 0 &&
            tamTruong > 0 &&
            trongLuong > 0 &&
            nhiet > 0
        );

    }, [
        huyetApTamThu,
        huyetApTamTruong,
        canNang,
        nhietDo,
    ]);

    // =========================
    // ĐẶT LẠI
    // =========================

    function datLai(
        event?: MouseEvent<HTMLButtonElement>
    ) {
        /*
         * Không cho nút Đặt lại
         * submit form.
         */
        event?.preventDefault();

        setHuyetApTamThu("");
        setHuyetApTamTruong("");
        setCanNang("");
        setNhietDo("");

        setLoi("");
        setThanhCong("");
    }

    // =========================
    // LƯU SINH HIỆU
    // =========================

    async function xuLyLuu(
        event: FormEvent<HTMLFormElement>
    ) {

        event.preventDefault();

        setLoi("");
        setThanhCong("");

        if (!bieuMauHopLe) {

            setLoi(
                "Vui lòng nhập đầy đủ và kiểm tra các giá trị sinh hiệu."
            );

            return;
        }

        try {

            setDangLuu(true);

            await ghiNhanSinhHieu(
                benhNhan.idLuotKham,
                {
                    maDieuDuong,

                    huyetApTamThu:
                        Number(huyetApTamThu),

                    huyetApTamTruong:
                        Number(huyetApTamTruong),

                    canNang:
                        Number(canNang),

                    nhietDo:
                        Number(nhietDo),
                }
            );

            setThanhCong(
                "Ghi nhận sinh hiệu thành công."
            );

            if (onLuuThanhCong) {
                onLuuThanhCong();
            }

        } catch (error) {

            console.error(error);

            if (error instanceof Error) {

                setLoi(error.message);

            } else {

                setLoi(
                    "Không thể lưu sinh hiệu. Vui lòng thử lại."
                );
            }

        } finally {

            setDangLuu(false);
        }
    }

    return (
        <MainLayout
            doctorName="Nguyễn Thùy Trang"
            roleLabel="Điều dưỡng"
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

            <div className="ghi-nhan-sinh-hieu">

                {/* =========================
                    HEADER
                   ========================= */}

                <div className="ghi-nhan-sinh-hieu__header">

                    <div>

                        <h1>
                            Ghi nhận sinh hiệu
                        </h1>

                        <p>
                            Ghi nhận thông tin sinh hiệu
                            trước khi bệnh nhân vào khám
                        </p>

                    </div>

                    <StatusBadge tone="warning">
                        Đang chờ
                    </StatusBadge>

                </div>


                {/* =========================
                    BỆNH NHÂN
                   ========================= */}

                <Card>

                    <div className="patient-heading">
                        BỆNH NHÂN
                    </div>

                    <div className="patient-name">
                        {benhNhan.hoTen}
                    </div>

                    <div className="patient-grid">

                        <div>
                            <span>
                                Mã bệnh nhân
                            </span>

                            <strong>
                                {benhNhan.idBenhNhan}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Giới tính
                            </span>

                            <strong>
                                {hienThiGioiTinh(
                                    benhNhan.gioiTinh
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Ngày sinh
                            </span>

                            <strong>
                                {dinhDangNgay(
                                    benhNhan.ngaySinh
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Số điện thoại
                            </span>

                            <strong>
                                {benhNhan.soDienThoai || "—"}
                            </strong>
                        </div>

                    </div>

                </Card>


                {/* =========================
                    THÔNG TIN LƯỢT KHÁM
                   ========================= */}

                <Card title="Thông tin lượt khám">

                    <div className="visit-grid">

                        <div>

                            <span>
                                Mã lượt khám
                            </span>

                            <strong>
                                {benhNhan.idLuotKham}
                            </strong>

                        </div>

                        <div>

                            <span>
                                Ngày / giờ khám
                            </span>

                            <strong>
                                {dinhDangNgay(
                                    benhNhan.ngayKham
                                )}
                                {" - "}
                                {dinhDangGio(
                                    benhNhan.gioKham
                                )}
                            </strong>

                        </div>

                        <div>

                            <span>
                                Lý do khám
                            </span>

                            <strong>
                                {benhNhan.lyDoKham || "—"}
                            </strong>

                        </div>

                    </div>

                </Card>


                {/* =========================
                    FORM SINH HIỆU
                   ========================= */}

                <form onSubmit={xuLyLuu}>

                    <Card title="Sinh hiệu">

                        <div className="vital-section">

                            {/* HUYẾT ÁP */}

                            <div className="vital-group">

                                <div className="vital-group__title">
                                    Huyết áp
                                </div>

                                <div className="blood-pressure-grid">

                                    <Input
                                        id="huyet-ap-tam-thu"
                                        type="number"
                                        label="Tâm thu"
                                        placeholder="120"
                                        value={huyetApTamThu}
                                        min="1"
                                        onChange={(event) =>
                                            setHuyetApTamThu(
                                                event.target.value
                                            )
                                        }
                                    />

                                    <Input
                                        id="huyet-ap-tam-truong"
                                        type="number"
                                        label="Tâm trương"
                                        placeholder="80"
                                        value={huyetApTamTruong}
                                        min="1"
                                        onChange={(event) =>
                                            setHuyetApTamTruong(
                                                event.target.value
                                            )
                                        }
                                    />

                                    <span className="vital-unit">
                                        mmHg
                                    </span>

                                </div>

                            </div>


                            {/* CÂN NẶNG + NHIỆT ĐỘ */}

                            <div className="vital-fields">

                                <div className="vital-input">

                                    <Input
                                        id="can-nang"
                                        type="number"
                                        label="Cân nặng"
                                        placeholder="70"
                                        value={canNang}
                                        min="0.1"
                                        step="0.1"
                                        onChange={(event) =>
                                            setCanNang(
                                                event.target.value
                                            )
                                        }
                                    />

                                    <span className="vital-input__unit">
                                        kg
                                    </span>

                                </div>


                                <div className="vital-input">

                                    <Input
                                        id="nhiet-do"
                                        type="number"
                                        label="Nhiệt độ"
                                        placeholder="36.5"
                                        value={nhietDo}
                                        min="0.1"
                                        step="0.1"
                                        onChange={(event) =>
                                            setNhietDo(
                                                event.target.value
                                            )
                                        }
                                    />

                                    <span className="vital-input__unit">
                                        °C
                                    </span>

                                </div>

                            </div>

                        </div>


                        {/* =========================
                            LỖI
                           ========================= */}

                        {loi && (

                            <div className="ghi-nhan-sinh-hieu__error">

                                <strong>
                                    Có lỗi dữ liệu
                                </strong>

                                <span>
                                    {loi}
                                </span>

                            </div>

                        )}


                        {/* =========================
                            THÀNH CÔNG
                           ========================= */}

                        {thanhCong && (

                            <div className="ghi-nhan-sinh-hieu__success">
                                {thanhCong}
                            </div>

                        )}


                        {/* =========================
                            BUTTON
                           ========================= */}

                        <div className="ghi-nhan-sinh-hieu__actions">

                            <Button
                                type="button"
                                variant="secondary"
                                onClick={datLai}
                                disabled={dangLuu}
                            >
                                Đặt lại
                            </Button>


                            <Button
                                type="submit"
                                disabled={
                                    !bieuMauHopLe ||
                                    dangLuu
                                }
                                loading={dangLuu}
                                loadingText="Đang lưu..."
                            >
                                Lưu sinh hiệu
                            </Button>

                        </div>

                    </Card>

                </form>


                {/* =========================
                    QUAY LẠI
                   ========================= */}

                <div className="ghi-nhan-sinh-hieu__back">

                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onQuayLai}
                        disabled={dangLuu}
                    >
                        ← Quay lại danh sách bệnh nhân
                    </Button>

                </div>

            </div>

        </MainLayout>
    );
}