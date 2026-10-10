package com.medicare.clinic.dto.request;

import com.medicare.clinic.entity.enums.TrangThaiHoaDon;
import lombok.Data;

import java.time.LocalDate;

/** Request filters for UC22 - searching invoices. All criteria are optional. */
@Data
public class HoaDonTraCuuRequest {

    private String idHoaDon;
    private String soDienThoaiBenhNhan;
    private LocalDate tuNgay;
    private LocalDate denNgay;
    private TrangThaiHoaDon trangThai;
}
