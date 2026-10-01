package com.medicare.clinic.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class BenhNhan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // TODO: cần xác nhận field cụ thể theo tài liệu thiết kế (ERD)
}
