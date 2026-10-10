package com.medicare.clinic.service.interfaces;

import com.medicare.clinic.dto.request.BenhNhanTimKiemRequest;
import com.medicare.clinic.dto.response.BenhNhanTimKiemResponse;

public interface IBenhNhanService {

    BenhNhanTimKiemResponse timKiemHoSoBenhNhan(BenhNhanTimKiemRequest request);
}
