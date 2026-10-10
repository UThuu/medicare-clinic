package com.medicare.clinic.dto.request;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Request for UC24 - book an appointment online.
 * Do not accept idBenhNhan from the browser; resolve the patient from the authenticated account.
 */
@Data
public class LichKhamDatTrucTuyenRequest {

    private String maBacSi;
    private LocalDate ngayKham;
    private LocalTime gioKham;
}
