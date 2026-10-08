package com.medicare.clinic.controller;

import com.medicare.clinic.service.interfaces.IAuthService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import lombok.RequiredArgsConstructor;

import com.medicare.clinic.dto.auth.LoginRequest;
import com.medicare.clinic.dto.auth.LoginResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Collections;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final IAuthService authService;
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        if (request.getTenDangNhap() == null || request.getTenDangNhap().trim().isEmpty() || 
            request.getMatKhau() == null || request.getMatKhau().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("message", "Tên đăng nhập và mật khẩu không được để trống."));
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
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("message", "Thông tin đăng nhập không hợp lệ hoặc tài khoản không hoạt động."));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe(HttpServletRequest httpRequest) {
        HttpSession session = httpRequest.getSession(false);
        if (session != null) {
            Object authUser = session.getAttribute("AUTH_USER");
            if (authUser instanceof LoginResponse) {
                return ResponseEntity.ok()
                        .header("Cache-Control", "no-store")
                        .body((LoginResponse) authUser);
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Collections.singletonMap("message", "Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn."));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest httpRequest) {
        HttpSession session = httpRequest.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        return ResponseEntity.noContent()
                .header("Cache-Control", "no-store")
                .build();
    }
}
