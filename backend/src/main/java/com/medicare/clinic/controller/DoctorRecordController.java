package com.medicare.clinic.controller;

import com.medicare.clinic.dto.auth.LoginResponse;
import com.medicare.clinic.dto.record.MedicalRecordResponse;
import com.medicare.clinic.service.DoctorRecordService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/doctor")
@RequiredArgsConstructor
public class DoctorRecordController {

    private final DoctorRecordService doctorRecordService;

    @GetMapping("/medical-record/{idLichKham}")
    public ResponseEntity<MedicalRecordResponse> getMedicalRecord(
            @PathVariable("idLichKham") String idLichKham,
            HttpServletRequest request,
            HttpServletResponse response) {
        
        response.setHeader("Cache-Control", "no-store");

        HttpSession session = request.getSession(false);
        if (session == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Vui lòng đăng nhập");
        }

        Object authObj = session.getAttribute("AUTH_USER");
        if (!(authObj instanceof LoginResponse authUser)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ");
        }

        if (!"BAC_SI".equals(authUser.getVaiTro())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ bác sĩ mới có quyền truy cập hồ sơ bệnh nhân");
        }

        String maNv = authUser.getMaNv();
        if (maNv == null || maNv.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Tài khoản không gắn với mã nhân viên");
        }

        try {
            MedicalRecordResponse recordResponse = doctorRecordService.getMedicalRecord(maNv, idLichKham);
            return ResponseEntity.ok(recordResponse);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }
}
