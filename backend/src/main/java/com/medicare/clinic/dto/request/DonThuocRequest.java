package com.medicare.clinic.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DonThuocRequest {
    @Size(max = 36, message = "Mã lượt khám tối đa 36 ký tự.")
    private String idLuotKham;
    private String ghiChu;
    @Valid
    @NotEmpty(message = "Đơn thuốc phải có ít nhất một loại thuốc.")
    private List<@NotNull(message = "Chi tiết thuốc không được null.") ChiTietDonThuocRequest> chiTietDonThuoc;
}
