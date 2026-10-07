package com.medicare.clinic.service.interfaces;

import com.medicare.clinic.dto.response.PhanHoiBenhNhanCho;
import com.medicare.clinic.dto.response.PhanHoiXacNhanBenhNhan;
import com.medicare.clinic.dto.request.XacNhanBenhNhanRequest;
import java.time.LocalDate;
import java.util.List;

public interface ILuotKhamService {

    List<PhanHoiBenhNhanCho> xemDanhSachBenhNhanCho(LocalDate ngayKham);
    PhanHoiXacNhanBenhNhan xacNhanBenhNhan(
            String idLuotKham,
            XacNhanBenhNhanRequest request
    );
}