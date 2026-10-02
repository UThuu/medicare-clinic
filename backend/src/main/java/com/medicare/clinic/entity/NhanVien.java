package com.medicare.clinic.entity;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
@Entity
@Table(name = "nhan_vien")
@Data
public class NhanVien {
    @Id
    @Column(name = "ma_nv")
    private String maNv;
    @Column(name = "ho_ten", nullable = false)
    private String hoTen;
    @Column(name = "sdt", nullable = false)
    private String sdt;
    @Column(name = "dia_chi")
    private String diaChi;
    @Column(name = "luong")
    private BigDecimal luong;
}
