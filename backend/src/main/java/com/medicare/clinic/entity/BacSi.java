package com.medicare.clinic.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "bac_si")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class BacSi extends NhanVien {
    @Column(name = "chuyen_khoa", length = 100, nullable = false)
    private String chuyenKhoa;

    @Column(name = "bang_cap", length = 100)
    private String bangCap;
}
