package com.medicare.clinic.entity;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;
@Entity
@Table(name = "don_thuoc")
@Data
public class DonThuoc {
    @Id
    @Column(name = "id")
    private String id;
    
    @OneToOne
    @JoinColumn(name = "id_luot_kham", nullable = false, unique = true)
    private LuotKham luotKham;
    
    @Column(name = "ngay_ke", nullable = false)
    private LocalDate ngayKe;
    
    @Column(name = "ghi_chu")
    private String ghiChu;
    
    @OneToMany(mappedBy = "donThuoc")
    private List<ChiTietDonThuoc> chiTietDonThuocs;
}
