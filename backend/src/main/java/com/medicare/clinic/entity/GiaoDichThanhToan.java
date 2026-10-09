package com.medicare.clinic.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "giao_dich_thanh_toan")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GiaoDichThanhToan {
    @Id
    @Column(name = "id_giao_dich", length = 36)
    private String idGiaoDich;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_thanh_toan", nullable = false)
    private ThanhToan thanhToan;

    @Column(name = "ma_giao_dich", length = 100)
    private String maGiaoDich;

    @Column(name = "phuong_thuc", length = 30, nullable = false)
    private String phuongThuc; // TIEN_MAT, VNPAY_QR, CHUYEN_KHOAN, TRUC_TUYEN

    @Column(name = "so_tien", precision = 12, scale = 2, nullable = false)
    private BigDecimal soTien;

    @Column(name = "trang_thai", length = 30, nullable = false)
    private String trangThai; // THANH_CONG, THAT_BAI, DANG_CHO

    @Column(name = "thoi_gian", nullable = false)
    private LocalDateTime thoiGian;
}
