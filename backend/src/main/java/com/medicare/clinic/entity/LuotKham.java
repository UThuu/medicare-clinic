package com.medicare.clinic.entity;
import com.medicare.clinic.entity.enums.TrangThaiLuotKham;
import jakarta.persistence.*;
import lombok.Data;
@Entity
@Table(name = "luot_kham")
@Data
public class LuotKham {
    @Id
    @Column(name = "id_luot_kham")
    private String idLuotKham;
    
    @OneToOne
    @JoinColumn(name = "id_lich_kham", nullable = false, unique = true)
    private LichKham lichKham;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", nullable = false)
    private TrangThaiLuotKham trangThai;
    
    @Column(name = "ly_do_kham")
    private String lyDoKham;
    
    @Column(name = "trieu_chung")
    private String trieuChung;
    
    @Column(name = "ket_qua_kham")
    private String ketQuaKham;
    
    @Column(name = "chan_doan")
    private String chanDoan;

    @OneToOne(mappedBy = "luotKham", fetch = FetchType.LAZY)
    private SinhHieu sinhHieu;
}
