package com.medicare.clinic.dto.request;

import com.medicare.clinic.entity.enums.GioiTinh;
import lombok.Data;

import java.time.LocalDate;

/** Request for UC29 - create a new patient profile. */
@Data
public class BenhNhanTaoMoiRequest {

    private String hoTen;
    private LocalDate ngaySinh;
    private GioiTinh gioiTinh;
    private String soDienThoai;
    private String diaChi;
}
