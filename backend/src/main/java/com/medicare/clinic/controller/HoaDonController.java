package com.medicare.clinic.controller;

import com.medicare.clinic.dto.request.TaoHoaDonRequest;
import com.medicare.clinic.dto.response.ChiPhiKhamPreviewResponse;
import com.medicare.clinic.dto.response.HoaDonResponse;
import com.medicare.clinic.dto.response.LuotKhamChoHoaDonResponse;
import com.medicare.clinic.service.interfaces.IHoaDonService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hoadon")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class HoaDonController {

    private final IHoaDonService hoadonService;

    /**
     * API 1: Lấy danh sách các lượt khám chờ lập hóa đơn
     */
    @GetMapping("/cho-lap")
    public ResponseEntity<List<LuotKhamChoHoaDonResponse>> layDanhSachChoLapHoaDon() {
        return ResponseEntity.ok(hoadonService.layDanhSachLuotKhamChoLapHoaDon());
    }

    /**
     * API 2 (UC-16): Xem trước bảng kê chi phí và tổng tiền trước khi tạo hóa đơn
     */
    @GetMapping("/chi-phi-du-kien/{idLuotKham}")
    public ResponseEntity<?> layChiPhiDuKien(@PathVariable String idLuotKham) {
        try {
            ChiPhiKhamPreviewResponse response = hoadonService.layChiPhiDuKien(idLuotKham);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Lỗi khi tính toán chi phí: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * API 3 (UC-15): Xác nhận lập hóa đơn cho lượt khám
     */
    @PostMapping("/tao")
    public ResponseEntity<?> taoHoaDon(@RequestBody TaoHoaDonRequest request) {
        try {
            HoaDonResponse response = hoadonService.taoHoaDon(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (IllegalStateException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
        } catch (Exception e) {
            log.error("Lỗi khi tạo hóa đơn: ", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Không thể tạo hóa đơn: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * API 4: Lấy chi tiết hóa đơn theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> layHoaDonTheoId(@PathVariable String id) {
        try {
            return ResponseEntity.ok(hoadonService.layHoaDonTheoId(id));
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    /**
     * API 5: Lấy hóa đơn theo ID lượt khám
     */
    @GetMapping("/luot-kham/{idLuotKham}")
    public ResponseEntity<?> layHoaDonTheoLuotKham(@PathVariable String idLuotKham) {
        try {
            return ResponseEntity.ok(hoadonService.layHoaDonTheoLuotKham(idLuotKham));
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    /**
     * API 6: Lấy danh sách tất cả hóa đơn đã tạo
     */
    @GetMapping
    public ResponseEntity<List<HoaDonResponse>> layDanhSachTatCaHoaDon() {
        return ResponseEntity.ok(hoadonService.layDanhSachTatCaHoaDon());
    }
}
