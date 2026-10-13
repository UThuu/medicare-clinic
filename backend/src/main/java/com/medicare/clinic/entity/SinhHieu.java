package com.medicare.clinic.entity;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
@Entity
@Table(name = "sinh_hieu")
@Data
public class SinhHieu {
    @Id
    @Column(name = "id_sinh_hieu")
    private String idSinhHieu;
    
    @OneToOne
    @JoinColumn(name = "id_luot_kham", nullable = false, unique = true)
    private LuotKham luotKham;
    
    @ManyToOne
    @JoinColumn(name = "ma_dieu_duong", nullable = false)
    private DieuDuong dieuDuong;
    
    @Column(name = "huyet_ap_tam_truong")
    private Integer huyetApTamTruong;
    
    @Column(name = "huyet_ap_tam_thu")
    private Integer huyetApTamThu;
    
    @Column(name = "can_nang")
    private BigDecimal canNang;
    
    @Column(name = "nhiet_do")
    private BigDecimal nhietDo;
    
    @Column(name = "thoi_diem_do", nullable = false)
    private LocalDateTime thoiDiemDo;
    
    @OneToMany(mappedBy = "sinhHieu")
    private List<LichSuSinhHieu> lichSuSinhHieus;
}
