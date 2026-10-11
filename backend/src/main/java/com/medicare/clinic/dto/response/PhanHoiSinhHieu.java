package com.medicare.clinic.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PhanHoiSinhHieu {

    private String idSinhHieu;
    private String idLuotKham;
    private String maDieuDuong;

    private Integer huyetApTamThu;
    private Integer huyetApTamTruong;

    private BigDecimal canNang;
    private BigDecimal nhietDo;

    private LocalDateTime thoiDiemDo;

    public PhanHoiSinhHieu(
            String idSinhHieu,
            String idLuotKham,
            String maDieuDuong,
            Integer huyetApTamThu,
            Integer huyetApTamTruong,
            BigDecimal canNang,
            BigDecimal nhietDo,
            LocalDateTime thoiDiemDo
    ) {
        this.idSinhHieu = idSinhHieu;
        this.idLuotKham = idLuotKham;
        this.maDieuDuong = maDieuDuong;
        this.huyetApTamThu = huyetApTamThu;
        this.huyetApTamTruong = huyetApTamTruong;
        this.canNang = canNang;
        this.nhietDo = nhietDo;
        this.thoiDiemDo = thoiDiemDo;
    }

    public String getIdSinhHieu() {
        return idSinhHieu;
    }

    public String getIdLuotKham() {
        return idLuotKham;
    }

    public String getMaDieuDuong() {
        return maDieuDuong;
    }

    public Integer getHuyetApTamThu() {
        return huyetApTamThu;
    }

    public Integer getHuyetApTamTruong() {
        return huyetApTamTruong;
    }

    public BigDecimal getCanNang() {
        return canNang;
    }

    public BigDecimal getNhietDo() {
        return nhietDo;
    }

    public LocalDateTime getThoiDiemDo() {
        return thoiDiemDo;
    }
}