package com.medicare.clinic.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ThongTinThanhToanResponse {
    private String idHoaDon;
    private String idThanhToan;
    private String idLuotKham;
    private String maBenhNhan;
    private String tenBenhNhan;
    private String soDienThoai;
    private String diaChi;
    private String bacSiKham;
    private String chuyenKhoa;
    private String chanDoan;
    private LocalDateTime ngayLapHoaDon;
    private BigDecimal phiKham;
    private BigDecimal tienThuoc;
    private BigDecimal tongTien;
    private String trangThaiHoaDon; // CHUA_THANH_TOAN, DA_THANH_TOAN, HUY
    private String trangThaiThanhToan; // CHUA_THANH_TOAN, DANG_XU_LY, THANH_CONG, THAT_BAI
    private List<ChiTietKhoanThuDTO> danhSachChiTiet;
    private List<GiaoDichResponse> lichSuGiaoDich;
}
