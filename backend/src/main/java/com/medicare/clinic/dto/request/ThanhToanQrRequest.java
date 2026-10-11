package com.medicare.clinic.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ThanhToanQrRequest {
    private String idHoaDon;
    private String maGiaoDichNgoai; // Mã tham chiếu từ ngân hàng nếu có
    private String ghiChu;
}
