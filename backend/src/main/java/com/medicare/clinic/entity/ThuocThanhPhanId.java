package com.medicare.clinic.entity;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import lombok.Data;
@Embeddable
@Data
public class ThuocThanhPhanId implements Serializable {
    private String idThuoc;
    private String thanhPhan;
}
