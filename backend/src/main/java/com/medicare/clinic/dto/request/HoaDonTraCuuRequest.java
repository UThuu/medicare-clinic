package com.medicare.clinic.dto.request;

import com.medicare.clinic.entity.enums.TrangThaiHoaDon;
import lombok.Data;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;

/** Request filters for UC22 - searching invoices. All criteria are optional. */
@Data
public class HoaDonTraCuuRequest {

    private String idHoaDon;
    private String soDienThoaiBenhNhan;
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate tuNgay;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate denNgay;
    private TrangThaiHoaDon trangThai;
}

