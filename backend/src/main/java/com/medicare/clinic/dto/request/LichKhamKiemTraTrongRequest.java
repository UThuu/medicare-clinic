package com.medicare.clinic.dto.request;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

/** Request to check whether a doctor's appointment slot is available. */
@Data
public class LichKhamKiemTraTrongRequest {

    private String maBacSi;
    private LocalDate ngayKham;
    private LocalTime gioKham;
}
