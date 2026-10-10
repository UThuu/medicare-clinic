package com.medicare.clinic.service.interfaces;

import com.medicare.clinic.dto.request.LichKhamKiemTraTrongRequest;
import com.medicare.clinic.dto.request.BacSiGoiYDaTungKhamRequest;
import com.medicare.clinic.dto.request.LichKhamDatTrucTuyenRequest;
import com.medicare.clinic.dto.request.LichKhamDatTaiQuayRequest;

import com.medicare.clinic.dto.response.LichKhamKiemTraTrongResponse;
import com.medicare.clinic.dto.response.BacSiGoiYDaTungKhamResponse;
import com.medicare.clinic.dto.response.LichKhamDatTrucTuyenResponse;
import com.medicare.clinic.dto.response.LichKhamDatTaiQuayResponse;

public interface ILichKhamService {
    // TODO: implement service methods

    LichKhamKiemTraTrongResponse kiemTraLichTrong(
            LichKhamKiemTraTrongRequest request
    );

    BacSiGoiYDaTungKhamResponse goiYBacSiDaTungKham(
            BacSiGoiYDaTungKhamRequest request
    );

    LichKhamDatTrucTuyenResponse datLichKhamTrucTuyen(
            LichKhamDatTrucTuyenRequest request
    );

    LichKhamDatTaiQuayResponse datLichKhamTaiQuay(
            LichKhamDatTaiQuayRequest request
    );
}
