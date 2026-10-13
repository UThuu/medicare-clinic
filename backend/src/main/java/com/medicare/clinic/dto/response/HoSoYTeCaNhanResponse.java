package com.medicare.clinic.dto.response;

import com.medicare.clinic.entity.enums.GioiTinh;
import com.medicare.clinic.entity.enums.TrangThaiLuotKham;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HoSoYTeCaNhanResponse {
    private ThongTinBenhNhanDTO benhNhan;
    private List<DiUngDTO> diUng;
    private List<SinhHieuDTO> sinhHieu;
    private List<LichSuKhamDTO> lichSuKham;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ThongTinBenhNhanDTO {
        private String idBenhNhan;
        private String hoTen;
        private LocalDate ngaySinh;
        private GioiTinh gioiTinh;
        private String soDienThoai;
        private String diaChi;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DiUngDTO {
        private String thanhPhan;
        private String ghiChu;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SinhHieuDTO {
        private String idLuotKham;
        private Integer huyetApTamThu;
        private Integer huyetApTamTruong;
        private BigDecimal canNang;
        private BigDecimal nhietDo;
        private LocalDateTime thoiDiemDo;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LichSuKhamDTO {
        private String idLuotKham;
        private String idLichKham;
        private LocalDate ngayKham;
        private LocalTime gioKham;
        private String tenBacSi;
        private String chuyenKhoa;
        private String lyDoKham;
        private String trieuChung;
        private String chanDoan;
        private String ketQuaKham;
        private TrangThaiLuotKham trangThai;
        private SinhHieuDTO sinhHieu;
        private DonThuocDTO donThuoc;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DonThuocDTO {
        private String idDonThuoc;
        private LocalDate ngayKe;
        private String ghiChu;
        private List<ChiTietThuocDTO> chiTiet;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChiTietThuocDTO {
        private String idThuoc;
        private String tenThuoc;
        private String donViTinh;
        private Integer soLuong;
        private String lieuLuong;
        private String huongDanSuDung;
        private BigDecimal donGia;
        private BigDecimal thanhTien;
    }
}
