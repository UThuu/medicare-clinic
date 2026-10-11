package com.medicare.clinic.controller;

import com.medicare.clinic.dto.auth.LoginResponse;
import com.medicare.clinic.dto.request.CapNhatSinhHieuRequest;
import com.medicare.clinic.dto.request.GhiNhanSinhHieuRequest;
import com.medicare.clinic.dto.response.PhanHoiSinhHieu;
import com.medicare.clinic.service.interfaces.ISinhHieuService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
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

    private LoginResponse layNguoiDungDangNhap(
            HttpServletRequest request
    ) {
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

    private ResponseEntity<?> loi(
            HttpStatus status,
            String message
    ) {
        return ResponseEntity
                .status(status)
                .body(Collections.singletonMap("message", message));
    }

    private boolean coVaiTro(
            LoginResponse user,
            String... vaiTroChoPhep
    ) {
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
    public ResponseEntity<?> ghiNhanSinhHieu(
            @PathVariable String idLuotKham,
            @Valid @RequestBody GhiNhanSinhHieuRequest requestBody,
            HttpServletRequest httpRequest
    ) {
        LoginResponse user = layNguoiDungDangNhap(httpRequest);

        if (user == null) {
            return loi(
                    HttpStatus.UNAUTHORIZED,
                    "Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn."
            );
        }

        if (!coVaiTro(user, "DIEU_DUONG")) {
            return loi(
                    HttpStatus.FORBIDDEN,
                    "Chỉ điều dưỡng mới được ghi nhận sinh hiệu."
            );
        }

        String maNhanVien = user.getMaNv();

        if (maNhanVien == null || maNhanVien.isBlank()) {
            return loi(
                    HttpStatus.FORBIDDEN,
                    "Tài khoản điều dưỡng chưa được liên kết với mã nhân viên."
            );
        }

        if (idLuotKham == null || idLuotKham.isBlank()) {
            return loi(
                    HttpStatus.BAD_REQUEST,
                    "Mã lượt khám không được để trống."
            );
        }

        PhanHoiSinhHieu ketQua =
                sinhHieuService.ghiNhanSinhHieu(
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
    public ResponseEntity<?> xemSinhHieu(
            @PathVariable String idLuotKham,
            HttpServletRequest httpRequest
    ) {
        LoginResponse user = layNguoiDungDangNhap(httpRequest);

        if (user == null) {
            return loi(
                    HttpStatus.UNAUTHORIZED,
                    "Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn."
            );
        }

        if (!coVaiTro(user, "DIEU_DUONG", "BAC_SI")) {
            return loi(
                    HttpStatus.FORBIDDEN,
                    "Tài khoản không có quyền xem sinh hiệu."
            );
        }

        if (idLuotKham == null || idLuotKham.isBlank()) {
            return loi(
                    HttpStatus.BAD_REQUEST,
                    "Mã lượt khám không được để trống."
            );
        }

        PhanHoiSinhHieu ketQua =
                sinhHieuService.xemSinhHieuMoiNhat(idLuotKham);

        if (ketQua == null) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(ketQua);
    }

    /**
     * UC05 - Cập nhật sinh hiệu.
     */
    @PutMapping("/luot-kham/{idLuotKham}")
    public ResponseEntity<?> capNhatSinhHieu(
            @PathVariable String idLuotKham,
            @Valid @RequestBody CapNhatSinhHieuRequest requestBody,
            HttpServletRequest httpRequest
    ) {
        LoginResponse user = layNguoiDungDangNhap(httpRequest);

        if (user == null) {
            return loi(
                    HttpStatus.UNAUTHORIZED,
                    "Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn."
            );
        }

        if (!coVaiTro(user, "DIEU_DUONG")) {
            return loi(
                    HttpStatus.FORBIDDEN,
                    "Chỉ điều dưỡng mới được cập nhật sinh hiệu."
            );
        }

        if (user.getMaNv() == null || user.getMaNv().isBlank()) {
            return loi(
                    HttpStatus.FORBIDDEN,
                    "Tài khoản điều dưỡng chưa được liên kết với mã nhân viên."
            );
        }

        if (idLuotKham == null || idLuotKham.isBlank()) {
            return loi(
                    HttpStatus.BAD_REQUEST,
                    "Mã lượt khám không được để trống."
            );
        }

        PhanHoiSinhHieu ketQua =
                sinhHieuService.capNhatSinhHieu(
                        idLuotKham,
                        requestBody
                );

        return ResponseEntity.ok(ketQua);
    }
}