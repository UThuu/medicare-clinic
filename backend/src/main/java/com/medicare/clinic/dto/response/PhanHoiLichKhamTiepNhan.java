package com.medicare.clinic.dto.response;

import com.medicare.clinic.entity.enums.TrangThaiLichKham;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@AllArgsConstructor
public class PhanHoiLichKhamTiepNhan {

    private String idLichKham;

    private String idBenhNhan;

    private String hoTen;

    private String maBacSi;

    private LocalDate ngayKham;

    private LocalTime gioKham;

    private TrangThaiLichKham trangThai;

    private boolean daCoLuotKham;
}