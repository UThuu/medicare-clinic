package com.medicare.clinic.entity;
import jakarta.persistence.*;
import lombok.Data;
import java.util.List;
@Entity
@Table(name = "dieu_duong")
@Data
public class DieuDuong {
    @Id
    @Column(name = "ma_nv")
    private String maNv;
    
    @Column(name = "khoa_lam_viec", nullable = false)
    private String khoaLamViec;
    
    @Column(name = "chung_chi")
    private String chungChi;
    
    @OneToOne
    @MapsId
    @JoinColumn(name = "ma_nv")
    private NhanVien nhanVien;
    
    @OneToMany(mappedBy = "dieuDuong")
    private List<LichSuSinhHieu> lichSuSinhHieus;
}
