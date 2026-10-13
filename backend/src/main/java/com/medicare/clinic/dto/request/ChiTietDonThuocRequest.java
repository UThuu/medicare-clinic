package com.medicare.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChiTietDonThuocRequest {
    private String idThuoc;
    private Integer soLuong;
    private String lieuLuong;
    private String huongDanSuDung;
    private BigDecimal donGia;
    private String lyDoBoQuaCanhBao; // Dùng cho UC13 khi bác sĩ tiếp tục kê
}