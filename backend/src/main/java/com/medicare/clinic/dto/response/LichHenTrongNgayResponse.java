package com.medicare.clinic.dto.response;

import com.medicare.clinic.entity.enums.TrangThaiLichKham;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LichHenTrongNgayResponse {
    private String idLichKham;
    private String idBenhNhan;
    private String tenBenhNhan;
    private String soDienThoaiBenhNhan;
    private String maBacSi;
    private String tenBacSi;
    private String chuyenKhoa;
    private LocalDate ngayKham;
    private LocalTime gioKham;
    private TrangThaiLichKham trangThai;
    private boolean daTiepNhan;
    private String idLuotKham;
}
