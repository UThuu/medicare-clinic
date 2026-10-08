package com.medicare.clinic.dto.response;

import com.medicare.clinic.entity.enums.TrangThaiLuotKham;
import com.medicare.clinic.entity.enums.GioiTinh;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@AllArgsConstructor
public class PhanHoiXacNhanBenhNhan {

    private boolean xacNhan;

    private String idLuotKham;

    private String idLichKham;

    private String idBenhNhan;

    private String hoTen;

    private LocalDate ngaySinh;

    private GioiTinh gioiTinh;

    private String soDienThoai;

    private LocalDate ngayKham;

    private LocalTime gioKham;

    private TrangThaiLuotKham trangThai;
}