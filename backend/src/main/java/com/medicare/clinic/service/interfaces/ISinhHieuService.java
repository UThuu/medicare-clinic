package com.medicare.clinic.service.interfaces;

import com.medicare.clinic.dto.request.SinhHieuRequest;
import com.medicare.clinic.dto.response.SinhHieuResponse;

public interface ISinhHieuService {

    SinhHieuResponse ghiNhanSinhHieu(
            String idLuotKham,
            String maDieuDuong,
            SinhHieuRequest request
    );

    SinhHieuResponse xemSinhHieuMoiNhat(
            String idLuotKham
    );

    SinhHieuResponse capNhatSinhHieu(
            String idLuotKham,
            String maDieuDuong,
            SinhHieuRequest request
    );
}
