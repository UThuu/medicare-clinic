package com.medicare.clinic.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ThongTinQrResponse {
    private String idHoaDon;
    private BigDecimal soTien;
    private String nganHang;        // Tên ngân hàng: Vietcombank
    private String maNganHang;      // Mã BIN hoặc viết tắt: VCB
    private String soTaiKhoan;      // 1038034475
    private String tenChuTaiKhoan;  // NGUYEN MAI NHUT TAN
    private String noiDung;         // MEDICARE HD-...
    private String qrImageUrl;      // Đường link ảnh VietQR sinh sẵn
    private String qrQuickLink;     // Link mở nhanh app ngân hàng
}
