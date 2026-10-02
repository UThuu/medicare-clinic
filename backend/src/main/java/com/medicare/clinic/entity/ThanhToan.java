package com.medicare.clinic.entity;
import com.medicare.clinic.entity.enums.TrangThaiXuLyThanhToan;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
@Entity
@Table(name = "thanh_toan")
@Data
public class ThanhToan {
    @Id
    @Column(name = "id")
    private String idThanhToan;
    
    @OneToOne
    @JoinColumn(name = "id_hoa_don", nullable = false, unique = true)
    private HoaDon hoaDon;
    
    @Column(name = "so_tien", nullable = false)
    private BigDecimal soTien;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", nullable = false)
    private TrangThaiXuLyThanhToan trangThai;
    
    @Column(name = "ngay_tao", nullable = false)
    private LocalDateTime ngayTao;
    
    @OneToMany(mappedBy = "thanhToan")
    private List<GiaoDichThanhToan> giaoDichThanhToans;
}
