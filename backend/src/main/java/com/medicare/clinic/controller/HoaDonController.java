package com.medicare.clinic.controller;

import com.medicare.clinic.dto.response.LoginResponse;
import com.medicare.clinic.dto.request.TaoHoaDonRequest;
import com.medicare.clinic.dto.request.HoaDonTongDoanhThuRequest;
import com.medicare.clinic.dto.request.HoaDonTraCuuRequest;
import com.medicare.clinic.dto.response.*;
import com.medicare.clinic.service.interfaces.IHoaDonService;
import com.medicare.clinic.service.PaymentAccess;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.PessimisticLockingFailureException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hoadon")
@RequiredArgsConstructor
@Slf4j
public class HoaDonController {
    private final IHoaDonService service;
    private final PaymentAccess access;

    private LoginResponse cashier(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || !(session.getAttribute("AUTH_USER") instanceof LoginResponse user))
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Vui lòng đăng nhập");
        if (!"THU_NGAN".equals(user.getVaiTro()))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ thu ngân được truy cập hóa đơn");
        if (user.getMaNv() == null || user.getMaNv().isBlank())
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Tài khoản chưa liên kết thu ngân");
        return user;
    }

    @PostMapping("/tong-doanh-thu")
    public ResponseEntity<HoaDonTongDoanhThuResponse> revenue(
            @Valid @RequestBody HoaDonTongDoanhThuRequest filters,
            HttpServletRequest request) {
        cashier(request);
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(service.xemTongDoanhThu(filters));
    }

    @GetMapping("/tra-cuu")
    public ResponseEntity<HoaDonTraCuuResponse> search(
            @ModelAttribute HoaDonTraCuuRequest filters,
            HttpServletRequest request) {
        cashier(request);
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(service.traCuuHoaDon(filters));
    }

    @GetMapping("/cho-lap")
    public ResponseEntity<List<LuotKhamChoHoaDonResponse>> pending(HttpServletRequest request) {
        cashier(request);
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(service.layDanhSachLuotKhamChoLapHoaDon());
    }

    @GetMapping("/chi-phi-du-kien/{id}")
    public ResponseEntity<ChiPhiKhamPreviewResponse> preview(@PathVariable String id, HttpServletRequest request) {
        cashier(request);
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(service.layChiPhiDuKien(id));
    }

    @PostMapping("/tao")
    public ResponseEntity<HoaDonResponse> create(@Valid @RequestBody TaoHoaDonRequest body, HttpServletRequest request) {
        String cashierId = cashier(request).getMaNv();
        return ResponseEntity.status(HttpStatus.CREATED).cacheControl(CacheControl.noStore())
            .body(service.taoHoaDon(body, cashierId));
    }

    @GetMapping("/luot-kham/{id}")
    public ResponseEntity<HoaDonResponse> byVisit(@PathVariable String id, HttpServletRequest request) {
        cashier(request);
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(service.layHoaDonTheoLuotKham(id));
    }

    @GetMapping("/{id}")
    public ResponseEntity<HoaDonResponse> byId(@PathVariable String id, HttpServletRequest request) {
        cashier(request);
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(service.layHoaDonTheoId(id));
    }

    @GetMapping
    public ResponseEntity<List<HoaDonResponse>> all(HttpServletRequest request) {
        cashier(request);
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(service.layDanhSachTatCaHoaDon());
    }

    @GetMapping("/{id}/in")
    public ResponseEntity<InHoaDonResponse> print(@PathVariable String id, HttpServletRequest request) {
        access.view(request, id);
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(service.layThongTinInHoaDon(id));
    }

    private ResponseEntity<Map<String, String>> error(HttpStatus status, String message) {
        return ResponseEntity.status(status).cacheControl(CacheControl.noStore())
                .body(Map.of("error", message, "message", message));
    }

    @ExceptionHandler({org.springframework.validation.BindException.class,
                       org.springframework.web.method.annotation.MethodArgumentTypeMismatchException.class})
    public ResponseEntity<Map<String, String>> invalidFilters(Exception ex) {
        return error(HttpStatus.BAD_REQUEST, "Điều kiện tra cứu không hợp lệ. Kiểm tra ngày, trạng thái và số trang.");
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> statusError(ResponseStatusException ex) {
        return error(HttpStatus.valueOf(ex.getStatusCode().value()), ex.getReason() != null ? ex.getReason() : "Yêu cầu không hợp lệ");
    }

    @ExceptionHandler({IllegalStateException.class, DataIntegrityViolationException.class, PessimisticLockingFailureException.class, org.hibernate.exception.ConstraintViolationException.class, jakarta.persistence.PessimisticLockException.class, jakarta.persistence.LockTimeoutException.class})
    public ResponseEntity<Map<String, String>> conflict(Exception ex) {
        log.warn("Billing conflict: {}", ex.getClass().getSimpleName());
        return error(HttpStatus.CONFLICT, ex instanceof IllegalStateException ? ex.getMessage() : "Dữ liệu vừa thay đổi. Vui lòng tải lại và kiểm tra hóa đơn.");
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> invalid(IllegalArgumentException ex) {
        return error(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler({MethodArgumentNotValidException.class, org.springframework.http.converter.HttpMessageNotReadableException.class})
    public ResponseEntity<Map<String, String>> validation(Exception ex) {
        return error(HttpStatus.BAD_REQUEST, "Dữ liệu hóa đơn hoặc điều kiện tra cứu không hợp lệ");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> unexpected(Exception ex) {
        log.error("Billing request failed", ex);
        return error(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể xử lý hóa đơn. Vui lòng thử lại.");
    }
}
