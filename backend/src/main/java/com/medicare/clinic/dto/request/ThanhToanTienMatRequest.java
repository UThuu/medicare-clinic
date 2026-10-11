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
public class ThanhToanTienMatRequest {
    private String idHoaDon;
    private BigDecimal tienKhachDua;
    private String ghiChu;
}
