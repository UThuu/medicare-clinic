package com.medicare.clinic.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChiPhiKhamPreviewResponse {
    private String idLuotKham;
    private String maBenhNhan;
    private String tenBenhNhan;
    private String soDienThoai;
    private LocalDate ngaySinh;
    private String gioiTinh;
    private String bacSiKham;
    private String chuyenKhoa;
    private String lyDoKham;
    private String chanDoan;
    private LocalDate ngayKham;

    private BigDecimal phiKham;
    private BigDecimal tienThuoc;
    private BigDecimal tongTien; // UC-16

    private List<ChiTietKhoanThuDTO> danhSachKhoanThu;
    private boolean daCoHoaDon;
    private String idHoaDonHienTai;
}
