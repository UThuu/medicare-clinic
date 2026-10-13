package com.medicare.clinic.dto.request;

import lombok.Data;

@Data
public class SaveKhamBenhRequest {
    private String idLichKham;
    private String trieuChung;
    private String ketQuaKham;
    private String chanDoan;
    private Boolean hoanTatKham;
}
