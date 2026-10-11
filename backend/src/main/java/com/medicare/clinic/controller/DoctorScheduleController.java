package com.medicare.clinic.controller;

import com.medicare.clinic.dto.auth.LoginResponse;
import com.medicare.clinic.dto.response.DoctorScheduleResponse;
import com.medicare.clinic.service.interfaces.IScheduleService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeParseException;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/doctor/schedules")
@RequiredArgsConstructor
public class DoctorScheduleController {

    private final IScheduleService scheduleService;

    @GetMapping
    public ResponseEntity<?> getDoctorSchedules(
            @RequestParam(value = "date", required = false) String dateStr,
            HttpServletRequest request) {

        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("AUTH_USER") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .header(HttpHeaders.CACHE_CONTROL, "no-store")
                    .body(Map.of("message", "Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn. Yêu cầu xác thực."));
        }

        Object authObj = session.getAttribute("AUTH_USER");
        if (!(authObj instanceof LoginResponse)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .header(HttpHeaders.CACHE_CONTROL, "no-store")
                    .body(Map.of("message", "Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn. Yêu cầu xác thực."));
        }

        LoginResponse user = (LoginResponse) authObj;
        if (!"BAC_SI".equals(user.getVaiTro())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .header(HttpHeaders.CACHE_CONTROL, "no-store")
                    .body(Map.of("message", "Bạn không có quyền truy cập tính năng này."));
        }

        LocalDate ngayKham;
        if (dateStr == null || dateStr.trim().isEmpty()) {
            ngayKham = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        } else {
            try {
                ngayKham = LocalDate.parse(dateStr);
            } catch (DateTimeParseException e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .header(HttpHeaders.CACHE_CONTROL, "no-store")
                        .body(Map.of("message", "Ngày khám không đúng định dạng yyyy-MM-dd."));
            }
        }

        List<DoctorScheduleResponse> schedules = scheduleService.getDoctorSchedule(user.getMaNv(), ngayKham);

        return ResponseEntity.ok()
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .body(schedules != null ? schedules : Collections.emptyList());
    }
}
