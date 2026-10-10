package com.medicare.clinic.dto.khambenh;

import lombok.Data;

@Data
public class SaveKhamBenhRequest {
    private String idLichKham;
    private String trieuChung;
    private String ketQuaKham;
    private String chanDoan;
}
