package com.medicare.clinic.controller;

import com.medicare.clinic.dto.auth.LoginResponse;
import com.medicare.clinic.dto.request.TiepNhanBenhNhanRequest;
import com.medicare.clinic.dto.request.XacNhanBenhNhanRequest;
import com.medicare.clinic.dto.response.PhanHoiBenhNhanCho;
import com.medicare.clinic.dto.response.PhanHoiLichKhamTiepNhan;
import com.medicare.clinic.dto.response.PhanHoiTimBenhNhan;
import com.medicare.clinic.dto.response.PhanHoiTiepNhanBenhNhan;
import com.medicare.clinic.dto.response.PhanHoiXacNhanBenhNhan;
import com.medicare.clinic.service.interfaces.ILuotKhamService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import lombok.RequiredArgsConstructor;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/luotkham")
@RequiredArgsConstructor
@CrossOrigin(
        origins = "http://localhost:5173",
        allowCredentials = "true"
)
public class LuotKhamController {

    private final ILuotKhamService luotKhamService;

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

    private ResponseEntity<?> kiemTraQuyenLeTan(
            HttpServletRequest request
    ) {
        LoginResponse user = layNguoiDungDangNhap(request);

        if (user == null) {
            return loi(
                    HttpStatus.UNAUTHORIZED,
                    "Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn."
            );
        }

        if (!"LE_TAN".equals(user.getVaiTro())) {
            return loi(
                    HttpStatus.FORBIDDEN,
                    "Chỉ lễ tân mới được sử dụng chức năng tiếp nhận bệnh nhân."
            );
        }

    private ResponseEntity<?> kiemTraQuyenXemHangCho(
            HttpServletRequest request
    ) {
        LoginResponse user = layNguoiDungDangNhap(request);

        if (user == null) {
            return loi(
                    HttpStatus.UNAUTHORIZED,
                    "Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn."
            );
        }

        String vaiTro = user.getVaiTro();
        if (!"DIEU_DUONG".equals(vaiTro) && !"LE_TAN".equals(vaiTro)) {
            return loi(
                    HttpStatus.FORBIDDEN,
                    "Chỉ điều dưỡng và lễ tân mới được xem danh sách bệnh nhân chờ."
            );
        }

        return null;
    }

    private ResponseEntity<?> kiemTraQuyenDieuDuong(
            HttpServletRequest request
    ) {
        LoginResponse user = layNguoiDungDangNhap(request);

        if (user == null) {
            return loi(
                    HttpStatus.UNAUTHORIZED,
                    "Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn."
            );
        }

        if (!"DIEU_DUONG".equals(user.getVaiTro())) {
            return loi(
                    HttpStatus.FORBIDDEN,
                    "Chỉ điều dưỡng mới được thực hiện thao tác này."
            );
        }

        return null;
    }

    // =====================================================
    // UC02 - Xem danh sách bệnh nhân chờ
    // =====================================================

    @GetMapping("/cho-kham")
    public ResponseEntity<?> xemDanhSachBenhNhanCho(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate ngayKham,
            HttpServletRequest httpRequest
    ) {
        ResponseEntity<?> loiQuyen = kiemTraQuyenXemHangCho(httpRequest);
        if (loiQuyen != null) {
            return loiQuyen;
        }

        if (ngayKham == null) {
            ngayKham = LocalDate.now(
                    ZoneId.of("Asia/Ho_Chi_Minh")
            );
        }

        List<PhanHoiBenhNhanCho> ketQua =
                luotKhamService.xemDanhSachBenhNhanCho(ngayKham);

        return ResponseEntity.ok(ketQua);
    }

    // =====================================================
    // UC04 - Xác nhận bệnh nhân
    // =====================================================

    @PostMapping("/{idLuotKham}/xac-nhan")
    public ResponseEntity<?> xacNhanBenhNhan(
            @PathVariable String idLuotKham,
            @RequestBody XacNhanBenhNhanRequest request,
            HttpServletRequest httpRequest
    ) {
        ResponseEntity<?> loiQuyen = kiemTraQuyenDieuDuong(httpRequest);
        if (loiQuyen != null) {
            return loiQuyen;
        }

        PhanHoiXacNhanBenhNhan ketQua =
                luotKhamService.xacNhanBenhNhan(
                        idLuotKham,
                        request
                );

        return ResponseEntity.ok(ketQua);
    }

    // =====================================================
    // UC27 - Tìm kiếm hồ sơ bệnh nhân
    // =====================================================

    @GetMapping("/tiep-nhan/tim-benh-nhan")
    public ResponseEntity<?> timKiemBenhNhan(
            @RequestParam(required = false) String soDienThoai,
            @RequestParam(required = false) String hoTen,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate ngaySinh,
            HttpServletRequest httpRequest
    ) {
        ResponseEntity<?> loiQuyen =
                kiemTraQuyenLeTan(httpRequest);

        if (loiQuyen != null) {
            return loiQuyen;
        }

        List<PhanHoiTimBenhNhan> ketQua =
                luotKhamService.timKiemBenhNhan(
                        soDienThoai,
                        hoTen,
                        ngaySinh
                );

        return ResponseEntity.ok(ketQua);
    }

    // =====================================================
    // UC27 - Xem lịch khám trong ngày
    // =====================================================

    @GetMapping("/tiep-nhan/benh-nhan/{idBenhNhan}/lich-hom-nay")
    public ResponseEntity<?> xemLichKhamTrongNgay(
            @PathVariable String idBenhNhan,
            HttpServletRequest httpRequest
    ) {
        ResponseEntity<?> loiQuyen =
                kiemTraQuyenLeTan(httpRequest);

        if (loiQuyen != null) {
            return loiQuyen;
        }

        List<PhanHoiLichKhamTiepNhan> ketQua =
                luotKhamService.xemLichKhamTrongNgay(
                        idBenhNhan,
                        LocalDate.now(
                                ZoneId.of("Asia/Ho_Chi_Minh")
                        )
                );

        return ResponseEntity.ok(ketQua);
    }

    // =====================================================
    // UC27 - Tiếp nhận bệnh nhân
    // =====================================================

    @PostMapping("/tiep-nhan")
    public ResponseEntity<?> tiepNhanBenhNhan(
            @RequestBody TiepNhanBenhNhanRequest request,
            HttpServletRequest httpRequest
    ) {
        ResponseEntity<?> loiQuyen =
                kiemTraQuyenLeTan(httpRequest);

        if (loiQuyen != null) {
            return loiQuyen;
        }

        PhanHoiTiepNhanBenhNhan ketQua =
                luotKhamService.tiepNhanBenhNhan(request);

        return ResponseEntity.ok(ketQua);
    }
}
