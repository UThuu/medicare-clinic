import {
    useEffect,
    useMemo,
    useState,
    type FormEvent,
    type MouseEvent,
} from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

import {
    Button,
    Card,
    Input,
    StatusBadge,
} from "../components";

import { MainLayout } from "../components/layout/MainLayout";
import { AllergyManageModal } from "../components/common/AllergyManageModal";
import { medicalRecordService } from "../services/medicalRecordService";
import type { AllergyInfo } from "../types/MedicalRecord";

import type { BenhNhanCho } from "../types/LuotKham";

import {
    ghiNhanSinhHieu,
    laySinhHieu,
} from "../services/sinhHieuService";

import type { SinhHieuResponse } from "../types/SinhHieu";

import "./ghiNhanSinhHieu.css";

import CapNhatSinhHieu from "./CapNhatSinhHieu";

interface GhiNhanSinhHieuProps {
    benhNhan: BenhNhanCho;
    onQuayLai?: () => void;
    onLuuThanhCong?: () => void;
}

function dinhDangNgay(ngay: string) {
    if (!ngay) return "—";

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
    const { user } = useAuth();

    // =========================
    // UC05 - CHỈNH SỬA SINH HIỆU
    // =========================

    const [
        dangChinhSua,
        setDangChinhSua,
    ] = useState(false);

    // =========================
    // DỮ LIỆU FORM
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

    const [daCoSinhHieu, setDaCoSinhHieu] = useState(false);
    const [dangKiemTraSinhHieu, setDangKiemTraSinhHieu] = useState(true);

    // Kiểm tra sinh hiệu đã tồn tại cho đúng lượt khám hay chưa.
    useEffect(() => {
        let daHuy = false;

        async function kiemTraSinhHieu() {
            setDangKiemTraSinhHieu(true);
            setLoi("");

            try {
                const duLieu: SinhHieuResponse | null =
                    await laySinhHieu(benhNhan.idLuotKham);

                if (daHuy) return;

                if (duLieu) {
                    setDaCoSinhHieu(true);
                    setHuyetApTamThu(String(duLieu.huyetApTamThu));
                    setHuyetApTamTruong(String(duLieu.huyetApTamTruong));
                    setCanNang(String(duLieu.canNang));
                    setNhietDo(String(duLieu.nhietDo));
                } else {
                    setDaCoSinhHieu(false);
                    setHuyetApTamThu("");
                    setHuyetApTamTruong("");
                    setCanNang("");
                    setNhietDo("");
                }
            } catch (error) {
                if (!daHuy) {
                    setLoi(
                        error instanceof Error
                            ? error.message
                            : "Không thể kiểm tra sinh hiệu."
                    );
                }
            } finally {
                if (!daHuy) setDangKiemTraSinhHieu(false);
            }
        }

        void kiemTraSinhHieu();

        return () => {
            daHuy = true;
        };
    }, [benhNhan.idLuotKham]);

    // =========================
    // DỊ ỨNG BỆNH NHÂN (UC-03)
    // =========================
    const [danhSachDiUng, setDanhSachDiUng] = useState<AllergyInfo[]>([]);
    const [isAllergyModalOpen, setIsAllergyModalOpen] = useState(false);
    const [editingAllergy, setEditingAllergy] = useState<AllergyInfo | null>(null);
    const [allergyLoading, setAllergyLoading] = useState(false);

    useEffect(() => {
        if (!benhNhan?.idBenhNhan) return;
        medicalRecordService.getAllergies(benhNhan.idBenhNhan)
            .then((data) => setDanhSachDiUng(data || []))
            .catch((err) => console.error("Không thể tải danh sách dị ứng:", err));
    }, [benhNhan?.idBenhNhan]);

    const handleSaveAllergy = async (thanhPhan: string, ghiChu: string) => {
        setAllergyLoading(true);
        try {
            const updated = await medicalRecordService.addAllergy(benhNhan.idBenhNhan, { thanhPhan, ghiChu });
            setDanhSachDiUng(updated);
            setIsAllergyModalOpen(false);
            setEditingAllergy(null);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Lỗi khi lưu dị ứng";
            alert(msg);
        } finally {
            setAllergyLoading(false);
        }
    };

    const handleDeleteAllergy = async (thanhPhan: string) => {
        if (!window.confirm(`Xác nhận xóa dị ứng: "${thanhPhan}"?`)) return;
        setAllergyLoading(true);
        try {
            const updated = await medicalRecordService.deleteAllergy(benhNhan.idBenhNhan, thanhPhan);
            setDanhSachDiUng(updated);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Lỗi khi xóa dị ứng";
            alert(msg);
        } finally {
            setAllergyLoading(false);
        }
    };


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

        event?.preventDefault();

        setHuyetApTamThu("");
        setHuyetApTamTruong("");
        setCanNang("");
        setNhietDo("");

        setLoi("");
        setThanhCong("");
    }

    // =========================
    // LƯU SINH HIỆU - UC03
    // =========================

    async function xuLyLuu(
        event: FormEvent<HTMLFormElement>
    ) {

        event.preventDefault();

        setLoi("");
        setThanhCong("");

        if (dangKiemTraSinhHieu) {
            setLoi("Vui lòng chờ kiểm tra sinh hiệu.");
            return;
        }

        if (daCoSinhHieu) {
            setLoi("Lượt khám này đã có sinh hiệu. Vui lòng sử dụng UC05 để chỉnh sửa.");
            return;
        }

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
                    huyetApTamThu: Number(huyetApTamThu),
                    huyetApTamTruong: Number(huyetApTamTruong),
                    canNang: Number(canNang),
                    nhietDo: Number(nhietDo),
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

    // =========================
    // UC05
    // =========================

    if (dangChinhSua) {

        return (
            <CapNhatSinhHieu
                benhNhan={benhNhan}

                onQuayLai={() => {
                    setDangChinhSua(false);
                }}

                onCapNhatThanhCong={() => {
                    setDangChinhSua(false);
                }}
            />
        );
    }

    // =========================
    // GIAO DIỆN UC03
    // =========================

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

            <div className="ghi-nhan-sinh-hieu ghi-nhan-sinh-hieu--compact">

                {/* =========================
                    BREADCRUMB
                   ========================= */}

                <div className="ghi-nhan-sinh-hieu__breadcrumb">
                    <Link to="/staff">
                        Tổng quan
                    </Link>

                    <span>/</span>

                    <button
                        type="button"
                        className="breadcrumb-button-link"
                        onClick={onQuayLai}
                    >
                        Hàng chờ
                    </button>

                    <span>/</span>

                    <span>Ghi nhận sinh hiệu</span>
                </div>

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
                    CARD TIỀN SỬ DỊ ỨNG (UC-03)
                   ========================= */}

                <Card>
                    <div className="allergy-card-header">
                        <div className="allergy-card-header__left">
                            <h2>⚠️ Tiền sử dị ứng</h2>
                            {danhSachDiUng.length > 0 ? (
                                <StatusBadge tone="error">
                                    Có {danhSachDiUng.length} dị ứng
                                </StatusBadge>
                            ) : (
                                <StatusBadge tone="success">
                                    Chưa ghi nhận dị ứng
                                </StatusBadge>
                            )}
                        </div>

                        <Button
                            type="button"
                            variant="primary"
                            onClick={() => {
                                setEditingAllergy(null);
                                setIsAllergyModalOpen(true);
                            }}
                            className="allergy-add-btn"
                        >
                            + Thêm dị ứng
                        </Button>
                    </div>

                    {danhSachDiUng.length === 0 ? (
                        <div className="allergy-empty-text">
                            Bệnh nhân chưa có tiền sử dị ứng nào được ghi nhận. Nhấn <b>"+ Thêm dị ứng"</b> nếu bệnh nhân khai báo có phản ứng thuốc / thức ăn.
                        </div>
                    ) : (
                        <div className="allergy-list-grid">
                            {danhSachDiUng.map((item, idx) => (
                                <div key={idx} className="allergy-item">
                                    <div className="allergy-item__info">
                                        <strong className="allergy-item__name">{item.thanhPhan}</strong>
                                        {item.ghiChu && (
                                            <span className="allergy-item__note">({item.ghiChu})</span>
                                        )}
                                    </div>
                                    <div className="allergy-item__actions">
                                        <button
                                            type="button"
                                            className="allergy-action-btn allergy-action-btn--edit"
                                            onClick={() => {
                                                setEditingAllergy(item);
                                                setIsAllergyModalOpen(true);
                                            }}
                                        >
                                            Sửa
                                        </button>
                                        <button
                                            type="button"
                                            className="allergy-action-btn allergy-action-btn--delete"
                                            onClick={() => void handleDeleteAllergy(item.thanhPhan)}
                                        >
                                            Xóa
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* =========================
                    FORM SINH HIỆU
                   ========================= */}

                <form onSubmit={xuLyLuu}>

                    <Card>

                        {/* =========================
                            TIÊU ĐỀ SINH HIỆU
                           ========================= */}

                        <div className="sinh-hieu-header">

                            <h2>
                                Sinh hiệu
                            </h2>

                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => {
                                    setDangChinhSua(true);
                                }}
                                disabled={dangLuu || dangKiemTraSinhHieu || !daCoSinhHieu}
                            >
                                Chỉnh sửa sinh hiệu
                            </Button>

                        </div>

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
                                        disabled={dangKiemTraSinhHieu || daCoSinhHieu || dangLuu}
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
                                        disabled={dangKiemTraSinhHieu || daCoSinhHieu || dangLuu}
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
                                        disabled={dangKiemTraSinhHieu || daCoSinhHieu || dangLuu}
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
                                        disabled={dangKiemTraSinhHieu || daCoSinhHieu || dangLuu}
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

                        {dangKiemTraSinhHieu && (
                            <div className="ghi-nhan-sinh-hieu__success">
                                Đang kiểm tra sinh hiệu đã ghi nhận...
                            </div>
                        )}

                        {daCoSinhHieu && (
                            <div className="ghi-nhan-sinh-hieu__success">
                                Bệnh nhân đã được ghi nhận sinh hiệu. Vui lòng chọn
                                “Chỉnh sửa sinh hiệu” để cập nhật dữ liệu.
                            </div>
                        )}

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

            <AllergyManageModal
                open={isAllergyModalOpen}
                onClose={() => {
                    setIsAllergyModalOpen(false);
                    setEditingAllergy(null);
                }}
                onSave={handleSaveAllergy}
                editingItem={editingAllergy}
                loading={allergyLoading}
            />

        </MainLayout>
    );
}
