package com.medicare.clinic.service.interfaces;

import com.medicare.clinic.dto.request.TiepNhanBenhNhanRequest;
import com.medicare.clinic.dto.response.BenhNhanChoResponse;
import com.medicare.clinic.dto.response.LichKhamTiepNhanResponse;
import com.medicare.clinic.dto.response.TiepNhanBenhNhanResponse;
import com.medicare.clinic.dto.response.TimBenhNhanResponse;
import com.medicare.clinic.dto.response.XacNhanBenhNhanResponse;

import java.time.LocalDate;
import java.util.List;

public interface ILuotKhamService {

    List<BenhNhanChoResponse> xemDanhSachBenhNhanCho(
            LocalDate ngayKham
    );

    XacNhanBenhNhanResponse xacNhanBenhNhan(
            String idLuotKham,
            TiepNhanBenhNhanRequest request
    );

    List<TimBenhNhanResponse> timKiemBenhNhan(
            String soDienThoai,
            String hoTen,
            LocalDate ngaySinh
    );

    List<LichKhamTiepNhanResponse> xemLichKhamTrongNgay(
            String idBenhNhan,
            LocalDate ngayKham
    );

    TiepNhanBenhNhanResponse tiepNhanBenhNhan(
            TiepNhanBenhNhanRequest request
    );
}
