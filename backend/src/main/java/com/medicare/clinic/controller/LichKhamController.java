package com.medicare.clinic.controller;

import com.medicare.clinic.dto.response.*;
import com.medicare.clinic.dto.request.*;
import com.medicare.clinic.service.interfaces.ILichKhamService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/lichkham")
@RequiredArgsConstructor
public class LichKhamController {
    private final ILichKhamService lichkhamService;

    @GetMapping("/trong-ngay")
    public ResponseEntity<List<LichHenTrongNgayResponse>> lichHenTrongNgay(
            @RequestParam(required = false)
            @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE)
            LocalDate ngayKham,
            HttpServletRequest request
    ) {
        requireRole(request, "LE_TAN");
        return ResponseEntity.ok(lichkhamService.layDanhSachLichHenTrongNgay(ngayKham));
    }

    @GetMapping("/bac-si")
    public ResponseEntity<List<BacSiDatLichResponse>> counterDoctors(HttpServletRequest request) {
        requireRole(request, "LE_TAN");
        return ResponseEntity.ok(lichkhamService.danhSachBacSi());
    }

    @GetMapping("/bac-si-truc-tuyen")
    public ResponseEntity<BacSiGoiYDaTungKhamResponse> doctors(HttpServletRequest request) {
        LoginResponse user = requireRole(request, "BENH_NHAN");
        return ResponseEntity.ok(lichkhamService.danhSachBacSi(user.getIdBenhNhan()));
    }

    @GetMapping("/khung-gio")
    public ResponseEntity<LichKhamKhungGioResponse> slots(
            @RequestParam String maBacSi,
            @RequestParam LocalDate ngayKham,
            HttpServletRequest request) {
        requireRole(request, "BENH_NHAN", "LE_TAN");
        return ResponseEntity.ok(lichkhamService.khungGioTrong(maBacSi, ngayKham));
    }

    @PostMapping("/kiem-tra-trong")
    public ResponseEntity<LichKhamKiemTraTrongResponse> kiemTraLichTrong(
            @RequestBody LichKhamKiemTraTrongRequest request,
            HttpServletRequest httpRequest) {
        requireRole(httpRequest, "BENH_NHAN", "LE_TAN");
        return ResponseEntity.ok(lichkhamService.kiemTraLichTrong(request));
    }

    @PostMapping("/bac-si-da-kham")
    public ResponseEntity<BacSiGoiYDaTungKhamResponse> goiYBacSiDaTungKham(
            @RequestBody(required = false) BacSiGoiYDaTungKhamRequest request,
            HttpServletRequest httpRequest) {
        LoginResponse user = requireRole(httpRequest, "BENH_NHAN");
        return ResponseEntity.ok(lichkhamService.goiYBacSiDaTungKham(user.getIdBenhNhan(), request));
    }

    @PostMapping("/goi-y-khung-gio-thay-the")
    public ResponseEntity<LichKhamGoiYKhungGioThayTheResponse> goiYKhungGioThayThe(
            @RequestBody LichKhamGoiYKhungGioThayTheRequest request,
            HttpServletRequest httpRequest) {
        requireRole(httpRequest, "BENH_NHAN");
        return ResponseEntity.ok(lichkhamService.goiYKhungGioThayThe(request));
    }

    @PostMapping("/dat-truc-tuyen")
    public ResponseEntity<DatLichKhamResponse> datLichKhamTrucTuyen(
            @RequestBody LichKhamDatTrucTuyenRequest request,
            HttpServletRequest httpRequest) {
        LoginResponse user = requireRole(httpRequest, "BENH_NHAN");
        return ResponseEntity.ok(lichkhamService.datLichKhamTrucTuyen(user.getIdBenhNhan(), request));
    }

    @PostMapping("/dat-tai-quay")
    public ResponseEntity<DatLichKhamResponse> datLichKhamTaiQuay(
            @RequestBody LichKhamDatTaiQuayRequest request,
            HttpServletRequest httpRequest) {
        requireRole(httpRequest, "LE_TAN");
        return ResponseEntity.ok(lichkhamService.datLichKhamTaiQuay(request));
    }

    private LoginResponse currentUser(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) return null;
        Object user = session.getAttribute("AUTH_USER");
        return user instanceof LoginResponse ? (LoginResponse) user : null;
    }

    private LoginResponse requireRole(HttpServletRequest request, String... roles) {
        LoginResponse user = currentUser(request);
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn.");
        }
        for (String role : roles) {
            if (role.equals(user.getVaiTro())) return user;
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền truy cập tính năng này.");
    }
}
