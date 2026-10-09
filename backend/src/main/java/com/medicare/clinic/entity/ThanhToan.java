package com.medicare.clinic.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "thanh_toan")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ThanhToan {
    @Id
    @Column(name = "id", length = 36)
    private String id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_hoa_don", nullable = false, unique = true)
    private HoaDon hoaDon;

    @Column(name = "so_tien", precision = 12, scale = 2, nullable = false)
    private BigDecimal soTien;

    @Column(name = "trang_thai", length = 30, nullable = false)
    private String trangThai; // DANG_XU_LY, THANH_CONG, THAT_BAI, HUY

    @Column(name = "ngay_tao", nullable = false)
    private LocalDateTime ngayTao;
}
