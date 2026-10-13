package com.medicare.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DonThuocResponse {
    private String idDonThuoc;
    private String idLuotKham;
    private String idBenhNhan;
    private String hoTenBenhNhan;
    private String tenBacSi;
    private LocalDate ngayKe;
    private String ghiChu;
    private List<ChiTietDonThuocResponse> chiTietDonThuoc;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChiTietDonThuocResponse {
        private String id;
        private String idThuoc;
        private String tenThuoc;
        private String donViTinh;
        private Integer soLuong;
        private String lieuLuong;
        private String huongDanSuDung;
        private BigDecimal donGia;
        private BigDecimal thanhTien;
        private String lyDoBoQuaCanhBao;
    }
}