package com.medicare.clinic.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ThuocResponse {
    private String idThuoc;
    private String tenThuoc;
    private String donViTinh;
    private BigDecimal donGia;
    private List<String> thanhPhans;
}
