package com.medicare.clinic.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "thu_ngan")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ThuNgan extends NhanVien {
    @Column(name = "ca_lam_viec", length = 50)
    private String caLamViec;

    @Column(name = "quay_lam_viec", length = 50)
    private String quayLamViec;
}
