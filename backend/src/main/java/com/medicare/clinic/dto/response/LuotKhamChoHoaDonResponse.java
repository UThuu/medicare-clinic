package com.medicare.clinic.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LuotKhamChoHoaDonResponse {
    private String idLuotKham;
    private String idLichKham;
    private String maBenhNhan;
    private String tenBenhNhan;
    private String soDienThoai;
    private String bacSiKham;
    private String chuyenKhoa;
    private LocalDate ngayKham;
    private LocalTime gioKham;
    private String lyDoKham;
    private String chanDoan;
    private String trangThaiLuotKham;
    private boolean daCoDonThuoc;
}
