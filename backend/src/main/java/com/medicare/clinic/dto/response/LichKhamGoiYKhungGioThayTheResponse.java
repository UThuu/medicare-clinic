package com.medicare.clinic.dto.response;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

/** Response for UC24 - alternative appointment slots. */
@Data
public class LichKhamGoiYKhungGioThayTheResponse {
    private String thongBao;
    private List<KhungGioGoiYItem> danhSachKhungGio = new ArrayList<>();

    @Data
    public static class KhungGioGoiYItem {
        private String maBacSi;
        private String hoTenBacSi;
        private String chuyenKhoa;
        private LocalDate ngayKham;
        private LocalTime gioKham;
    }
}
