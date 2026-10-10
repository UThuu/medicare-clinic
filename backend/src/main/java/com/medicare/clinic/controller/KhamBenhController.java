package com.medicare.clinic.controller;

import com.medicare.clinic.dto.auth.LoginResponse;
import com.medicare.clinic.dto.khambenh.SaveKhamBenhRequest;
import com.medicare.clinic.service.interfaces.IKhamBenhService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/khambenh")
@RequiredArgsConstructor
public class KhamBenhController {

    private final IKhamBenhService khamBenhService;

    @PostMapping("/ket-qua")
    public ResponseEntity<?> saveKetQuaKham(@RequestBody SaveKhamBenhRequest request, HttpServletRequest httpRequest) {
        String maNv = requireDoctor(httpRequest);
        try {
            khamBenhService.saveKhamBenh(maNv, request);
            return ResponseEntity.ok(Map.of("message", "Lưu kết quả khám thành công"));
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @PostMapping("/{idLichKham}/bat-dau")
    public ResponseEntity<?> startKhamBenh(@PathVariable String idLichKham, HttpServletRequest httpRequest) {
        String maNv = requireDoctor(httpRequest);
        try {
            khamBenhService.startKhamBenh(maNv, idLichKham);
            return ResponseEntity.ok(Map.of("message", "Đã bắt đầu khám"));
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    private String requireDoctor(HttpServletRequest httpRequest) {
        HttpSession session = httpRequest.getSession(false);
        if (session == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Vui lòng đăng nhập");
        }

        Object authObj = session.getAttribute("AUTH_USER");
        if (!(authObj instanceof LoginResponse authUser)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ");
        }

        if (!"BAC_SI".equals(authUser.getVaiTro())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ bác sĩ mới có quyền ghi nhận kết quả khám");
        }

        String maNv = authUser.getMaNv();
        if (maNv == null || maNv.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Tài khoản không gắn với mã nhân viên");
        }

        return maNv;
    }
}
