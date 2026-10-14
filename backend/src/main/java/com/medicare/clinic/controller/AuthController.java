package com.medicare.clinic.controller;

import com.medicare.clinic.dto.request.LoginRequest;
import com.medicare.clinic.dto.response.LoginResponse;
import com.medicare.clinic.service.interfaces.IAuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final IAuthService authService;
    
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        if (request.getTenDangNhap() == null || request.getTenDangNhap().trim().isEmpty() || 
            request.getMatKhau() == null || request.getMatKhau().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tên đăng nhập và mật khẩu không được để trống.");
        }

        try {
            LoginResponse response = authService.dangNhap(request.getTenDangNhap(), request.getMatKhau());
            
            HttpSession oldSession = httpRequest.getSession(false);
            if (oldSession != null) {
                oldSession.invalidate();
            }
            
            HttpSession newSession = httpRequest.getSession(true);
            newSession.setMaxInactiveInterval(30 * 60);
            newSession.setAttribute("AUTH_USER", response);
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Thông tin đăng nhập không hợp lệ hoặc tài khoản không hoạt động.");
        }
    }

    @GetMapping("/me")
    public ResponseEntity<LoginResponse> getMe(HttpServletRequest httpRequest) {
        HttpSession session = httpRequest.getSession(false);
        if (session != null) {
            Object authUser = session.getAttribute("AUTH_USER");
            if (authUser instanceof LoginResponse loginResponse) {
                return ResponseEntity.ok()
                        .header(HttpHeaders.CACHE_CONTROL, "no-store")
                        .body(loginResponse);
            }
        }
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn.");
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest httpRequest) {
        HttpSession session = httpRequest.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        return ResponseEntity.noContent()
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .build();
    }
}
