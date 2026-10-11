package com.medicare.clinic.service.interfaces;

import com.medicare.clinic.dto.response.PhanHoiBenhNhanCho;
import com.medicare.clinic.dto.response.PhanHoiXacNhanBenhNhan;
import com.medicare.clinic.dto.request.XacNhanBenhNhanRequest;
import com.medicare.clinic.dto.request.TiepNhanBenhNhanRequest;
import com.medicare.clinic.dto.response.PhanHoiTimBenhNhan;
import com.medicare.clinic.dto.response.PhanHoiLichKhamTiepNhan;
import com.medicare.clinic.dto.response.PhanHoiTiepNhanBenhNhan;

import java.time.LocalDate;
import java.util.List;
import java.time.LocalDate;
import java.util.List;

public interface ILuotKhamService {

    List<PhanHoiBenhNhanCho> xemDanhSachBenhNhanCho(LocalDate ngayKham);
    PhanHoiXacNhanBenhNhan xacNhanBenhNhan(
            String idLuotKham,
            XacNhanBenhNhanRequest request
    );

    List<PhanHoiTimBenhNhan> timKiemBenhNhan(
            String soDienThoai,
            String hoTen,
            LocalDate ngaySinh
    );

    List<PhanHoiLichKhamTiepNhan> xemLichKhamTrongNgay(
            String idBenhNhan,
            LocalDate ngayKham
    );

    PhanHoiTiepNhanBenhNhan tiepNhanBenhNhan(
            TiepNhanBenhNhanRequest request
    );
}