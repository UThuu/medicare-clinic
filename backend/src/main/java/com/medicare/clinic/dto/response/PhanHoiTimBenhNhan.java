package com.medicare.clinic.dto.response;

import com.medicare.clinic.entity.enums.GioiTinh;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;

@Data
@AllArgsConstructor
public class PhanHoiTimBenhNhan {

    private String idBenhNhan;

    private String hoTen;

    private LocalDate ngaySinh;

    private GioiTinh gioiTinh;

    private String soDienThoai;

    private String diaChi;
}