package com.medicare.clinic.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CanhBaoDiUngResponse {
    private String idThuoc;
    private String tenThuoc;
    private String thanhPhanTrung;
    private String ghiChuDiUng;
    private boolean coCanhBao;
}
