package com.medicare.clinic.controller;

import com.medicare.clinic.dto.auth.LoginResponse;
import com.medicare.clinic.dto.request.HoaDonTraCuuRequest;
import com.medicare.clinic.dto.response.HoaDonTraCuuResponse;
import com.medicare.clinic.service.interfaces.IHoaDonService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;

@RestController
@RequestMapping("/api/hoadon")
@RequiredArgsConstructor
public class HoaDonController {

    private final IHoaDonService hoadonService;

    @GetMapping("/tra-cuu")
    public ResponseEntity<?> traCuuHoaDon(
            @ModelAttribute HoaDonTraCuuRequest request,
            HttpServletRequest httpRequest
    ) {
        // SessionAuthFilter da kiem tra dang nhap cho /api/**.
        // Kiem tra lai tai day de endpoint UC22 chi danh cho thu ngan.
        HttpSession session = httpRequest.getSession(false);
        Object authObject = session == null ? null : session.getAttribute("AUTH_USER");

        if (!(authObject instanceof LoginResponse)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap(
                            "message",
                            "Ban chua dang nhap hoac phien dang nhap da het han."
                    ));
        }

        LoginResponse authUser = (LoginResponse) authObject;
        if (!"THU_NGAN".equals(authUser.getVaiTro())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap(
                            "message",
                            "Ban khong co quyen tra cuu hoa don."
                    ));
        }

        try {
            HoaDonTraCuuResponse response = hoadonService.traCuuHoaDon(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            HoaDonTraCuuResponse response = new HoaDonTraCuuResponse();
            response.setThongBao(ex.getMessage());
            response.setTongSoKetQua(0);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
}
