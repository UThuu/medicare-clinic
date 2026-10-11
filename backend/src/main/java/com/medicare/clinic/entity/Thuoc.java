package com.medicare.clinic.entity;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
@Entity
@Table(name = "thuoc")
@Data
public class Thuoc {
    @Id
    @Column(name = "id_thuoc")
    private String idThuoc;
    
    @Column(name = "ten_thuoc", nullable = false)
    private String tenThuoc;
    
    @Column(name = "don_vi_tinh", nullable = false)
    private String donViTinh;
    
    @Column(name = "don_gia", nullable = false)
    private BigDecimal donGia;
    
    @OneToMany(mappedBy = "thuoc")
    private List<ThuocThanhPhan> thanhPhans;
}
