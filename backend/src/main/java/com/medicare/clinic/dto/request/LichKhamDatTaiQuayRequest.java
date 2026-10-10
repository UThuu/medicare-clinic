package com.medicare.clinic.dto.request;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

/** Request for UC30 - receptionist books an appointment for a selected patient. */
@Data
public class LichKhamDatTaiQuayRequest {

    private String idBenhNhan;
    private String maBacSi;
    private LocalDate ngayKham;
    private LocalTime gioKham;
}
