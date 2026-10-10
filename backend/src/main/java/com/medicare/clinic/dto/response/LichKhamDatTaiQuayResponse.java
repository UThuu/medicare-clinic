package com.medicare.clinic.dto.response;

import com.medicare.clinic.entity.enums.PhuongThucDatLich;
import com.medicare.clinic.entity.enums.TrangThaiLichKham;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

/** Response for UC30 - receptionist's appointment booking result. */
@Data
public class LichKhamDatTaiQuayResponse {

    private String thongBao;
    private String idLichKham;
    private String idBenhNhan;
    private String hoTenBenhNhan;
    private String maBacSi;
    private String hoTenBacSi;
    private LocalDate ngayKham;
    private LocalTime gioKham;
    private TrangThaiLichKham trangThai;
    private PhuongThucDatLich phuongThucDatLich;
}
