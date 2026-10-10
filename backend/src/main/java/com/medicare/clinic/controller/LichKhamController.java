package com.medicare.clinic.controller;

import com.medicare.clinic.dto.auth.LoginResponse;
import com.medicare.clinic.dto.request.BacSiGoiYDaTungKhamRequest;
import com.medicare.clinic.dto.request.LichKhamDatTaiQuayRequest;
import com.medicare.clinic.dto.request.LichKhamDatTrucTuyenRequest;
import com.medicare.clinic.dto.request.LichKhamGoiYKhungGioThayTheRequest;
import com.medicare.clinic.dto.request.LichKhamKiemTraTrongRequest;
import com.medicare.clinic.service.interfaces.ILichKhamService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/lichkham")
@RequiredArgsConstructor
public class LichKhamController {
    private final ILichKhamService lichkhamService;

    @PostMapping("/kiem-tra-trong")
    public ResponseEntity<?> kiemTraLichTrong(@RequestBody LichKhamKiemTraTrongRequest request,
                                               HttpServletRequest httpRequest) {
        ResponseEntity<?> denied = requireRole(httpRequest, "BENH_NHAN", "LE_TAN");
        if (denied != null) return denied;
        return execute(() -> lichkhamService.kiemTraLichTrong(request));
    }

    @PostMapping("/bac-si-da-kham")
    public ResponseEntity<?> goiYBacSiDaTungKham(@RequestBody(required = false) BacSiGoiYDaTungKhamRequest request,
                                                   HttpServletRequest httpRequest) {
        LoginResponse user = currentUser(httpRequest);
        if (user == null) return unauthorized();
        if (!"BENH_NHAN".equals(user.getVaiTro())) return forbidden();
        return execute(() -> lichkhamService.goiYBacSiDaTungKham(user.getIdBenhNhan(), request));
    }

    @PostMapping("/goi-y-khung-gio-thay-the")
    public ResponseEntity<?> goiYKhungGioThayThe(@RequestBody LichKhamGoiYKhungGioThayTheRequest request,
                                                  HttpServletRequest httpRequest) {
        ResponseEntity<?> denied = requireRole(httpRequest, "BENH_NHAN");
        if (denied != null) return denied;
        return execute(() -> lichkhamService.goiYKhungGioThayThe(request));
    }

    @PostMapping("/dat-truc-tuyen")
    public ResponseEntity<?> datLichKhamTrucTuyen(@RequestBody LichKhamDatTrucTuyenRequest request,
                                                   HttpServletRequest httpRequest) {
        LoginResponse user = currentUser(httpRequest);
        if (user == null) return unauthorized();
        if (!"BENH_NHAN".equals(user.getVaiTro())) return forbidden();
        return execute(() -> lichkhamService.datLichKhamTrucTuyen(user.getIdBenhNhan(), request));
    }

    @PostMapping("/dat-tai-quay")
    public ResponseEntity<?> datLichKhamTaiQuay(@RequestBody LichKhamDatTaiQuayRequest request,
                                                HttpServletRequest httpRequest) {
        ResponseEntity<?> denied = requireRole(httpRequest, "LE_TAN");
        if (denied != null) return denied;
        return execute(() -> lichkhamService.datLichKhamTaiQuay(request));
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

    private ResponseEntity<?> execute(java.util.function.Supplier<Object> action) {
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
