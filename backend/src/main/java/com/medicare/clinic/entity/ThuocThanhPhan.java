package com.medicare.clinic.entity;
import jakarta.persistence.*;
import lombok.Data;
@Entity
@Table(name = "thuoc_thanh_phan")
@Data
public class ThuocThanhPhan {
    @EmbeddedId
    private ThuocThanhPhanId id;
    
    @ManyToOne
    @MapsId("idThuoc")
    @JoinColumn(name = "id_thuoc")
    private Thuoc thuoc;
}
