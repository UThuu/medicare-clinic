package com.medicare.clinic.dto.response;

import com.medicare.clinic.entity.enums.PhuongThucDatLich;
import com.medicare.clinic.entity.enums.TrangThaiLichKham;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

/** Response DTO cho kết quả đặt lịch khám (áp dụng cho cả đặt trực tuyến và đặt tại quầy). */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DatLichKhamResponse {

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
