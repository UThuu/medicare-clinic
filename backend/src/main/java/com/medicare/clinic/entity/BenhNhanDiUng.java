package com.medicare.clinic.entity;
import jakarta.persistence.*;
import lombok.Data;
@Entity
@Table(name = "benh_nhan_di_ung")
@Data
public class BenhNhanDiUng {
    @EmbeddedId
    private BenhNhanDiUngId id;
    
    @ManyToOne
    @MapsId("idBenhNhan")
    @JoinColumn(name = "id_benh_nhan")
    private BenhNhan benhNhan;
    
    @Column(name = "ghi_chu")
    private String ghiChu;
}
