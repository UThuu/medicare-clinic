package com.medicare.clinic.controller;
import com.medicare.clinic.dto.auth.LoginResponse;
import com.medicare.clinic.dto.request.TaoHoaDonRequest;
import com.medicare.clinic.service.interfaces.IHoaDonService;
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
import java.util.Map;
@RestController
@RequestMapping("/api/hoadon")
@RequiredArgsConstructor
@Slf4j
public class HoaDonController {
    private final IHoaDonService service;
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
    private ResponseEntity<?> ok(Object data) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(data);
    }
    @GetMapping("/cho-lap")
    public ResponseEntity<?> pending(HttpServletRequest request) {
        cashier(request); return ok(service.layDanhSachLuotKhamChoLapHoaDon());
    }
    @GetMapping("/chi-phi-du-kien/{id}")
    public ResponseEntity<?> preview(@PathVariable String id, HttpServletRequest request) {
        cashier(request); return ok(service.layChiPhiDuKien(id));
    }
    @PostMapping("/tao")
    public ResponseEntity<?> create(@Valid @RequestBody TaoHoaDonRequest body, HttpServletRequest request) {
        String cashierId = cashier(request).getMaNv();
        return ResponseEntity.status(HttpStatus.CREATED).cacheControl(CacheControl.noStore())
            .body(service.taoHoaDon(body, cashierId));
    }
    @GetMapping("/luot-kham/{id}")
    public ResponseEntity<?> byVisit(@PathVariable String id, HttpServletRequest request) {
        cashier(request); return ok(service.layHoaDonTheoLuotKham(id));
    }
    @GetMapping("/{id}")
    public ResponseEntity<?> byId(@PathVariable String id, HttpServletRequest request) {
        cashier(request); return ok(service.layHoaDonTheoId(id));
    }
    @GetMapping
    public ResponseEntity<?> all(HttpServletRequest request) {
        cashier(request); return ok(service.layDanhSachTatCaHoaDon());
    }
    private ResponseEntity<?> error(HttpStatus status, String message) {
        return ResponseEntity.status(status).cacheControl(CacheControl.noStore()).body(Map.of("error", message));
    }
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<?> statusError(ResponseStatusException ex) {
        return error(HttpStatus.valueOf(ex.getStatusCode().value()), ex.getReason());
    }
    @ExceptionHandler({IllegalStateException.class, DataIntegrityViolationException.class, PessimisticLockingFailureException.class, org.hibernate.exception.ConstraintViolationException.class, jakarta.persistence.PessimisticLockException.class, jakarta.persistence.LockTimeoutException.class})
    public ResponseEntity<?> conflict(Exception ex) {
        log.warn("Billing conflict: {}", ex.getClass().getSimpleName());
        return error(HttpStatus.CONFLICT, ex instanceof IllegalStateException ? ex.getMessage() : "Dữ liệu vừa thay đổi. Vui lòng tải lại và kiểm tra hóa đơn.");
    }
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> invalid(IllegalArgumentException ex) { return error(HttpStatus.BAD_REQUEST, ex.getMessage()); }
    @ExceptionHandler({MethodArgumentNotValidException.class, org.springframework.http.converter.HttpMessageNotReadableException.class})
    public ResponseEntity<?> validation(Exception ex) {
        return error(HttpStatus.BAD_REQUEST, "Mã lượt khám hoặc phí khám không hợp lệ");
    }
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> unexpected(Exception ex) {
        log.error("Billing request failed", ex);
        return error(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể xử lý hóa đơn. Vui lòng thử lại.");
    }
}
