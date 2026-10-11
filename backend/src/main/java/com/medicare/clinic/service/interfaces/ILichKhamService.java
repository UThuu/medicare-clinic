package com.medicare.clinic.service.interfaces;

import com.medicare.clinic.dto.request.BacSiGoiYDaTungKhamRequest;
import com.medicare.clinic.dto.request.LichKhamDatTaiQuayRequest;
import com.medicare.clinic.dto.request.LichKhamDatTrucTuyenRequest;
import com.medicare.clinic.dto.request.LichKhamGoiYKhungGioThayTheRequest;
import com.medicare.clinic.dto.request.LichKhamKiemTraTrongRequest;
import com.medicare.clinic.dto.response.BacSiGoiYDaTungKhamResponse;
import com.medicare.clinic.dto.response.LichKhamDatTaiQuayResponse;
import com.medicare.clinic.dto.response.LichKhamDatTrucTuyenResponse;
import com.medicare.clinic.dto.response.LichKhamGoiYKhungGioThayTheResponse;
import com.medicare.clinic.dto.response.LichKhamKiemTraTrongResponse;

public interface ILichKhamService {
    java.util.List<com.medicare.clinic.dto.response.BacSiDatLichResponse> danhSachBacSi();
    BacSiGoiYDaTungKhamResponse danhSachBacSi(String idBenhNhan);
    com.medicare.clinic.dto.response.LichKhamKhungGioResponse khungGioTrong(String doctor, java.time.LocalDate date);

    LichKhamKiemTraTrongResponse kiemTraLichTrong(LichKhamKiemTraTrongRequest request);

    BacSiGoiYDaTungKhamResponse goiYBacSiDaTungKham(
            String idBenhNhan,
            BacSiGoiYDaTungKhamRequest request
    );

    LichKhamGoiYKhungGioThayTheResponse goiYKhungGioThayThe(
            LichKhamGoiYKhungGioThayTheRequest request
    );

    LichKhamDatTrucTuyenResponse datLichKhamTrucTuyen(
            String idBenhNhan,
            LichKhamDatTrucTuyenRequest request
    );

    LichKhamDatTaiQuayResponse datLichKhamTaiQuay(LichKhamDatTaiQuayRequest request);
}
