package com.medicare.clinic.controller;

import com.medicare.clinic.dto.request.ThanhToanQrRequest;
import com.medicare.clinic.dto.request.ThanhToanTienMatRequest;
import com.medicare.clinic.dto.request.XacNhanThanhToanRequest;
import com.medicare.clinic.dto.response.GiaoDichResponse;
import com.medicare.clinic.dto.response.HoaDonResponse;
import com.medicare.clinic.dto.response.KetQuaThanhToanResponse;
import com.medicare.clinic.dto.response.ThanhToanTienMatResponse;
import com.medicare.clinic.dto.response.ThongTinQrResponse;
import com.medicare.clinic.dto.response.ThongTinThanhToanResponse;
import com.medicare.clinic.dto.response.VNPayCallbackResponse;
import com.medicare.clinic.dto.response.VNPayPaymentResponse;
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
     * API UC-18: Xác nhận thanh toán tiền mặt tại quầy (tính tiền thối lại)
     */
    @PostMapping("/tien-mat")
    public ResponseEntity<?> thanhToanTienMat(@RequestBody ThanhToanTienMatRequest request) {
        try {
            ThanhToanTienMatResponse response = thanhToanService.thanhToanTienMat(request);
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
            log.error("Lỗi khi thanh toán tiền mặt: ", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Không thể hoàn tất thanh toán tiền mặt: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * API UC-19: Lấy thông tin mã VietQR để thanh toán hóa đơn
     */
    @GetMapping("/qr/{idHoaDon}")
    public ResponseEntity<?> layThongTinQrThanhToan(@PathVariable String idHoaDon) {
        try {
            ThongTinQrResponse response = thanhToanService.layThongTinQrThanhToan(idHoaDon);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (IllegalStateException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
        } catch (Exception e) {
            log.error("Lỗi khi sinh mã VietQR: ", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Lỗi máy chủ khi sinh mã QR: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * API UC-19: Xác nhận thanh toán qua QR/Ngân hàng thành công
     */
    @PostMapping("/qr-xac-nhan")
    public ResponseEntity<?> xacNhanThanhToanQr(@RequestBody ThanhToanQrRequest request) {
        try {
            KetQuaThanhToanResponse response = thanhToanService.xacNhanThanhToanQr(request);
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
            log.error("Lỗi khi xác nhận thanh toán QR: ", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Không thể hoàn tất thanh toán QR: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * API UC-20: Khởi tạo liên kết thanh toán trực tuyến VNPay
     */
    @GetMapping("/vnpay/create/{idHoaDon}")
    public ResponseEntity<?> taoGiaoDichVNPay(@PathVariable String idHoaDon) {
        try {
            VNPayPaymentResponse response = thanhToanService.taoGiaoDichVNPay(idHoaDon);
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
            log.error("Lỗi khi tạo liên kết thanh toán VNPay: ", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Không thể tạo liên kết thanh toán VNPay: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * API UC-20: Tiếp nhận và xác thực kết quả thanh toán từ VNPay Callback
     */
    @GetMapping("/vnpay/callback")
    public ResponseEntity<?> xuLyKetQuaVNPay(@RequestParam Map<String, String> vnpParams) {
        try {
            VNPayCallbackResponse response = thanhToanService.xuLyKetQuaVNPay(vnpParams);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            log.error("Lỗi khi xử lý callback VNPay: ", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Lỗi xử lý kết quả VNPay: " + e.getMessage());
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
