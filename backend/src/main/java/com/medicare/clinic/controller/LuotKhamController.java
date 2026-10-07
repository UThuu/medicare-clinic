package com.medicare.clinic.controller;

import com.medicare.clinic.dto.request.XacNhanBenhNhanRequest;
import com.medicare.clinic.dto.response.PhanHoiBenhNhanCho;
import com.medicare.clinic.dto.response.PhanHoiXacNhanBenhNhan;
import com.medicare.clinic.service.interfaces.ILuotKhamService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/luotkham")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class LuotKhamController {

    private final ILuotKhamService luotKhamService;

    // =========================
    // UC02 - Xem danh sách bệnh nhân chờ
    // =========================

    @GetMapping("/cho-kham")
    public List<PhanHoiBenhNhanCho> xemDanhSachBenhNhanCho(
            @RequestParam(required = false) LocalDate ngayKham
    ) {

        if (ngayKham == null) {
            ngayKham = LocalDate.now();
        }

        return luotKhamService.xemDanhSachBenhNhanCho(
                ngayKham
        );
    }


    // =========================
    // UC04 - Xác nhận bệnh nhân
    // =========================

    @PostMapping("/{idLuotKham}/xac-nhan")
    public PhanHoiXacNhanBenhNhan xacNhanBenhNhan(
            @PathVariable String idLuotKham,
            @RequestBody XacNhanBenhNhanRequest request
    ) {

        return luotKhamService.xacNhanBenhNhan(
                idLuotKham,
                request
        );
    }
}