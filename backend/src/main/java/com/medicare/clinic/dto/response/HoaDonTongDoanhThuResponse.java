package com.medicare.clinic.dto.response;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Response for UC23 - total revenue from paid invoices in the requested date range. */
@Data
public class HoaDonTongDoanhThuResponse {

    private LocalDate tuNgay;
    private LocalDate denNgay;
    private BigDecimal tongDoanhThu = BigDecimal.ZERO;
    private long soHoaDonDaThanhToan;
    private String thongBao;
}
