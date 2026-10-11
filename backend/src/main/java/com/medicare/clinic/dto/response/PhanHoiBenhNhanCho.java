package com.medicare.clinic.dto.response;

import com.medicare.clinic.entity.enums.GioiTinh;
import com.medicare.clinic.entity.enums.TrangThaiLuotKham;

import java.time.LocalDate;
import java.time.LocalTime;

public class PhanHoiBenhNhanCho {

    private String idLuotKham;
    private String idLichKham;
    private String idBenhNhan;

    private String hoTen;
    private LocalDate ngaySinh;
    private GioiTinh gioiTinh;
    private String soDienThoai;

    private LocalDate ngayKham;
    private LocalTime gioKham;

    private String lyDoKham;
    private String trieuChung;

    private TrangThaiLuotKham trangThai;

    public PhanHoiBenhNhanCho(
            String idLuotKham,
            String idLichKham,
            String idBenhNhan,
            String hoTen,
            LocalDate ngaySinh,
            GioiTinh gioiTinh,
            String soDienThoai,
            LocalDate ngayKham,
            LocalTime gioKham,
            String lyDoKham,
            String trieuChung,
            TrangThaiLuotKham trangThai
    ) {
        this.idLuotKham = idLuotKham;
        this.idLichKham = idLichKham;
        this.idBenhNhan = idBenhNhan;
        this.hoTen = hoTen;
        this.ngaySinh = ngaySinh;
        this.gioiTinh = gioiTinh;
        this.soDienThoai = soDienThoai;
        this.ngayKham = ngayKham;
        this.gioKham = gioKham;
        this.lyDoKham = lyDoKham;
        this.trieuChung = trieuChung;
        this.trangThai = trangThai;
    }

    public String getIdLuotKham() {
        return idLuotKham;
    }

    public String getIdLichKham() {
        return idLichKham;
    }

    public String getIdBenhNhan() {
        return idBenhNhan;
    }

    public String getHoTen() {
        return hoTen;
    }

    public LocalDate getNgaySinh() {
        return ngaySinh;
    }

    public GioiTinh getGioiTinh() {
        return gioiTinh;
    }

    public String getSoDienThoai() {
        return soDienThoai;
    }

    public LocalDate getNgayKham() {
        return ngayKham;
    }

    public LocalTime getGioKham() {
        return gioKham;
    }

    public String getLyDoKham() {
        return lyDoKham;
    }

    public String getTrieuChung() {
        return trieuChung;
    }

    public TrangThaiLuotKham getTrangThai() {
        return trangThai;
    }
}