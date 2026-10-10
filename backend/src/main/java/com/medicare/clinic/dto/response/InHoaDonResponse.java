package com.medicare.clinic.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InHoaDonResponse {
    // Thông tin cơ sở phòng khám
    private String tenPhongKham;
    private String diaChiPhongKham;
    private String hotline;
    private String email;
    private String website;

    // Thông tin hóa đơn
    private String idHoaDon;
    private String idLuotKham;
    private LocalDateTime ngayLap;
    private LocalDateTime ngayThanhToan;
    private String trangThai; // DA_THANH_TOAN

    // Thông tin bệnh nhân
    private String maBenhNhan;
    private String tenBenhNhan;
    private LocalDate ngaySinh;
    private Integer tuoi;
    private String gioiTinh;
    private String soDienThoai;
    private String diaChi;

    // Thông tin khám bệnh
    private String bacSiKham;
    private String chuyenKhoa;
    private String lyDoKham;
    private String chanDoan;

    // Bảng kê chi tiết chi phí
    private List<ChiTietKhoanThuDTO> danhSachKhoanThu;
    private BigDecimal phiKham;
    private BigDecimal tienThuoc;
    private BigDecimal tongTien;
    private String tongTienBangChu;

    // Chi tiết thanh toán
    private String phuongThucThanhToan;
    private String tenPhuongThuc;
    private String maGiaoDich;
    private String thuNganThu;
    private String ghiChu;
}
