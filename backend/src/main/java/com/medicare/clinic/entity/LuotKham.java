package com.medicare.clinic.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class LuotKham {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(optional = false)
    @JoinColumn(name = "id_lich_kham", nullable = false, unique = true)
    private LichKham lichKham;
    
    // TODO: verify remaining fields from ERD
}
