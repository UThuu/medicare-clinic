package com.medicare.clinic.dto.response;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

/** Response indicating whether the requested appointment slot is available. */
@Data
public class LichKhamKiemTraTrongResponse {

    private String maBacSi;
    private LocalDate ngayKham;
    private LocalTime gioKham;
    private boolean conTrong;
    private String thongBao;
}
