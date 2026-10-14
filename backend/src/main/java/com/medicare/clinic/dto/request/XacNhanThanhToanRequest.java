package com.medicare.clinic.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class XacNhanThanhToanRequest {
    private String idHoaDon;
    private String phuongThuc; // TIEN_MAT, VNPAY_QR, CHUYEN_KHOAN, TRUC_TUYEN
    private BigDecimal soTien;
    private String maGiaoDichNgoai;
    private String ghiChu;
}
