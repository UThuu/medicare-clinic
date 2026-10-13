package com.medicare.clinic.entity;
import jakarta.persistence.*;
import lombok.Data;
@Entity
@Table(name = "bac_si")
@Data
public class BacSi {
    @Id
    @Column(name = "ma_nv")
    private String maNv;
    
    @Column(name = "chuyen_khoa", nullable = false)
    private String chuyenKhoa;
    @Column(name = "bang_cap", nullable = false)
    private String bangCap;
    
    @OneToOne
    @MapsId
    @JoinColumn(name = "ma_nv")
    private NhanVien nhanVien;
}
