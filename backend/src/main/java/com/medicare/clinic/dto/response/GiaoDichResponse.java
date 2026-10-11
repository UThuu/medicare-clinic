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
public class GiaoDichResponse {
    private String idGiaoDich;
    private String maGiaoDich;
    private String phuongThuc;
    private BigDecimal soTien;
    private String trangThai;
    private LocalDateTime thoiGian;
}
