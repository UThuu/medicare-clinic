package com.medicare.clinic.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "chi_tiet_don_thuoc")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChiTietDonThuoc {
    @Id
    @Column(name = "id", length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_don_thuoc", nullable = false)
    private DonThuoc donThuoc;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_thuoc", nullable = false)
    private Thuoc thuoc;

    @Column(name = "so_luong", nullable = false)
    private Integer soLuong;

    @Column(name = "lieu_luong", length = 100, nullable = false)
    private String lieuLuong;

    @Column(name = "huong_dan_su_dung", length = 255)
    private String huongDanSuDung;

    @Column(name = "don_gia", precision = 12, scale = 2, nullable = false)
    private BigDecimal donGia;

    @Column(name = "ly_do_bo_qua_canh_bao", length = 255)
    private String lyDoBoQuaCanhBao;
}
