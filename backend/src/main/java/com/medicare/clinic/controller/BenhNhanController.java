package com.medicare.clinic.controller;

import com.medicare.clinic.dto.response.*;
import com.medicare.clinic.dto.request.*;
import com.medicare.clinic.service.interfaces.IBenhNhanService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/benhnhan")
@RequiredArgsConstructor
public class BenhNhanController {
    private final IBenhNhanService benhnhanService;

    @PostMapping("/tim-kiem")
    public ResponseEntity<BenhNhanTimKiemResponse> timKiemHoSo(
            @RequestBody BenhNhanTimKiemRequest request,
            HttpServletRequest httpRequest) {
        requireRole(httpRequest, "LE_TAN");
        return ResponseEntity.ok(benhnhanService.timKiemHoSoBenhNhan(request));
    }

    @PostMapping("/tao-moi")
    public ResponseEntity<BenhNhanTaoMoiResponse> taoHoSoMoi(
            @RequestBody BenhNhanTaoMoiRequest request,
            HttpServletRequest httpRequest) {
        requireRole(httpRequest, "LE_TAN");
        return ResponseEntity.ok(benhnhanService.taoHoSoBenhNhanMoi(request));
    }

    @PostMapping("/kiem-tra-so-dien-thoai")
    public ResponseEntity<BenhNhanTimKiemResponse> kiemTraSoDienThoai(
            @RequestBody BenhNhanTimKiemRequest request,
            HttpServletRequest httpRequest) {
        requireRole(httpRequest, "LE_TAN");
        return ResponseEntity.ok(benhnhanService.kiemTraSoDienThoai(request));
    }

    @PostMapping("/thong-bao-lich-kham")
    public ResponseEntity<BenhNhanThongBaoLichKhamResponse> thongBaoLichKham(
            @RequestBody(required = false) BenhNhanThongBaoLichKhamRequest request,
            HttpServletRequest httpRequest) {
        LoginResponse user = requireRole(httpRequest, "BENH_NHAN");
        return ResponseEntity.ok(benhnhanService.thongBaoLichKham(
                user.getIdBenhNhan(), request == null ? new BenhNhanThongBaoLichKhamRequest() : request));
    }

    @GetMapping("/ho-so-y-te")
    public ResponseEntity<HoSoYTeCaNhanResponse> layHoSoYTeCaNhan(HttpServletRequest httpRequest) {
        LoginResponse user = requireRole(httpRequest, "BENH_NHAN");
        if (user.getIdBenhNhan() == null || user.getIdBenhNhan().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Tài khoản của bạn chưa được liên kết với hồ sơ bệnh nhân.");
        }
        return ResponseEntity.ok(benhnhanService.layHoSoYTeCaNhan(user.getIdBenhNhan()));
    }

    // CRUD Dị ứng bệnh nhân dùng chung cho cả Bác sĩ (UC-07) và Điều dưỡng (UC-03)
    @GetMapping("/{idBenhNhan}/di-ung")
    public ResponseEntity<List<MedicalRecordResponse.AllergyInfo>> layDanhSachDiUng(
            @PathVariable String idBenhNhan,
            HttpServletRequest httpRequest) {
        requireRole(httpRequest, "BAC_SI", "DIEU_DUONG");
        return ResponseEntity.ok(benhnhanService.layDanhSachDiUng(idBenhNhan));
    }

    @PostMapping("/{idBenhNhan}/di-ung")
    public ResponseEntity<List<MedicalRecordResponse.AllergyInfo>> themHoacCapNhatDiUng(
            @PathVariable String idBenhNhan,
            @RequestBody BenhNhanDiUngRequest request,
            HttpServletRequest httpRequest) {
        requireRole(httpRequest, "BAC_SI", "DIEU_DUONG");
        return ResponseEntity.ok(benhnhanService.themHoacCapNhatDiUng(idBenhNhan, request.getThanhPhan(), request.getGhiChu()));
    }

    @DeleteMapping("/{idBenhNhan}/di-ung")
    public ResponseEntity<List<MedicalRecordResponse.AllergyInfo>> xoaDiUng(
            @PathVariable String idBenhNhan,
            @RequestParam String thanhPhan,
            HttpServletRequest httpRequest) {
        requireRole(httpRequest, "BAC_SI", "DIEU_DUONG");
        return ResponseEntity.ok(benhnhanService.xoaDiUng(idBenhNhan, thanhPhan));
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
