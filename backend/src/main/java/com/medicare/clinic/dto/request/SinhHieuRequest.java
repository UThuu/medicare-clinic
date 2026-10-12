package com.medicare.clinic.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/** Request DTO cho ghi nhận và cập nhật chỉ số sinh hiệu bệnh nhân. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SinhHieuRequest {

    @NotNull(message = "Huyết áp tâm thu không được để trống")
    @DecimalMin(value = "1", message = "Huyết áp tâm thu phải lớn hơn 0")
    private Integer huyetApTamThu;

    @NotNull(message = "Huyết áp tâm trương không được để trống")
    @DecimalMin(value = "1", message = "Huyết áp tâm trương phải lớn hơn 0")
    private Integer huyetApTamTruong;

    @NotNull(message = "Cân nặng không được để trống")
    @DecimalMin(value = "0.1", message = "Cân nặng phải lớn hơn 0")
    private BigDecimal canNang;

    @NotNull(message = "Nhiệt độ không được để trống")
    @DecimalMin(value = "0.1", message = "Nhiệt độ phải lớn hơn 0")
    private BigDecimal nhietDo;
}
