package com.medicare.clinic.entity;
import jakarta.persistence.*;
import lombok.Data;
@Entity
@Table(name = "thu_ngan")
@Data
public class ThuNgan {
    @Id
    @Column(name = "ma_nv")
    private String maNv;
    
    @Column(name = "ca_lam_viec", nullable = false)
    private String caLamViec;
    
    @Column(name = "quay_lam_viec")
    private String quayLamViec;
    
    @OneToOne
    @MapsId
    @JoinColumn(name = "ma_nv")
    private NhanVien nhanVien;
}
