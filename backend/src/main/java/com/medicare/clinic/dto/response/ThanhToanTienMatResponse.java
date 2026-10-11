package com.medicare.clinic.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ThanhToanTienMatResponse {
    private String idThanhToan;
    private String idGiaoDich;
    private String maGiaoDich;
    private String idHoaDon;
    private BigDecimal tongTien;
    private BigDecimal tienKhachDua;
    private BigDecimal tienThoiLai;
    private String phuongThuc;
    private String trangThai; // THANH_CONG
    private LocalDateTime thoiGian;
    private String thongBao;
}
