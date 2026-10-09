package com.medicare.clinic.dto.record;

import com.medicare.clinic.entity.enums.GioiTinh;
import com.medicare.clinic.entity.enums.TrangThaiLichKham;
import com.medicare.clinic.entity.enums.TrangThaiLuotKham;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
public class MedicalRecordResponse {
    private PatientInfo benhNhan;
    private CurrentScheduleInfo lichKhamHienTai;
    private CurrentVisitInfo luotKhamHienTai;
    private VitalsInfo sinhHieuHienTai;
    private LatestVitalsInfo sinhHieuMoiNhat;
    private List<AllergyInfo> diUng;
    private List<VisitHistoryInfo> lichSuKham;

    @Data
    @Builder
    public static class PatientInfo {
        private String idBenhNhan;
        private String hoTen;
        private LocalDate ngaySinh;
        private GioiTinh gioiTinh;
        private String soDienThoai;
        private String diaChi;
    }

    @Data
    @Builder
    public static class CurrentScheduleInfo {
        private String idLichKham;
        private LocalDate ngayKham;
        private LocalTime gioKham;
        private TrangThaiLichKham trangThai;
    }

    @Data
    @Builder
    public static class CurrentVisitInfo {
        private String idLuotKham;
        private TrangThaiLuotKham trangThai;
        private String lyDoKham;
        private String trieuChung;
        private String chanDoan;
        private String ketQuaKham;
    }

    @Data
    @Builder
    public static class VitalsInfo {
        private Integer huyetApTamThu;
        private Integer huyetApTamTruong;
        private BigDecimal canNang;
        private BigDecimal nhietDo;
        private LocalDateTime thoiDiemDo;
    }

    @Data
    @Builder
    public static class LatestVitalsInfo {
        private String idLuotKhamNguon;
        private Integer huyetApTamThu;
        private Integer huyetApTamTruong;
        private BigDecimal canNang;
        private BigDecimal nhietDo;
        private LocalDateTime thoiDiemDo;
    }

    @Data
    @Builder
    public static class AllergyInfo {
        private String thanhPhan;
        private String ghiChu;
    }

    @Data
    @Builder
    public static class VisitHistoryInfo {
        private String idLuotKham;
        private LocalDate ngayKham;
        private String tenBacSi;
        private String lyDoKham;
        private TrangThaiLuotKham trangThai;
        private String chanDoan;
        private String ketQuaKham;
        // Don thuoc details excluded for now, as requested
        private boolean coDonThuoc; 
        private String idDonThuoc;
    }
}
