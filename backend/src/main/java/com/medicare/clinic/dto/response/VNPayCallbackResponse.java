package com.medicare.clinic.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VNPayCallbackResponse {
    private String idHoaDon;
    private String maGiaoDich;
    private String maGiaoDichVNPay;
    private BigDecimal soTien;
    private String nganHang;
    private String thoiGianThanhToan;
    private String trangThai; // THANH_CONG hoặc THAT_BAI
    private String maPhanHoi;
    private String thongBao;
}
