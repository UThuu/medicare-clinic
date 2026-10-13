package com.medicare.clinic.controller;

import com.medicare.clinic.dto.request.ThanhToanQrRequest;
import com.medicare.clinic.dto.request.ThanhToanTienMatRequest;
import com.medicare.clinic.dto.request.XacNhanThanhToanRequest;
import com.medicare.clinic.dto.response.*;
import com.medicare.clinic.service.interfaces.IThanhToanService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/thanhtoan")
@RequiredArgsConstructor
@Slf4j
public class ThanhToanController {

    private final IThanhToanService thanhToanService;
    private final com.medicare.clinic.service.PaymentAccess access;
    private final jakarta.servlet.http.HttpServletRequest httpRequest;

    /**
     * API 1: Lấy danh sách các hóa đơn chưa thanh toán chờ xử lý tại quầy
     */
    @GetMapping("/cho-thanh-toan")
    public ResponseEntity<List<HoaDonResponse>> layDanhSachHoaDonChuaThanhToan() {
        access.cashier(httpRequest);
        return ResponseEntity.ok(thanhToanService.layDanhSachHoaDonChuaThanhToan());
    }

    /**
     * API 2: Lấy chi tiết thông tin thanh toán của một hóa đơn
     */
    @GetMapping("/hoa-don/{idHoaDon}")
    public ResponseEntity<ThongTinThanhToanResponse> layThongTinThanhToan(@PathVariable String idHoaDon) {
        access.view(httpRequest, idHoaDon);
        return ResponseEntity.ok(thanhToanService.layThongTinThanhToan(idHoaDon));
    }

    /**
     * API 3 (UC-17): Xác nhận thanh toán hóa đơn
     */
    @PostMapping("/xac-nhan")
    public ResponseEntity<KetQuaThanhToanResponse> xacNhanThanhToan(@RequestBody XacNhanThanhToanRequest request) {
        access.cashier(httpRequest);
        if (!"TIEN_MAT".equals(request.getPhuongThuc())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chọn tiền mặt hoặc QR tại quầy");
        }
        return ResponseEntity.ok(thanhToanService.xacNhanThanhToan(request));
    }

    /**
     * API UC-18: Xác nhận thanh toán tiền mặt tại quầy (tính tiền thối lại)
     */
    @PostMapping("/tien-mat")
    public ResponseEntity<KetQuaThanhToanResponse> thanhToanTienMat(@RequestBody ThanhToanTienMatRequest request) {
        access.cashier(httpRequest);
        return ResponseEntity.ok(thanhToanService.thanhToanTienMat(request));
    }

    /**
     * API UC-19: Lấy thông tin mã VietQR để thanh toán hóa đơn
     */
    @GetMapping("/qr/{idHoaDon}")
    public ResponseEntity<ThongTinQrResponse> layThongTinQrThanhToan(@PathVariable String idHoaDon) {
        access.cashier(httpRequest);
        return ResponseEntity.ok(thanhToanService.layThongTinQrThanhToan(idHoaDon));
    }

    /**
     * API UC-19: Xác nhận thanh toán qua QR/Ngân hàng thành công
     */
    @PostMapping("/qr-xac-nhan")
    public ResponseEntity<KetQuaThanhToanResponse> xacNhanThanhToanQr(@RequestBody ThanhToanQrRequest request) {
        access.cashier(httpRequest);
        return ResponseEntity.ok(thanhToanService.xacNhanThanhToanQr(request));
    }

    /**
     * API UC-20: Khởi tạo liên kết thanh toán trực tuyến VNPay
     */
    @PostMapping("/vnpay/create/{idHoaDon}")
    public ResponseEntity<VNPayPaymentResponse> taoGiaoDichVNPay(@PathVariable String idHoaDon) {
        access.own(httpRequest, idHoaDon);
        return ResponseEntity.ok(thanhToanService.taoGiaoDichVNPay(idHoaDon));
    }

    /**
     * API UC-20: Tiếp nhận và xác thực kết quả thanh toán từ VNPay Callback
     */
    @GetMapping("/vnpay/callback")
    public ResponseEntity<VNPayCallbackResponse> xuLyKetQuaVNPay(@RequestParam Map<String, String> vnpParams) {
        return ResponseEntity.ok(thanhToanService.xuLyKetQuaVNPay(vnpParams));
    }

    /**
     * API 4: Lấy lịch sử giao dịch của hóa đơn
     */
    @GetMapping("/lich-su/{idHoaDon}")
    public ResponseEntity<List<GiaoDichResponse>> layLichSuGiaoDich(@PathVariable String idHoaDon) {
        access.view(httpRequest, idHoaDon);
        return ResponseEntity.ok(thanhToanService.layLichSuGiaoDich(idHoaDon));
    }
}
