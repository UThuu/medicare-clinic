package com.medicare.clinic.dto.response;

import com.medicare.clinic.entity.enums.TrangThaiHoaDon;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/** Response for UC22 - invoice search results and invoice details. */
@Data
public class HoaDonTraCuuResponse {

    private String thongBao;
    private int tongSoKetQua;
    private List<HoaDonItem> danhSachHoaDon = new ArrayList<>();

    @Data
    public static class HoaDonItem {
        private String idHoaDon;
        private String idLuotKham;
        private String idBenhNhan;
        private String hoTenBenhNhan;
        private String soDienThoaiBenhNhan;
        private String maBacSi;
        private String tenBacSi;
        private String hoTenThuNgan;
        private LocalDateTime ngayTao;
        private BigDecimal tongTien;
        private TrangThaiHoaDon trangThai;
        private List<ChiTietHoaDonItem> chiTietHoaDon = new ArrayList<>();
    }

    @Data
    public static class ChiTietHoaDonItem {
        private String loaiChiPhi;
        private String moTa;
        private Integer soLuong;
        private BigDecimal donGia;
        private BigDecimal thanhTien;
    }
}
