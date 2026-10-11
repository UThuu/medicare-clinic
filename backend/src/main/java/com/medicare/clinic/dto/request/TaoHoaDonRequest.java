package com.medicare.clinic.dto.request;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
@Data
public class TaoHoaDonRequest {
    @NotBlank @Size(max = 36)
    private String idLuotKham;
    @DecimalMin("0.00") @Digits(integer = 10, fraction = 2)
    private BigDecimal phiKhamTuyChinh;
}
