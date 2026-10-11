package com.medicare.clinic.dto.response;

import com.medicare.clinic.entity.enums.TrangThaiLichKham;
import com.medicare.clinic.entity.enums.TrangThaiLuotKham;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@AllArgsConstructor
public class PhanHoiTiepNhanBenhNhan {

    private boolean thanhCong;

    private String thongBao;

    private String idLuotKham;

    private String idLichKham;

    private String idBenhNhan;

    private String hoTen;

    private LocalDate ngayKham;

    private LocalTime gioKham;

    private String maBacSi;

    private TrangThaiLichKham trangThaiLichKham;

    private TrangThaiLuotKham trangThaiLuotKham;
}