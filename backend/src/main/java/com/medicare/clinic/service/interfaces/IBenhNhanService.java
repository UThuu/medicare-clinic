package com.medicare.clinic.service.interfaces;

import com.medicare.clinic.dto.request.BenhNhanTimKiemRequest;
import com.medicare.clinic.dto.request.BenhNhanTaoMoiRequest;
import com.medicare.clinic.dto.request.BenhNhanThongBaoLichKhamRequest;
import com.medicare.clinic.dto.response.BenhNhanTimKiemResponse;
import com.medicare.clinic.dto.response.BenhNhanTaoMoiResponse;
import com.medicare.clinic.dto.response.BenhNhanThongBaoLichKhamResponse;

public interface IBenhNhanService {
    // TODO: implement service methods

    BenhNhanTimKiemResponse timKiemHoSoBenhNhan(
            BenhNhanTimKiemRequest request
    );

    BenhNhanTaoMoiResponse taoHoSoBenhNhanMoi(
            BenhNhanTaoMoiRequest request
    );

    BenhNhanThongBaoLichKhamResponse thongBaoLichKham(
            BenhNhanThongBaoLichKhamRequest request
    );
}
