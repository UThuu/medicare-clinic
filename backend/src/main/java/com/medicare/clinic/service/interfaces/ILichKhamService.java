package com.medicare.clinic.service.interfaces;
import com.medicare.clinic.dto.request.LichKhamDatTaiQuayRequest;
import com.medicare.clinic.dto.response.*;
import java.time.LocalDate;
import java.util.List;
public interface ILichKhamService {
    List<BacSiDatLichResponse> danhSachBacSi();
    LichKhamKhungGioResponse khungGioTrong(String maBacSi, LocalDate ngayKham);
    LichKhamDatTaiQuayResponse datLichKhamTaiQuay(LichKhamDatTaiQuayRequest request);
}
