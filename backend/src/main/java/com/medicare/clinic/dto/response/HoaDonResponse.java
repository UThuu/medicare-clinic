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
public class HoaDonResponse {
    private String idHoaDon;
    private String idLuotKham;
    private String maBenhNhan;
    private String tenBenhNhan;
    private String soDienThoai;
    private String diaChi;
    private String bacSiKham;
    private String thuNganLap;
    private LocalDateTime ngayTao;
    private BigDecimal phiKham;
    private BigDecimal tienThuoc;
    private BigDecimal tongTien;
    private String trangThai; // CHUA_THANH_TOAN, DA_THANH_TOAN
    private List<ChiTietKhoanThuDTO> danhSachChiTiet;
}
