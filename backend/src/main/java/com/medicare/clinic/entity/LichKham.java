package com.medicare.clinic.entity;
import com.medicare.clinic.entity.enums.TrangThaiLichKham;
import com.medicare.clinic.entity.enums.PhuongThucDatLich;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;
@Entity
@Table(name = "lich_kham")
@Data
public class LichKham {
    @Id
    @Column(name = "id_lich_kham")
    private String idLichKham;
    
    @ManyToOne
    @JoinColumn(name = "id_benh_nhan", nullable = false)
    private BenhNhan benhNhan;
    
    @ManyToOne
    @JoinColumn(name = "ma_bac_si", nullable = false)
    private BacSi bacSi;
    
    @Column(name = "ngay_kham", nullable = false)
    private LocalDate ngayKham;
    
    @Column(name = "gio_kham", nullable = false)
    private LocalTime gioKham;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", nullable = false)
    private TrangThaiLichKham trangThai;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "phuong_thuc_dat_lich", nullable = false)
    private PhuongThucDatLich phuongThucDatLich;
    
    @OneToOne(mappedBy = "lichKham")
    private LuotKham luotKham;
}
