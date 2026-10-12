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
public class ChiTietKhoanThuResponse {
    private String loaiKhoanThu; // TIEN_KHAM, TIEN_THUOC
    private String tenKhoanThu;
    private String donViTinh;
    private Integer soLuong;
    private BigDecimal donGia;
    private BigDecimal thanhTien;
    private String huongDan;
}
