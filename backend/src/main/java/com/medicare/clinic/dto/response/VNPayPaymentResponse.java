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
public class VNPayPaymentResponse {
    private String idHoaDon;
    private BigDecimal tongTien;
    private String paymentUrl;
    private String maGiaoDich;
    private LocalDateTime thoiGianTao;
    private String thongBao;
}
