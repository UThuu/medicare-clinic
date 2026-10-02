package com.medicare.clinic.entity;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import lombok.Data;
@Embeddable
@Data
public class BenhNhanDiUngId implements Serializable {
    private String idBenhNhan;
    private String thanhPhan;
}
