package com.medicare.clinic.controller;

import com.medicare.clinic.dto.response.LoginResponse;
import com.medicare.clinic.dto.request.TiepNhanBenhNhanRequest;
import com.medicare.clinic.dto.response.BenhNhanChoResponse;
import com.medicare.clinic.dto.response.LichKhamTiepNhanResponse;
import com.medicare.clinic.dto.response.TimBenhNhanResponse;
import com.medicare.clinic.dto.response.TiepNhanBenhNhanResponse;
import com.medicare.clinic.dto.response.XacNhanBenhNhanResponse;
import com.medicare.clinic.service.interfaces.ILuotKhamService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import lombok.RequiredArgsConstructor;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.ZoneId;
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

    private void kiemTraQuyenLeTan(HttpServletRequest request) {
        LoginResponse user = layNguoiDungDangNhap(request);
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn.");
        }
        if (!"LE_TAN".equals(user.getVaiTro())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ lễ tân mới được sử dụng chức năng tiếp nhận bệnh nhân.");
        }
    }

    private void kiemTraQuyenXemHangCho(HttpServletRequest request) {
        LoginResponse user = layNguoiDungDangNhap(request);
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn.");
        }
        String vaiTro = user.getVaiTro();
        if (!"DIEU_DUONG".equals(vaiTro) && !"LE_TAN".equals(vaiTro)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ điều dưỡng và lễ tân mới được xem danh sách bệnh nhân chờ.");
        }
    }

    private void kiemTraQuyenDieuDuong(HttpServletRequest request) {
        LoginResponse user = layNguoiDungDangNhap(request);
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn.");
        }
        if (!"DIEU_DUONG".equals(user.getVaiTro())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ điều dưỡng mới được thực hiện thao tác này.");
        }
    }

    // =====================================================
    // UC02 - Xem danh sách bệnh nhân chờ
    // =====================================================

    @GetMapping("/cho-kham")
    public ResponseEntity<List<BenhNhanChoResponse>> xemDanhSachBenhNhanCho(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate ngayKham,
            HttpServletRequest httpRequest
    ) {
        kiemTraQuyenXemHangCho(httpRequest);

        if (ngayKham == null) {
            ngayKham = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        }

        List<BenhNhanChoResponse> ketQua = luotKhamService.xemDanhSachBenhNhanCho(ngayKham);
        return ResponseEntity.ok(ketQua);
    }

    // =====================================================
    // UC04 - Xác nhận bệnh nhân
    // =====================================================

    @PostMapping("/{idLuotKham}/xac-nhan")
    public ResponseEntity<XacNhanBenhNhanResponse> xacNhanBenhNhan(
            @PathVariable String idLuotKham,
            @RequestBody TiepNhanBenhNhanRequest request,
            HttpServletRequest httpRequest
    ) {
        kiemTraQuyenDieuDuong(httpRequest);
        XacNhanBenhNhanResponse ketQua = luotKhamService.xacNhanBenhNhan(idLuotKham, request);
        return ResponseEntity.ok(ketQua);
    }

    // =====================================================
    // UC27 - Tìm kiếm hồ sơ bệnh nhân
    // =====================================================

    @GetMapping("/tiep-nhan/tim-benh-nhan")
    public ResponseEntity<List<TimBenhNhanResponse>> timKiemBenhNhan(
            @RequestParam(required = false) String soDienThoai,
            @RequestParam(required = false) String hoTen,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate ngaySinh,
            HttpServletRequest httpRequest
    ) {
        kiemTraQuyenLeTan(httpRequest);
        List<TimBenhNhanResponse> ketQua = luotKhamService.timKiemBenhNhan(soDienThoai, hoTen, ngaySinh);
        return ResponseEntity.ok(ketQua);
    }

    // =====================================================
    // UC27 - Xem lịch khám trong ngày
    // =====================================================

    @GetMapping("/tiep-nhan/benh-nhan/{idBenhNhan}/lich-hom-nay")
    public ResponseEntity<List<LichKhamTiepNhanResponse>> xemLichKhamTrongNgay(
            @PathVariable String idBenhNhan,
            HttpServletRequest httpRequest
    ) {
        kiemTraQuyenLeTan(httpRequest);
        List<LichKhamTiepNhanResponse> ketQua = luotKhamService.xemLichKhamTrongNgay(
                idBenhNhan,
                LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh"))
        );
        return ResponseEntity.ok(ketQua);
    }

    // =====================================================
    // UC27 - Tiếp nhận bệnh nhân
    // =====================================================

    @PostMapping("/tiep-nhan")
    public ResponseEntity<TiepNhanBenhNhanResponse> tiepNhanBenhNhan(
            @RequestBody TiepNhanBenhNhanRequest request,
            HttpServletRequest httpRequest
    ) {
        kiemTraQuyenLeTan(httpRequest);
        TiepNhanBenhNhanResponse ketQua = luotKhamService.tiepNhanBenhNhan(request);
        return ResponseEntity.ok(ketQua);
    }
}
