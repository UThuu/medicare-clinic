package com.medicare.clinic.controller;

import com.medicare.clinic.dto.request.XacNhanBenhNhanRequest;
import com.medicare.clinic.dto.response.PhanHoiBenhNhanCho;
import com.medicare.clinic.dto.response.PhanHoiXacNhanBenhNhan;
import com.medicare.clinic.service.interfaces.ILuotKhamService;
import com.medicare.clinic.dto.request.TiepNhanBenhNhanRequest;
import com.medicare.clinic.dto.response.PhanHoiTimBenhNhan;
import com.medicare.clinic.dto.response.PhanHoiLichKhamTiepNhan;
import com.medicare.clinic.dto.response.PhanHoiTiepNhanBenhNhan;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.format.annotation.DateTimeFormat;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PathVariable;

import java.time.LocalDate;
import java.util.List;

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

    @GetMapping("/tiep-nhan/tim-benh-nhan")
    public List<PhanHoiTimBenhNhan> timKiemBenhNhan(
            @RequestParam(required = false) String soDienThoai,
            @RequestParam(required = false) String hoTen,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate ngaySinh
    ) {

        return luotKhamService.timKiemBenhNhan(
                soDienThoai,
                hoTen,
                ngaySinh
        );
    }

    @GetMapping("/tiep-nhan/benh-nhan/{idBenhNhan}/lich-hom-nay")
    public List<PhanHoiLichKhamTiepNhan> xemLichKhamTrongNgay(
            @PathVariable String idBenhNhan
    ) {

        return luotKhamService.xemLichKhamTrongNgay(
                idBenhNhan,
                LocalDate.now()
        );
    }

    @PostMapping("/tiep-nhan")
    public PhanHoiTiepNhanBenhNhan tiepNhanBenhNhan(
            @RequestBody TiepNhanBenhNhanRequest request
    ) {

        return luotKhamService.tiepNhanBenhNhan(
                request
        );
    }
}