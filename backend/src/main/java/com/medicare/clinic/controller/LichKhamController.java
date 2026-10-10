package com.medicare.clinic.controller;

import com.medicare.clinic.dto.auth.LoginResponse;
import com.medicare.clinic.dto.request.LichKhamDatTaiQuayRequest;
import com.medicare.clinic.service.interfaces.ILichKhamService;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.ConcurrencyFailureException;
import java.time.LocalDate;
import java.util.Map;
import java.util.function.Supplier;

@RestController @RequestMapping("/api/lichkham") @RequiredArgsConstructor
public class LichKhamController {
    private final ILichKhamService lichkhamService;
    @GetMapping("/bac-si")
    public ResponseEntity<?> doctors(HttpServletRequest http) { return execute(http, () -> lichkhamService.danhSachBacSi()); }
    @GetMapping("/khung-gio")
    public ResponseEntity<?> slots(@RequestParam String maBacSi, @RequestParam LocalDate ngayKham, HttpServletRequest http) {
        return execute(http, () -> lichkhamService.khungGioTrong(maBacSi, ngayKham));
    }
    @PostMapping("/dat-tai-quay")
    public ResponseEntity<?> book(@RequestBody LichKhamDatTaiQuayRequest request, HttpServletRequest http) {
        return execute(http, () -> lichkhamService.datLichKhamTaiQuay(request));
    }
    private ResponseEntity<?> execute(HttpServletRequest http, Supplier<Object> action) {
        HttpSession session = http.getSession(false);
        Object value = session == null ? null : session.getAttribute("AUTH_USER");
        if (!(value instanceof LoginResponse user)) return ResponseEntity.status(401).body(Map.of("message", "Bạn chưa đăng nhập."));
        if (!"LE_TAN".equals(user.getVaiTro())) return ResponseEntity.status(403).body(Map.of("message", "Chỉ lễ tân có quyền đặt lịch tại quầy."));
        try { return ResponseEntity.ok(action.get()); }
        catch (IllegalArgumentException e) { return ResponseEntity.badRequest().body(Map.of("message", e.getMessage())); }
        catch (IllegalStateException | ConcurrencyFailureException e) { return ResponseEntity.status(409).body(Map.of("message", "Khung giờ vừa được đặt bởi người khác, vui lòng chọn lại.")); }
        catch (DataAccessException e) { return ResponseEntity.status(503).body(Map.of("message", "Không thể đặt lịch, vui lòng thử lại.")); }
    }
}
