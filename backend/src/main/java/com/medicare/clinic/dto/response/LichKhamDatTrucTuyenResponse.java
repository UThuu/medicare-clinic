package com.medicare.clinic.dto.response;

import com.medicare.clinic.entity.enums.PhuongThucDatLich;
import com.medicare.clinic.entity.enums.TrangThaiLichKham;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

/** Response for UC24 - online appointment booking result. */
@Data
public class LichKhamDatTrucTuyenResponse {

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
