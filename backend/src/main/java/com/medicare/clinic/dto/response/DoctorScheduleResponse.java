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
    
    // ThA'ng tin l<ch h1n
    private String idLichKham;
    private LocalDate ngayKham;
    private LocalTime gioKham;
    private TrangThaiLichKham trangThaiLichKham;
    private PhuongThucDatLich phuongThucDatLich;

    // ThA'ng tin bnh nhAn
    private String idBenhNhan;
    private String tenBenhNhan;
    private GioiTinh gioiTinh;
    private LocalDate ngaySinh;
    private String soDienThoai;

    // ThA'ng tin lt khAm (cA3 th null nu cha `n)
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
