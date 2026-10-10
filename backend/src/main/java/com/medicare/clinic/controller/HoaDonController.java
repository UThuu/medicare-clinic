package com.medicare.clinic.controller;

import com.medicare.clinic.dto.request.HoaDonTongDoanhThuRequest;
import com.medicare.clinic.dto.request.HoaDonTraCuuRequest;
import com.medicare.clinic.dto.response.HoaDonTongDoanhThuResponse;
import com.medicare.clinic.dto.response.HoaDonTraCuuResponse;
import com.medicare.clinic.service.interfaces.IHoaDonService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/hoadon")
@RequiredArgsConstructor
public class HoaDonController {

    private final IHoaDonService hoadonService;

    @PostMapping("/tra-cuu")
    public HoaDonTraCuuResponse traCuuHoaDon(
            @RequestBody HoaDonTraCuuRequest request
    ) {
        return hoadonService.traCuuHoaDon(request);
    }

    @PostMapping("/tong-doanh-thu")
    public HoaDonTongDoanhThuResponse xemTongDoanhThu(
            @Valid @RequestBody HoaDonTongDoanhThuRequest request
    ) {
        return hoadonService.xemTongDoanhThu(request);
    }
}
