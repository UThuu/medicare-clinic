package com.medicare.clinic.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "don_thuoc")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DonThuoc {
    @Id
    @Column(name = "id_don_thuoc", length = 36)
    private String idDonThuoc;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_luot_kham", nullable = false)
    private LuotKham luotKham;

    @Column(name = "ngay_ke", nullable = false)
    private LocalDate ngayKe;

    @Column(name = "ghi_chu", columnDefinition = "TEXT")
    private String ghiChu;

    @OneToMany(mappedBy = "donThuoc", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<ChiTietDonThuoc> chiTietDonThuocs = new ArrayList<>();
}
