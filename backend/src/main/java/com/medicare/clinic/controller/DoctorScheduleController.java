package com.medicare.clinic.controller;

import com.medicare.clinic.dto.response.LoginResponse;
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
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeParseException;
import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/doctor/schedules")
@RequiredArgsConstructor
public class DoctorScheduleController {

    private final IScheduleService scheduleService;

    @GetMapping
    public ResponseEntity<List<DoctorScheduleResponse>> getDoctorSchedules(
            @RequestParam(value = "date", required = false) String dateStr,
            HttpServletRequest request) {

        LoginResponse user = requireDoctor(request);

        LocalDate ngayKham;
        if (dateStr == null || dateStr.trim().isEmpty()) {
            ngayKham = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        } else {
            try {
                ngayKham = LocalDate.parse(dateStr);
            } catch (DateTimeParseException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ngày khám không đúng định dạng yyyy-MM-dd.");
            }
        }

        List<DoctorScheduleResponse> schedules = scheduleService.getDoctorSchedule(user.getMaNv(), ngayKham);

        return ResponseEntity.ok()
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .body(schedules != null ? schedules : Collections.emptyList());
    }

    // Danh sách chờ khám dùng chung với điều dưỡng; không lọc theo bác sĩ phụ trách.
    @GetMapping("/waiting")
    public ResponseEntity<List<DoctorScheduleResponse>> getWaitingPatients(
            @RequestParam(value = "date", required = false) String dateStr,
            HttpServletRequest request) {

        requireDoctor(request);

        LocalDate ngayKham;
        if (dateStr == null || dateStr.trim().isEmpty()) {
            ngayKham = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        } else {
            try {
                ngayKham = LocalDate.parse(dateStr);
            } catch (DateTimeParseException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ngày khám không đúng định dạng yyyy-MM-dd.");
            }
        }

        List<DoctorScheduleResponse> waiting = scheduleService.getWaitingPatients(ngayKham);
        return ResponseEntity.ok()
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .body(waiting != null ? waiting : Collections.emptyList());
    }

    private LoginResponse requireDoctor(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("AUTH_USER") == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn. Yêu cầu xác thực.");
        }

        Object authObj = session.getAttribute("AUTH_USER");
        if (!(authObj instanceof LoginResponse user)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn. Yêu cầu xác thực.");
        }

        if (!"BAC_SI".equals(user.getVaiTro())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền truy cập tính năng này.");
        }

        return user;
    }
}
