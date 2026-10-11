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
public class KetQuaThanhToanResponse {
    private String idThanhToan;
    private String idGiaoDich;
    private String maGiaoDich;
    private String idHoaDon;
    private String phuongThuc;
    private BigDecimal soTien;
    private String trangThai; // THANH_CONG, THAT_BAI
    private LocalDateTime thoiGian;
    private String thongBao;
}
