package com.medicare.clinic.dto.response;

import com.medicare.clinic.entity.enums.GioiTinh;
import lombok.Data;

import java.time.LocalDate;

/** Response for UC29 - newly created patient profile. */
@Data
public class BenhNhanTaoMoiResponse {

    private String thongBao;
    private String idBenhNhan;
    private String hoTen;
    private LocalDate ngaySinh;
    private GioiTinh gioiTinh;
    private String soDienThoai;
    private String diaChi;
}
