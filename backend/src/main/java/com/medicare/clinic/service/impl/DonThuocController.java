package com.medicare.controller;

import com.medicare.dto.request.DonThuocRequest;
import com.medicare.dto.response.CanhBaoDiUngResponse;
import com.medicare.dto.response.DonThuocResponse;
import com.medicare.service.interfaces.IDonThuocService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/don-thuoc")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DonThuocController {

    private final IDonThuocService donThuocService;

    // UC13: Cảnh báo dị ứng thuốc
    @PostMapping("/kiểm-tra-di-ung")
    public ResponseEntity<List<CanhBaoDiUngResponse>> kiemTraDiUng(
            @RequestParam String idLuotKham,
            @RequestBody List<String> danhSachIdThuoc) {
        return ResponseEntity.ok(donThuocService.kiemTraCanhBaoDiUng(idLuotKham, danhSachIdThuoc));
    }

    // UC11: Tạo đơn thuốc
    @PostMapping
    public ResponseEntity<DonThuocResponse> taoDonThuoc(@RequestBody DonThuocRequest request) {
        return ResponseEntity.ok(donThuocService.taoDonThuoc(request));
    }

    // UC12: Cập nhật đơn thuốc
    @PutMapping("/{idDonThuoc}")
    public ResponseEntity<DonThuocResponse> capNhatDonThuoc(
            @PathVariable String idDonThuoc,
            @RequestBody DonThuocRequest request) {
        return ResponseEntity.ok(donThuocService.capNhatDonThuoc(idDonThuoc, request));
    }

    // UC14: Xem chi tiết đơn thuốc trước khi in PDF
    @GetMapping("/luot-kham/{idLuotKham}")
    public ResponseEntity<DonThuocResponse> layByLuotKham(@PathVariable String idLuotKham) {
        return ResponseEntity.ok(donThuocService.layDonThuocByLuotKham(idLuotKham));
    }

    @GetMapping("/{idDonThuoc}")
    public ResponseEntity<DonThuocResponse> layById(@PathVariable String idDonThuoc) {
        return ResponseEntity.ok(donThuocService.layDonThuocById(idDonThuoc));
    }

    // UC26: Xem hồ sơ y tế cá nhân
    @GetMapping("/ho-so-ca-nhan/{idBenhNhan}")
    public ResponseEntity<List<DonThuocResponse>> layHoSoCaNhan(@PathVariable String idBenhNhan) {
        return ResponseEntity.ok(donThuocService.layHoSoYTeCaNhan(idBenhNhan));
    }
}