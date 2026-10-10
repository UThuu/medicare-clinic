package com.medicare.clinic.service.interfaces;

import com.medicare.clinic.dto.request.HoaDonTraCuuRequest;
import com.medicare.clinic.dto.request.HoaDonTongDoanhThuRequest;
import com.medicare.clinic.dto.response.HoaDonTraCuuResponse;
import com.medicare.clinic.dto.response.HoaDonTongDoanhThuResponse;

public interface IHoaDonService {
    // TODO: implement service methods

    HoaDonTraCuuResponse traCuuHoaDon(
            HoaDonTraCuuRequest request
    );

    HoaDonTongDoanhThuResponse xemTongDoanhThu(
            HoaDonTongDoanhThuRequest request
    );
}
