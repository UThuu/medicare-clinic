package com.medicare.clinic.entity;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
@Entity
@Table(name = "chi_tiet_don_thuoc")
@Data
public class ChiTietDonThuoc {
    @Id
    @Column(name = "id")
    private String id;
    
    @ManyToOne
    @JoinColumn(name = "id_don_thuoc", nullable = false)
    private DonThuoc donThuoc;
    
    @ManyToOne
    @JoinColumn(name = "id_thuoc", nullable = false)
    private Thuoc thuoc;
    
    @Column(name = "so_luong", nullable = false)
    private Integer soLuong;
    
    @Column(name = "lieu_luong", nullable = false)
    private String lieuLuong;
    
    @Column(name = "huong_dan_su_dung")
    private String huongDanSuDung;
    
    @Column(name = "don_gia", nullable = false)
    private BigDecimal donGia;
    
    @Column(name = "ly_do_bo_qua_canh_bao")
    private String lyDoBoQuaCanhBao;

    public BigDecimal tinhThanhTien() {
        if (soLuong != null && donGia != null) {
            return donGia.multiply(BigDecimal.valueOf(soLuong));
        }
        return BigDecimal.ZERO;
    }

    public void capNhatSoLuong(Integer soLuongMoi) {
        if (soLuongMoi == null || soLuongMoi <= 0) {
            throw new IllegalArgumentException("Số lượng phải lớn hơn 0");
        }
        this.soLuong = soLuongMoi;
    }

    public void capNhatLieuLuong(String lieuLuongMoi) {
        if (lieuLuongMoi == null || lieuLuongMoi.trim().isEmpty()) {
            throw new IllegalArgumentException("Liều lượng không được để trống");
        }
        this.lieuLuong = lieuLuongMoi;
    }
}
