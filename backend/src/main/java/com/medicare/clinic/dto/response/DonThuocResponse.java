package com.medicare.clinic.dto.response;

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
    private LocalDate ngayKe;
    private String ghiChu;

    // Thông tin bệnh nhân
    private String idBenhNhan;
    private String hoTenBenhNhan;
    private String ngaySinhBenhNhan;
    private Integer tuoiBenhNhan;
    private String gioiTinhBenhNhan;
    private String soDienThoaiBenhNhan;
    private String diaChiBenhNhan;

    // Bác sĩ kê đơn
    private String maBacSi;
    private String tenBacSi;

    // Thông tin lâm sàng lượt khám
    private String lyDoKham;
    private String trieuChung;
    private String chanDoan;
    private String ketQuaKham;
    private String trangThaiLuotKham;

    // Tiền sử dị ứng của bệnh nhân
    private List<DiUngItemResponse> diUngs;

    // Chi tiết các loại thuốc trong đơn
    private List<ChiTietDonThuocItemResponse> chiTietDonThuoc;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DiUngItemResponse {
        private String thanhPhan;
        private String ghiChu;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChiTietDonThuocItemResponse {
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
        private boolean coCanhBaoDiUng;
        private String canhBaoChiTiet;
    }
}
