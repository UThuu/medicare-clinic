package com.medicare.clinic.controller;

import com.medicare.clinic.dto.response.LoginResponse;
import com.medicare.clinic.dto.request.SinhHieuRequest;
import com.medicare.clinic.dto.response.SinhHieuResponse;
import com.medicare.clinic.service.interfaces.ISinhHieuService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Set;

@RestController
@RequestMapping("/api/sinh-hieu")
@RequiredArgsConstructor
@CrossOrigin(
        origins = "http://localhost:5173",
        allowCredentials = "true"
)
public class SinhHieuController {

    private final ISinhHieuService sinhHieuService;

    private LoginResponse layNguoiDungDangNhap(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) {
            return null;
        }

        Object authUser = session.getAttribute("AUTH_USER");
        if (!(authUser instanceof LoginResponse)) {
            return null;
        }

        return (LoginResponse) authUser;
    }

    private boolean coVaiTro(LoginResponse user, String... vaiTroChoPhep) {
        if (user == null || user.getVaiTro() == null) {
            return false;
        }
        return Set.of(vaiTroChoPhep).contains(user.getVaiTro());
    }

    /**
     * UC03 - Ghi nhận sinh hiệu.
     * Danh tính điều dưỡng được lấy từ phiên đăng nhập.
     */
    @PostMapping("/luot-kham/{idLuotKham}")
    public ResponseEntity<SinhHieuResponse> ghiNhanSinhHieu(
            @PathVariable String idLuotKham,
            @Valid @RequestBody SinhHieuRequest requestBody,
            HttpServletRequest httpRequest
    ) {
        LoginResponse user = layNguoiDungDangNhap(httpRequest);

        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn.");
        }

        if (!coVaiTro(user, "DIEU_DUONG")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ điều dưỡng mới được ghi nhận sinh hiệu.");
        }

        String maNhanVien = user.getMaNv();
        if (maNhanVien == null || maNhanVien.isBlank()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Tài khoản điều dưỡng chưa được liên kết với mã nhân viên.");
        }

        if (idLuotKham == null || idLuotKham.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã lượt khám không được để trống.");
        }

        SinhHieuResponse ketQua = sinhHieuService.ghiNhanSinhHieu(
                idLuotKham,
                maNhanVien.trim(),
                requestBody
        );

        return ResponseEntity.ok(ketQua);
    }

    /**
     * Xem sinh hiệu mới nhất của lượt khám.
     * Cho phép Điều dưỡng và Bác sĩ.
     */
    @GetMapping("/luot-kham/{idLuotKham}")
    public ResponseEntity<SinhHieuResponse> xemSinhHieu(
            @PathVariable String idLuotKham,
            HttpServletRequest httpRequest
    ) {
        LoginResponse user = layNguoiDungDangNhap(httpRequest);

        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn.");
        }

        if (!coVaiTro(user, "DIEU_DUONG", "BAC_SI")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Tài khoản không có quyền xem sinh hiệu.");
        }

        if (idLuotKham == null || idLuotKham.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã lượt khám không được để trống.");
        }

        SinhHieuResponse ketQua = sinhHieuService.xemSinhHieuMoiNhat(idLuotKham);
        if (ketQua == null) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(ketQua);
    }

    /**
     * UC05 - Cập nhật sinh hiệu.
     */
    @PutMapping("/luot-kham/{idLuotKham}")
    public ResponseEntity<SinhHieuResponse> capNhatSinhHieu(
            @PathVariable String idLuotKham,
            @Valid @RequestBody SinhHieuRequest requestBody,
            HttpServletRequest httpRequest
    ) {
        LoginResponse user = layNguoiDungDangNhap(httpRequest);

        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn.");
        }

        if (!coVaiTro(user, "DIEU_DUONG")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ điều dưỡng mới được cập nhật sinh hiệu.");
        }

        if (user.getMaNv() == null || user.getMaNv().isBlank()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Tài khoản điều dưỡng chưa được liên kết với mã nhân viên.");
        }

        if (idLuotKham == null || idLuotKham.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã lượt khám không được để trống.");
        }

        SinhHieuResponse ketQua = sinhHieuService.capNhatSinhHieu(idLuotKham, user.getMaNv(), requestBody);
        return ResponseEntity.ok(ketQua);
    }
}
