package com.medicare.clinic.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "thuoc")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Thuoc {
    @Id
    @Column(name = "id_thuoc", length = 36)
    private String idThuoc;

    @Column(name = "ten_thuoc", length = 150, nullable = false)
    private String tenThuoc;

    @Column(name = "don_vi_tinh", length = 50, nullable = false)
    private String donViTinh;

    @Column(name = "don_gia", precision = 12, scale = 2, nullable = false)
    private BigDecimal donGia;
}
