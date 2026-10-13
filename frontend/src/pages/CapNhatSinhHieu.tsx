import {
    useEffect,
    useState,
} from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

import {
    Button,
    Card,
    Input,
} from "../components";

import { MainLayout } from "../components/layout/MainLayout";

import type {
    BenhNhanCho,
} from "../types/LuotKham";

import type {
    SinhHieuResponse,
} from "../types/SinhHieu";

import {
    capNhatSinhHieu,
    laySinhHieu,
} from "../services/sinhHieuService";

import "./capNhatSinhHieu.css";

interface CapNhatSinhHieuProps {
    benhNhan: BenhNhanCho;
    onQuayLai?: () => void;
    onCapNhatThanhCong?: () => void;
}

function dinhDangNgay(ngay: string) {
    if (!ngay) return "";

    const [
        nam,
        thang,
        ngayTrongThang,
    ] = ngay.split("-");

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

export default function CapNhatSinhHieu({
                                            benhNhan,
                                            onQuayLai,
                                            onCapNhatThanhCong,
                                        }: CapNhatSinhHieuProps) {

    // =========================
    // DỮ LIỆU SINH HIỆU
    // =========================

    const [
        sinhHieu,
        setSinhHieu,
    ] = useState<SinhHieuResponse | null>(null);

    // =========================
    // FORM
    // =========================

    const [
        huyetApTamThu,
        setHuyetApTamThu,
    ] = useState("");

    const [
        huyetApTamTruong,
        setHuyetApTamTruong,
    ] = useState("");

    const [
        canNang,
        setCanNang,
    ] = useState("");

    const [
        nhietDo,
        setNhietDo,
    ] = useState("");

    // =========================
    // TRẠNG THÁI
    // =========================

    const [
        dangTai,
        setDangTai,
    ] = useState(true);

    const [
        dangLuu,
        setDangLuu,
    ] = useState(false);

    const [
        loi,
        setLoi,
    ] = useState("");

    const [
        thanhCong,
        setThanhCong,
    ] = useState("");

    // =========================
    // TẢI SINH HIỆU CŨ
    // =========================

    useEffect(() => {

        let dangTonTai = true;

        async function taiSinhHieu() {

            try {

                setDangTai(true);
                setLoi("");

                const duLieu =
                    await laySinhHieu(
                        benhNhan.idLuotKham
                    );

                if (!dangTonTai) {
                    return;
                }

                if (!duLieu) {
                    setLoi(
                        "Lượt khám này chưa có sinh hiệu để chỉnh sửa."
                    );

                    return;
                }

                setSinhHieu(duLieu);

                setHuyetApTamThu(
                    String(duLieu.huyetApTamThu)
                );

                setHuyetApTamTruong(
                    String(duLieu.huyetApTamTruong)
                );

                setCanNang(
                    String(duLieu.canNang)
                );

                setNhietDo(
                    String(duLieu.nhietDo)
                );

            } catch (error) {

                console.error(error);

                if (dangTonTai) {
                    setLoi(
                        error instanceof Error
                            ? error.message
                            : "Không thể tải sinh hiệu."
                    );
                }

            } finally {

                if (dangTonTai) {
                    setDangTai(false);
                }
            }
        }

        void taiSinhHieu();

        return () => {
            dangTonTai = false;
        };

    }, [benhNhan.idLuotKham]);

    // =========================
    // HỦY
    // =========================

    const xuLyHuy = () => {

        if (onQuayLai) {
            onQuayLai();
        }
    };

    // =========================
    // LƯU THAY ĐỔI
    // =========================

    const xuLyLuu = async () => {

        setLoi("");
        setThanhCong("");

        if (
            !huyetApTamThu.trim()
            || !huyetApTamTruong.trim()
            || !canNang.trim()
            || !nhietDo.trim()
        ) {

            setLoi(
                "Vui lòng nhập đầy đủ thông tin sinh hiệu."
            );

            return;
        }

        const tamThu =
            Number(huyetApTamThu);

        const tamTruong =
            Number(huyetApTamTruong);

        const canNangMoi =
            Number(canNang);

        const nhietDoMoi =
            Number(nhietDo);

        if (
            !Number.isFinite(tamThu)
            || tamThu <= 0
        ) {

            setLoi(
                "Huyết áp tâm thu không hợp lệ."
            );

            return;
        }

        if (
            !Number.isFinite(tamTruong)
            || tamTruong <= 0
        ) {

            setLoi(
                "Huyết áp tâm trương không hợp lệ."
            );

            return;
        }

        if (
            !Number.isFinite(canNangMoi)
            || canNangMoi <= 0
        ) {

            setLoi(
                "Cân nặng không hợp lệ."
            );

            return;
        }

        if (
            !Number.isFinite(nhietDoMoi)
            || nhietDoMoi <= 0
        ) {

            setLoi(
                "Nhiệt độ không hợp lệ."
            );

            return;
        }

        try {

            setDangLuu(true);

            const ketQua =
                await capNhatSinhHieu(
                    benhNhan.idLuotKham,
                    {
                        huyetApTamThu: tamThu,
                        huyetApTamTruong: tamTruong,
                        canNang: canNangMoi,
                        nhietDo: nhietDoMoi,
                    }
                );

            setSinhHieu(ketQua);

            setHuyetApTamThu(
                String(ketQua.huyetApTamThu)
            );

            setHuyetApTamTruong(
                String(ketQua.huyetApTamTruong)
            );

            setCanNang(
                String(ketQua.canNang)
            );

            setNhietDo(
                String(ketQua.nhietDo)
            );

            setThanhCong(
                "Cập nhật sinh hiệu thành công."
            );

            if (onCapNhatThanhCong) {
                onCapNhatThanhCong();
            }

        } catch (error) {

            console.error(error);

            setLoi(
                error instanceof Error
                    ? error.message
                    : "Không thể cập nhật sinh hiệu."
            );

        } finally {

            setDangLuu(false);
        }
    };

    // =========================
    // GIAO DIỆN
    // =========================

    const { user } = useAuth();
    const tenHienThi = user?.hoTen || user?.tenDangNhap || "Điều dưỡng";
    const vaiTroHienThi = user?.vaiTro || "Điều dưỡng";

    const sidebarItems = [
        {
            label: "Tổng quan",
            href: "/staff",
        },
        {
            label: "Hàng chờ",
            href: "/staff/benh-nhan-cho",
            active: true,
        },
    ];

    return (
        <MainLayout
            doctorName={tenHienThi}
            roleLabel={vaiTroHienThi}
            sidebarItems={sidebarItems}
        >

            <div className="cap-nhat-sinh-hieu">

                {/* BREADCRUMB */}

                <div className="danh-sach-benh-nhan-cho__breadcrumb" style={{ marginBottom: 12 }}>
                    <Link to="/staff">
                        Tổng quan
                    </Link>

                    <span>/</span>

                    <button
                        type="button"
                        style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            cursor: "pointer",
                            color: "#0b7f81",
                            fontSize: 13,
                        }}
                        onClick={onQuayLai}
                    >
                        Hàng chờ
                    </button>

                    <span>/</span>

                    <span>Chỉnh sửa sinh hiệu</span>
                </div>

                {/* HEADER */}

                <div className="cap-nhat-sinh-hieu__header">

                    <div>

                        <h1>
                            Chỉnh sửa sinh hiệu
                        </h1>

                        <p>
                            Cập nhật lại thông tin sinh hiệu của bệnh nhân.
                        </p>

                    </div>

                </div>

                {/* THÔNG TIN BỆNH NHÂN */}

                <Card title="Thông tin bệnh nhân">

                    <div className="cap-nhat-sinh-hieu__patient">

                        <div>
                            <span>Họ và tên</span>
                            <strong>
                                {benhNhan.hoTen}
                            </strong>
                        </div>

                        <div>
                            <span>Mã bệnh nhân</span>
                            <strong>
                                {benhNhan.idBenhNhan}
                            </strong>
                        </div>

                        <div>
                            <span>Ngày sinh</span>
                            <strong>
                                {dinhDangNgay(
                                    benhNhan.ngaySinh
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>Giới tính</span>
                            <strong>
                                {hienThiGioiTinh(
                                    benhNhan.gioiTinh
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>Mã lượt khám</span>
                            <strong>
                                {benhNhan.idLuotKham}
                            </strong>
                        </div>

                        <div>
                            <span>Giờ khám</span>
                            <strong>
                                {dinhDangGio(
                                    benhNhan.gioKham
                                )}
                            </strong>
                        </div>

                    </div>

                </Card>

                {/* FORM */}

                <Card title="Thông tin sinh hiệu">

                    {dangTai ? (

                        <div className="cap-nhat-sinh-hieu__loading">
                            Đang tải sinh hiệu...
                        </div>

                    ) : (

                        <>
                            {loi && (
                                <div className="cap-nhat-sinh-hieu__error">
                                    {loi}
                                </div>
                            )}

                            {thanhCong && (
                                <div className="cap-nhat-sinh-hieu__success">
                                    {thanhCong}
                                </div>
                            )}

                            <div className="cap-nhat-sinh-hieu__form">

                                <Input
                                    id="huyet-ap-tam-thu"
                                    label="Huyết áp tâm thu (mmHg)"
                                    type="number"
                                    value={huyetApTamThu}
                                    onChange={(event) =>
                                        setHuyetApTamThu(
                                            event.target.value
                                        )
                                    }
                                />

                                <Input
                                    id="huyet-ap-tam-truong"
                                    label="Huyết áp tâm trương (mmHg)"
                                    type="number"
                                    value={huyetApTamTruong}
                                    onChange={(event) =>
                                        setHuyetApTamTruong(
                                            event.target.value
                                        )
                                    }
                                />

                                <Input
                                    id="can-nang"
                                    label="Cân nặng (kg)"
                                    type="number"
                                    step="0.1"
                                    value={canNang}
                                    onChange={(event) =>
                                        setCanNang(
                                            event.target.value
                                        )
                                    }
                                />

                                <Input
                                    id="nhiet-do"
                                    label="Nhiệt độ (°C)"
                                    type="number"
                                    step="0.1"
                                    value={nhietDo}
                                    onChange={(event) =>
                                        setNhietDo(
                                            event.target.value
                                        )
                                    }
                                />

                            </div>

                            {sinhHieu && (
                                <div className="cap-nhat-sinh-hieu__time">
                                    Thời điểm đo gần nhất:{" "}
                                    {new Date(
                                        sinhHieu.thoiDiemDo
                                    ).toLocaleString("vi-VN")}
                                </div>
                            )}

                            <div className="cap-nhat-sinh-hieu__actions">

                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={xuLyHuy}
                                    disabled={dangLuu}
                                >
                                    Hủy
                                </Button>

                                <Button
                                    type="button"
                                    onClick={xuLyLuu}
                                    loading={dangLuu}
                                    loadingText="Đang lưu..."
                                >
                                    Lưu thay đổi
                                </Button>

                            </div>
                        </>
                    )}

                </Card>

                <div className="cap-nhat-sinh-hieu__back">

                    <Button
                        type="button"
                        variant="secondary"
                        onClick={xuLyHuy}
                    >
                        ← Quay lại
                    </Button>

                </div>

            </div>

        </MainLayout>
    );
}
