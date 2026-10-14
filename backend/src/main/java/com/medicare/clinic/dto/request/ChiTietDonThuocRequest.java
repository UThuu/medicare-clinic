package com.medicare.clinic.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import jakarta.validation.constraints.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChiTietDonThuocRequest {
    @NotBlank(message = "Mã thuốc không được để trống.")
    @Size(max = 36, message = "Mã thuốc tối đa 36 ký tự.")
    private String idThuoc;
    @NotNull(message = "Số lượng thuốc là bắt buộc.")
    @Positive(message = "Số lượng thuốc phải lớn hơn 0.")
    private Integer soLuong;
    @NotBlank(message = "Liều lượng không được để trống.")
    @Size(max = 100, message = "Liều lượng tối đa 100 ký tự.")
    private String lieuLuong;
    @Size(max = 255, message = "Hướng dẫn sử dụng tối đa 255 ký tự.")
    private String huongDanSuDung;
    @DecimalMin(value = "0", message = "Đơn giá không được âm.")
    @Digits(integer = 10, fraction = 2, message = "Đơn giá vượt giới hạn cho phép.")
    private BigDecimal donGia;
    @Size(max = 255, message = "Lý do bỏ qua cảnh báo tối đa 255 ký tự.")
    private String lyDoBoQuaCanhBao;
}
