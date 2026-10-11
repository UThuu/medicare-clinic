package com.medicare.clinic.dto.response;

import com.medicare.clinic.entity.enums.GioiTinh;
import lombok.Data;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/** Response for UC28 - matching patient profiles. */
@Data
public class BenhNhanTimKiemResponse {

    private String thongBao;
    private int tongSoKetQua;
    private List<BenhNhanItem> danhSachBenhNhan = new ArrayList<>();

    @Data
    public static class BenhNhanItem {
        private String idBenhNhan;
        private String hoTen;
        private LocalDate ngaySinh;
        private GioiTinh gioiTinh;
        private String soDienThoai;
        private String diaChi;
    }
}
