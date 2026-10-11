package com.medicare.clinic.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "lich_su_sinh_hieu")
@Data
public class LichSuSinhHieu {

    @Id
    @Column(name = "id")
    private String id;

    @ManyToOne
    @JoinColumn(name = "id_sinh_hieu", nullable = false)
    private SinhHieu sinhHieu;

    @ManyToOne
    @JoinColumn(name = "ma_dieu_duong", nullable = false)
    private DieuDuong dieuDuong;

    @Column(name = "thoi_gian_sua", nullable = false)
    private LocalDateTime thoiGianSua;

    @Column(name = "huyet_ap_tam_thu_cu")
    private Integer huyetApTamThuCu;

    @Column(name = "huyet_ap_tam_truong_cu")
    private Integer huyetApTamTruongCu;

    @Column(name = "can_nang_cu")
    private BigDecimal canNangCu;

    @Column(name = "nhiet_do_cu")
    private BigDecimal nhietDoCu;

    @Column(name = "huyet_ap_tam_thu_moi")
    private Integer huyetApTamThuMoi;

    @Column(name = "huyet_ap_tam_truong_moi")
    private Integer huyetApTamTruongMoi;

    @Column(name = "can_nang_moi")
    private BigDecimal canNangMoi;

    @Column(name = "nhiet_do_moi")
    private BigDecimal nhietDoMoi;
}
