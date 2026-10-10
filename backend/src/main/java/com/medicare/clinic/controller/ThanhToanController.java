package com.medicare.clinic.controller;

import com.medicare.clinic.dto.request.XacNhanThanhToanRequest;
import com.medicare.clinic.dto.response.GiaoDichResponse;
import com.medicare.clinic.dto.response.HoaDonResponse;
import com.medicare.clinic.dto.response.KetQuaThanhToanResponse;
import com.medicare.clinic.dto.response.ThongTinThanhToanResponse;
import com.medicare.clinic.service.interfaces.IThanhToanService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/thanhtoan")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class ThanhToanController {

    private final IThanhToanService thanhToanService;

    /**
     * API 1: Lấy danh sách các hóa đơn chưa thanh toán chờ xử lý tại quầy
     */
    @GetMapping("/cho-thanh-toan")
    public ResponseEntity<List<HoaDonResponse>> layDanhSachHoaDonChuaThanhToan() {
        return ResponseEntity.ok(thanhToanService.layDanhSachHoaDonChuaThanhToan());
    }

    /**
     * API 2: Lấy chi tiết thông tin thanh toán của một hóa đơn
     */
    @GetMapping("/hoa-don/{idHoaDon}")
    public ResponseEntity<?> layThongTinThanhToan(@PathVariable String idHoaDon) {
        try {
            ThongTinThanhToanResponse response = thanhToanService.layThongTinThanhToan(idHoaDon);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            log.error("Lỗi khi lấy thông tin thanh toán: ", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Lỗi máy chủ: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * API 3 (UC-17): Xác nhận thanh toán hóa đơn
     */
    @PostMapping("/xac-nhan")
    public ResponseEntity<?> xacNhanThanhToan(@RequestBody XacNhanThanhToanRequest request) {
        try {
            KetQuaThanhToanResponse response = thanhToanService.xacNhanThanhToan(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (IllegalStateException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
        } catch (Exception e) {
            log.error("Lỗi khi xác nhận thanh toán: ", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Không thể hoàn tất thanh toán: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * API 4: Lấy lịch sử giao dịch của hóa đơn
     */
    @GetMapping("/lich-su/{idHoaDon}")
    public ResponseEntity<List<GiaoDichResponse>> layLichSuGiaoDich(@PathVariable String idHoaDon) {
        return ResponseEntity.ok(thanhToanService.layLichSuGiaoDich(idHoaDon));
    }
}
