package com.medicare.clinic.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class GhiNhanSinhHieuRequest {

    @NotBlank(message = "Mã điều dưỡng không được để trống")
    private String maDieuDuong;

    @NotNull(message = "Huyết áp tâm thu không được để trống")
    private Integer huyetApTamThu;

    @NotNull(message = "Huyết áp tâm trương không được để trống")
    private Integer huyetApTamTruong;

    @NotNull(message = "Cân nặng không được để trống")
    @DecimalMin(
            value = "0.1",
            message = "Cân nặng phải lớn hơn 0"
    )
    private BigDecimal canNang;

    @NotNull(message = "Nhiệt độ không được để trống")
    @DecimalMin(
            value = "0.1",
            message = "Nhiệt độ phải lớn hơn 0"
    )
    private BigDecimal nhietDo;

    public String getMaDieuDuong() {
        return maDieuDuong;
    }

    public void setMaDieuDuong(String maDieuDuong) {
        this.maDieuDuong = maDieuDuong;
    }

    public Integer getHuyetApTamThu() {
        return huyetApTamThu;
    }

    public void setHuyetApTamThu(Integer huyetApTamThu) {
        this.huyetApTamThu = huyetApTamThu;
    }

    public Integer getHuyetApTamTruong() {
        return huyetApTamTruong;
    }

    public void setHuyetApTamTruong(Integer huyetApTamTruong) {
        this.huyetApTamTruong = huyetApTamTruong;
    }

    public BigDecimal getCanNang() {
        return canNang;
    }

    public void setCanNang(BigDecimal canNang) {
        this.canNang = canNang;
    }

    public BigDecimal getNhietDo() {
        return nhietDo;
    }

    public void setNhietDo(BigDecimal nhietDo) {
        this.nhietDo = nhietDo;
    }
}