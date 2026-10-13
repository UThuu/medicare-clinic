package com.medicare.clinic.entity;
import com.medicare.clinic.entity.enums.GioiTinh;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;
@Entity
@Table(name = "benh_nhan")
@Data
public class BenhNhan {
    @Id
    @Column(name = "id_benh_nhan")
    private String idBenhNhan;
    
    @Column(name = "ho_ten", nullable = false)
    private String hoTen;
    
    @Column(name = "ngay_sinh", nullable = false)
    private LocalDate ngaySinh;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "gioi_tinh", nullable = false)
    private GioiTinh gioiTinh;
    
    @Column(name = "so_dien_thoai", nullable = false)
    private String soDienThoai;
    
    @Column(name = "dia_chi")
    private String diaChi;
    
    @OneToMany(mappedBy = "benhNhan")
    private List<BenhNhanDiUng> diUngs;
}
