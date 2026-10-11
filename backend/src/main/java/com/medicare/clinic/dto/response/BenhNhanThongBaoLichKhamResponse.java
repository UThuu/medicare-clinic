package com.medicare.clinic.dto.response;

import com.medicare.clinic.entity.enums.TrangThaiLichKham;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Response for UC25 - notifications dynamically derived from the authenticated patient's appointments.
 * loaiThongBao values: XAC_NHAN_DAT_LICH, NHAC_LICH_1_NGAY, NHAC_LICH_2_GIO.
 * No notification entity or notification-history record is implied by this DTO.
 */
@Data
public class BenhNhanThongBaoLichKhamResponse {

    private LocalDateTime thoiDiemTruyVan;
    private int tongSoThongBao;
    private List<ThongBaoLichKhamItem> danhSachThongBao = new ArrayList<>();

    @Data
    public static class ThongBaoLichKhamItem {
        private String idLichKham;
        private String loaiThongBao;
        private String tieuDe;
        private String noiDung;
        private String maBacSi;
        private String hoTenBacSi;
        private LocalDate ngayKham;
        private LocalTime gioKham;
        private TrangThaiLichKham trangThaiLichKham;

        /** Scheduled trigger time for reminders; null for the booking-confirmation item. */
        private LocalDateTime thoiDiemNhac;
    }
}
