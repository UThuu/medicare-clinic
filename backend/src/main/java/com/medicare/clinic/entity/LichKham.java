package com.medicare.clinic.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "lich_kham")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LichKham {
    @Id
    @Column(name = "id_lich_kham", length = 36)
    private String idLichKham;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_benh_nhan", nullable = false)
    private BenhNhan benhNhan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ma_bac_si", nullable = false)
    private BacSi bacSi;

    @Column(name = "ngay_kham", nullable = false)
    private LocalDate ngayKham;

    @Column(name = "gio_kham", nullable = false)
    private LocalTime gioKham;

    @Column(name = "trang_thai", length = 30, nullable = false)
    private String trangThai; // DA_DAT, DA_TIEP_NHAN, DANG_KHAM, HOAN_TAT, HUY

    @Column(name = "phuong_thuc_dat_lich", length = 30, nullable = false)
    private String phuongThucDatLich; // TRUC_TUYEN, TRUC_TIEP
}
