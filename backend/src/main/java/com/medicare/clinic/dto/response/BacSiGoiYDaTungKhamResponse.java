package com.medicare.clinic.dto.response;

import lombok.Data;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/** Response for UC24 - doctors previously visited by the authenticated patient. */
@Data
public class BacSiGoiYDaTungKhamResponse {

    private String thongBao;
    private List<BacSiGoiYItem> danhSachBacSi = new ArrayList<>();

    @Data
    public static class BacSiGoiYItem {
        private String maBacSi;
        private String hoTenBacSi;
        private String chuyenKhoa;
        private String bangCap;
        private Integer soLanKhamTruoc;
        private LocalDate ngayKhamGanNhat;
    }
}
