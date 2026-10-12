package com.medicare.clinic.dto.response;

import com.medicare.clinic.entity.enums.GioiTinh;
import com.medicare.clinic.entity.enums.PhuongThucDatLich;
import com.medicare.clinic.entity.enums.TrangThaiLichKham;
import com.medicare.clinic.entity.enums.TrangThaiLuotKham;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorScheduleResponse {

    // Thông tin lịch hẹn
    private String idLichKham;
    private LocalDate ngayKham;
    private LocalTime gioKham;
    private TrangThaiLichKham trangThaiLichKham;
    private PhuongThucDatLich phuongThucDatLich;

    // Thông tin bệnh nhân
    private String idBenhNhan;
    private String tenBenhNhan;
    private GioiTinh gioiTinh;
    private LocalDate ngaySinh;
    private String soDienThoai;

    // Thông tin lượt khám (có thể null nếu chưa đến)
    private String idLuotKham;
    private TrangThaiLuotKham trangThaiLuotKham;

    // Bổ sung các trường cần thiết cho UC06
    private String lyDoKham;

    private Integer huyetApTamThu;
    private Integer huyetApTamTruong;
    private BigDecimal nhietDo;
    private BigDecimal canNang;
    private LocalDateTime thoiDiemDoSinhHieu;
}
