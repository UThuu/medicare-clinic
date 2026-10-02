package com.medicare.clinic.entity;
import com.medicare.clinic.entity.enums.TrangThaiHoaDon;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
@Entity
@Table(name = "hoa_don")
@Data
public class HoaDon {
    @Id
    @Column(name = "id")
    private String id;
    
    @OneToOne
    @JoinColumn(name = "id_luot_kham", nullable = false, unique = true)
    private LuotKham luotKham;
    
    @ManyToOne
    @JoinColumn(name = "id_thu_ngan", nullable = false)
    private ThuNgan thuNgan;
    
    @Column(name = "ngay_tao", nullable = false)
    private LocalDateTime ngayTao;
    
    @Column(name = "tong_tien", nullable = false)
    private BigDecimal tongTien;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", nullable = false)
    private TrangThaiHoaDon trangThai;
    
    @OneToMany(mappedBy = "hoaDon", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ChiTietHoaDon> chiTietHoaDons;

    public void tinhTongChiPhi() {
        if (chiTietHoaDons != null) {
            this.tongTien = chiTietHoaDons.stream()
                .map(ChiTietHoaDon::getThanhTien)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        } else {
            this.tongTien = BigDecimal.ZERO;
        }
    }
}
