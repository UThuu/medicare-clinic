import { useState } from "react";

import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { StatusBadge } from "../components/common/StatusBadge";

import type { BenhNhanCho } from "../types/LuotKham";

import { xacNhanBenhNhan } from "../services/DichVuXacNhanBenhNhan";

import "./xacNhanBenhNhan.css";

interface XacNhanBenhNhanProps {
    benhNhan: BenhNhanCho;

    onXacNhan: () => void;

    onQuayLai: () => void;
}

export function XacNhanBenhNhan({
                                    benhNhan,
                                    onXacNhan,
                                    onQuayLai,
                                }: XacNhanBenhNhanProps) {

    const [dangXacNhan, setDangXacNhan] = useState(false);
    const [loi, setLoi] = useState("");

    async function xuLyXacNhan() {
        setLoi("");
        setDangXacNhan(true);

        try {
            await xacNhanBenhNhan(
                benhNhan.idLuotKham,
                {
                    idBenhNhan: benhNhan.idBenhNhan,
                    idLichKham: benhNhan.idLichKham,
                }
            );

            onXacNhan();

        } catch (error) {
            setLoi(
                error instanceof Error
                    ? error.message
                    : "Không thể xác nhận bệnh nhân."
            );
        } finally {
            setDangXacNhan(false);
        }
    }

    return (
        <div className="xac-nhan-page">

            <div className="xac-nhan-header">
                <div>

                    <h1>Xác nhận bệnh nhân</h1>

                    <p>
                        Kiểm tra lại thông tin bệnh nhân và lượt khám
                        trước khi ghi nhận dữ liệu y tế.
                    </p>
                </div>
            </div>

            <Card className="xac-nhan-card">

                <div className="xac-nhan-warning">
                    <div className="xac-nhan-warning__icon">
                        !
                    </div>

                    <div>
                        <strong>
                            Vui lòng kiểm tra chính xác thông tin
                        </strong>

                        <p>
                            Hãy đối chiếu thông tin trên màn hình với
                            bệnh nhân trước khi tiếp tục.
                        </p>
                    </div>
                </div>

                <div className="xac-nhan-section">

                    <h2>Thông tin bệnh nhân</h2>

                    <div className="xac-nhan-grid">

                        <div className="xac-nhan-item xac-nhan-item--main">
                            <span>Họ và tên</span>
                            <strong>{benhNhan.hoTen}</strong>
                        </div>

                        <div className="xac-nhan-item">
                            <span>Mã bệnh nhân</span>
                            <strong>{benhNhan.idBenhNhan}</strong>
                        </div>

                        <div className="xac-nhan-item">
                            <span>Ngày sinh</span>
                            <strong>{benhNhan.ngaySinh}</strong>
                        </div>

                        <div className="xac-nhan-item">
                            <span>Giới tính</span>
                            <strong>{benhNhan.gioiTinh}</strong>
                        </div>

                        <div className="xac-nhan-item">
                            <span>Số điện thoại</span>
                            <strong>{benhNhan.soDienThoai}</strong>
                        </div>

                    </div>

                </div>

                <div className="xac-nhan-section">

                    <h2>Thông tin lượt khám</h2>

                    <div className="xac-nhan-grid">

                        <div className="xac-nhan-item">
                            <span>Mã lượt khám</span>
                            <strong>{benhNhan.idLuotKham}</strong>
                        </div>

                        <div className="xac-nhan-item">
                            <span>Mã lịch khám</span>
                            <strong>{benhNhan.idLichKham}</strong>
                        </div>

                        <div className="xac-nhan-item">
                            <span>Ngày khám</span>
                            <strong>{benhNhan.ngayKham}</strong>
                        </div>

                        <div className="xac-nhan-item">
                            <span>Giờ khám</span>
                            <strong>{benhNhan.gioKham}</strong>
                        </div>

                        <div className="xac-nhan-item">
                            <span>Trạng thái</span>

                            <StatusBadge tone="warning">
                                Chờ khám
                            </StatusBadge>
                        </div>

                    </div>

                </div>

                {loi && (
                    <div className="xac-nhan-error">
                        {loi}
                    </div>
                )}

                <div className="xac-nhan-actions">

                    <Button
                        type="button"
                        onClick={onQuayLai}
                    >
                        Quay lại
                    </Button>

                    <Button
                        type="button"
                        onClick={xuLyXacNhan}
                        disabled={dangXacNhan}
                    >
                        {dangXacNhan
                            ? "Đang xác nhận..."
                            : "✓ Xác nhận đúng bệnh nhân"}
                    </Button>

                </div>

            </Card>

        </div>
    );
}