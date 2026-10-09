package com.medicare.clinic.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "luot_kham")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LuotKham {
    @Id
    @Column(name = "id_luot_kham", length = 36)
    private String idLuotKham;

    @OneToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "id_lich_kham", nullable = false, unique = true)
    private LichKham lichKham;

    @Column(name = "trang_thai", length = 30, nullable = false)
    private String trangThai; // DANG_CHO, DANG_KHAM, CHO_THANH_TOAN, HOAN_TAT

    @Column(name = "ly_do_kham", length = 255)
    private String lyDoKham;

    @Column(name = "trieu_chung", columnDefinition = "TEXT")
    private String trieuChung;

    @Column(name = "ket_qua_kham", columnDefinition = "TEXT")
    private String ketQuaKham;

    @Column(name = "chan_doan", columnDefinition = "TEXT")
    private String chanDoan;

    @OneToOne(mappedBy = "luotKham", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private DonThuoc donThuoc;
}
