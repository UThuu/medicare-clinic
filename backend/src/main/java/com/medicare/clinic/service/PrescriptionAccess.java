package com.medicare.clinic.service;

import com.medicare.clinic.dto.response.LoginResponse;
import com.medicare.clinic.entity.LuotKham;
import com.medicare.clinic.repository.DonThuocRepository;
import com.medicare.clinic.repository.LuotKhamRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/** All prescription endpoints are restricted to the assigned doctor. */
@Service
@RequiredArgsConstructor
public class PrescriptionAccess {
    private final LuotKhamRepository visits;
    private final DonThuocRepository prescriptions;

    public LoginResponse doctor(HttpServletRequest request) {
        var session = request.getSession(false);
        if (session == null || !(session.getAttribute("AUTH_USER") instanceof LoginResponse user)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Vui lòng đăng nhập.");
        }
        if (!"BAC_SI".equals(user.getVaiTro()) || user.getMaNv() == null || user.getMaNv().isBlank()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ bác sĩ được truy cập chức năng kê đơn.");
        }
        return user;
    }

    @Transactional(readOnly = true)
    public void visit(HttpServletRequest request, String id) {
        var user = doctor(request);
        requireId(id);
        var visit = visits.findById(id).or(() -> visits.findByLichKham_IdLichKham(id))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy lượt khám."));
        assigned(user, visit);
    }

    @Transactional(readOnly = true)
    public void prescription(HttpServletRequest request, String id) {
        var user = doctor(request);
        requireId(id);
        var prescription = prescriptions.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn thuốc."));
        assigned(user, prescription.getLuotKham());
    }

    private void requireId(String id) {
        if (id == null || id.isBlank() || id.length() > 36) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã lượt khám hoặc đơn thuốc không hợp lệ.");
        }
    }

    private void assigned(LoginResponse user, LuotKham visit) {
        if (visit == null || visit.getLichKham() == null || visit.getLichKham().getBacSi() == null
                || !user.getMaNv().equals(visit.getLichKham().getBacSi().getMaNv())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không phụ trách lượt khám này.");
        }
    }
}
