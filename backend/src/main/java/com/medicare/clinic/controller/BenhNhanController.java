package com.medicare.clinic.controller;

import com.medicare.clinic.dto.auth.LoginResponse;
import com.medicare.clinic.dto.request.BenhNhanTaoMoiRequest;
import com.medicare.clinic.dto.request.BenhNhanTimKiemRequest;
import com.medicare.clinic.dto.request.BenhNhanThongBaoLichKhamRequest;
import com.medicare.clinic.service.interfaces.IBenhNhanService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.function.Supplier;

@RestController
@RequestMapping("/api/benhnhan")
@RequiredArgsConstructor
public class BenhNhanController {
    private final IBenhNhanService benhnhanService;

    @PostMapping("/tim-kiem")
    public ResponseEntity<?> timKiemHoSo(@RequestBody BenhNhanTimKiemRequest request,
                                         HttpServletRequest httpRequest) {
        ResponseEntity<?> denied = requireRole(httpRequest, "LE_TAN");
        if (denied != null) return denied;
        return execute(() -> benhnhanService.timKiemHoSoBenhNhan(request));
    }

    @PostMapping("/tao-moi")
    public ResponseEntity<?> taoHoSoMoi(@RequestBody BenhNhanTaoMoiRequest request,
                                        HttpServletRequest httpRequest) {
        ResponseEntity<?> denied = requireRole(httpRequest, "LE_TAN");
        if (denied != null) return denied;
        return execute(() -> benhnhanService.taoHoSoBenhNhanMoi(request));
    }

    @PostMapping("/thong-bao-lich-kham")
    public ResponseEntity<?> thongBaoLichKham(
            @RequestBody(required = false) BenhNhanThongBaoLichKhamRequest request,
            HttpServletRequest httpRequest) {
        LoginResponse user = currentUser(httpRequest);
        if (user == null) return unauthorized();
        if (!"BENH_NHAN".equals(user.getVaiTro())) return forbidden();
        return execute(() -> benhnhanService.thongBaoLichKham(
                user.getIdBenhNhan(), request == null ? new BenhNhanThongBaoLichKhamRequest() : request));
    }

    private LoginResponse currentUser(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) return null;
        Object user = session.getAttribute("AUTH_USER");
        return user instanceof LoginResponse ? (LoginResponse) user : null;
    }

    private ResponseEntity<?> requireRole(HttpServletRequest request, String... roles) {
        LoginResponse user = currentUser(request);
        if (user == null) return unauthorized();
        for (String role : roles) if (role.equals(user.getVaiTro())) return null;
        return forbidden();
    }

    private ResponseEntity<?> execute(Supplier<Object> action) {
        try { return ResponseEntity.ok(action.get()); }
        catch (IllegalStateException e) { return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", e.getMessage())); }
        catch (IllegalArgumentException e) { return ResponseEntity.badRequest().body(Map.of("message", e.getMessage())); }
    }

    private ResponseEntity<?> unauthorized() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn."));
    }

    private ResponseEntity<?> forbidden() {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Bạn không có quyền truy cập tính năng này."));
    }
}
