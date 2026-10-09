package com.medicare.clinic.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "hoa_don")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HoaDon {
    @Id
    @Column(name = "id", length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_luot_kham", nullable = false)
    private LuotKham luotKham;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_thu_ngan", nullable = false)
    private ThuNgan thuNgan;

    @Column(name = "ngay_tao", nullable = false)
    private LocalDateTime ngayTao;

    @Column(name = "phi_kham", precision = 12, scale = 2, nullable = false)
    private BigDecimal phiKham;

    @Column(name = "tien_thuoc", precision = 12, scale = 2, nullable = false)
    private BigDecimal tienThuoc;

    @Column(name = "tong_tien", precision = 12, scale = 2, nullable = false)
    private BigDecimal tongTien;

    @Column(name = "trang_thai", length = 30, nullable = false)
    private String trangThai; // CHUA_THANH_TOAN, DA_THANH_TOAN, HUY
}
