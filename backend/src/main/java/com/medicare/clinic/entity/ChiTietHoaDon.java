package com.medicare.clinic.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;

@Entity
@Table(name = "chi_tiet_hoa_don")
@Data
public class ChiTietHoaDon {

    @Id
    @Column(name = "id")
    private String id;

    @ManyToOne
    @JoinColumn(name = "id_hoa_don", nullable = false)
    private HoaDon hoaDon;

    @Column(name = "loai_chi_phi", nullable = false)
    private String loaiChiPhi;

    @Column(name = "mo_ta", nullable = false)
    private String moTa;

    @Column(name = "so_luong", nullable = false)
    private Integer soLuong;

    @Column(name = "don_gia", nullable = false)
    private BigDecimal donGia;

    @Column(name = "thanh_tien", nullable = false)
    private BigDecimal thanhTien;

    public void tinhThanhTien() {
        if (this.soLuong != null && this.donGia != null) {
            this.thanhTien = this.donGia.multiply(BigDecimal.valueOf(this.soLuong));
        } else {
            this.thanhTien = BigDecimal.ZERO;
        }
    }
}
