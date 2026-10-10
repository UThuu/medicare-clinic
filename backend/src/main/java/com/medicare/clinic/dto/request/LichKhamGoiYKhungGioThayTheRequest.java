package com.medicare.clinic.dto.request;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

/** Request for UC24 - find alternative appointment slots. */
@Data
public class LichKhamGoiYKhungGioThayTheRequest {
    private String maBacSi;
    private LocalDate ngayKham;
    private LocalTime gioKhamMongMuon;
    /** Optional result limit; null means the service default. */
    private Integer soLuongGoiY;
}
