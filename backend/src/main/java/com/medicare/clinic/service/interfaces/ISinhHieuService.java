package com.medicare.clinic.service.interfaces;

import com.medicare.clinic.dto.request.CapNhatSinhHieuRequest;
import com.medicare.clinic.dto.request.GhiNhanSinhHieuRequest;
import com.medicare.clinic.dto.response.PhanHoiSinhHieu;

public interface ISinhHieuService {

    PhanHoiSinhHieu ghiNhanSinhHieu(
            String idLuotKham,
            String maDieuDuong,
            GhiNhanSinhHieuRequest request
    );

    PhanHoiSinhHieu xemSinhHieuMoiNhat(
            String idLuotKham
    );

    PhanHoiSinhHieu capNhatSinhHieu(
            String idLuotKham,
            CapNhatSinhHieuRequest request
    );
}