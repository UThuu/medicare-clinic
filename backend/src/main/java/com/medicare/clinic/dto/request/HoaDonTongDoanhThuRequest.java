package com.medicare.clinic.dto.request;

import lombok.Data;

import java.time.LocalDate;

/** Request for UC23 - revenue in an inclusive date range. */
@Data
public class HoaDonTongDoanhThuRequest {

    private LocalDate tuNgay;
    private LocalDate denNgay;
}
