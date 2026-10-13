package com.medicare.clinic.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DonThuocRequest {
    private String idLuotKham;
    private String ghiChu;
    private List<ChiTietDonThuocRequest> chiTietDonThuoc;
}
