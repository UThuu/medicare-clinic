package com.medicare.clinic.controller;

import com.medicare.clinic.dto.request.GhiNhanSinhHieuRequest;
import com.medicare.clinic.dto.response.PhanHoiSinhHieu;
import com.medicare.clinic.service.interfaces.ISinhHieuService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sinh-hieu")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class SinhHieuController {

    private final ISinhHieuService sinhHieuService;

    @PostMapping("/luot-kham/{idLuotKham}")
    public ResponseEntity<PhanHoiSinhHieu> ghiNhanSinhHieu(
            @PathVariable String idLuotKham,
            @Valid @RequestBody GhiNhanSinhHieuRequest request
    ) {

        PhanHoiSinhHieu ketQua =
                sinhHieuService.ghiNhanSinhHieu(
                        idLuotKham,
                        request
                );

        return ResponseEntity.ok(ketQua);
    }

    @GetMapping("/luot-kham/{idLuotKham}")
    public ResponseEntity<PhanHoiSinhHieu> xemSinhHieu(
            @PathVariable String idLuotKham
    ) {

        PhanHoiSinhHieu ketQua =
                sinhHieuService.xemSinhHieuMoiNhat(
                        idLuotKham
                );

        if (ketQua == null) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(ketQua);
    }
}