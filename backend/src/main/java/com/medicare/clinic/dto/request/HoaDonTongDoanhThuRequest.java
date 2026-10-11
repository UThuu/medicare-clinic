package com.medicare.clinic.dto.request;

import lombok.Data;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

/** Request for UC23 - revenue in an inclusive date range. */
@Data
public class HoaDonTongDoanhThuRequest {

    @NotNull(message = "Vui lòng chọn ngày thống kê")
    private LocalDate tuNgay;
    @NotNull(message = "Vui lòng chọn ngày thống kê")
    private LocalDate denNgay;
}
