package com.medicare.clinic.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaoHoaDonRequest {
    private String idLuotKham;
    private String maThuNgan;
    private BigDecimal phiKhamTuyChinh;
    private String ghiChu;
}
