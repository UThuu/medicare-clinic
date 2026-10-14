package com.medicare.clinic.controller;

import com.medicare.clinic.dto.request.DonThuocRequest;
import com.medicare.clinic.dto.response.CanhBaoDiUngResponse;
import com.medicare.clinic.dto.response.DonThuocResponse;
import com.medicare.clinic.dto.response.ThuocResponse;
import com.medicare.clinic.service.interfaces.IDonThuocService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/don-thuoc")
@RequiredArgsConstructor
public class DonThuocController {

    private final IDonThuocService donThuocService;

    // Lấy danh mục thuốc để bác sĩ chọn kê đơn
    @GetMapping("/danh-muc-thuoc")
    public ResponseEntity<List<ThuocResponse>> layDanhMucThuoc() {
        return ResponseEntity.ok(donThuocService.layDanhSachThuoc());
    }

    // UC13: Cảnh báo dị ứng thuốc
    @PostMapping("/kiem-tra-di-ung")
    public ResponseEntity<List<CanhBaoDiUngResponse>> kiemTraDiUng(
            @RequestParam String idLuotKham,
            @RequestBody List<String> danhSachIdThuoc) {
        return ResponseEntity.ok(donThuocService.kiemTraCanhBaoDiUng(idLuotKham, danhSachIdThuoc));
    }

    // Lấy thông tin khám & đơn thuốc của lượt khám
    @GetMapping("/luot-kham/{idLuotKham}")
    public ResponseEntity<DonThuocResponse> layThongTinKeDon(@PathVariable String idLuotKham) {
        return ResponseEntity.ok(donThuocService.layThongTinKeDon(idLuotKham));
    }

    // UC11: Tạo đơn thuốc
    @PostMapping
    public ResponseEntity<DonThuocResponse> taoDonThuoc(@Valid @RequestBody DonThuocRequest request) {
        DonThuocResponse response = donThuocService.taoDonThuoc(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // UC12: Cập nhật đơn thuốc (thao tác độc lập trên đơn thuốc đã lưu)
    @PutMapping("/{idDonThuoc}")
    public ResponseEntity<DonThuocResponse> capNhatDonThuoc(
            @PathVariable String idDonThuoc,
            @Valid @RequestBody DonThuocRequest request) {
        return ResponseEntity.ok(donThuocService.capNhatDonThuoc(idDonThuoc, request));
    }

    // UC14: Lấy dữ liệu để xem trước và in đơn thuốc PDF
    @GetMapping("/{idDonThuoc}/in")
    public ResponseEntity<DonThuocResponse> layDonThuocDeIn(@PathVariable String idDonThuoc) {
        return ResponseEntity.ok(donThuocService.layDonThuocDeIn(idDonThuoc));
    }
}
