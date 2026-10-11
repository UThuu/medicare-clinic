package com.medicare.clinic.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medicare.clinic.dto.auth.LoginResponse;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import org.springframework.http.HttpMethod;

import java.io.IOException;
import java.util.Collections;
import java.util.Map;
import java.util.Set;

@Component
public class SessionAuthFilter extends OncePerRequestFilter {

    private final ObjectMapper objectMapper = new ObjectMapper();

    // Các endpoint được phép truy cập không cần kiểm tra session trong filter này
    // Map of HTTP Method -> Set of Paths
    private static final Map<String, Set<String>> PUBLIC_ENDPOINTS = Map.of(
            HttpMethod.POST.name(), Set.of("/api/auth/login", "/api/auth/logout"),
            HttpMethod.GET.name(), Set.of("/api/auth/me")
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();

        // Chỉ áp dụng filter cho các request có tiền tố /api/
        if (!path.startsWith("/api/")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Bỏ qua các endpoint công khai (Login, Logout, Me tự xử lý session riêng) dựa trên method và path
        Set<String> publicPathsForMethod = PUBLIC_ENDPOINTS.getOrDefault(method, Collections.emptySet());
        if (publicPathsForMethod.contains(path)) {
            filterChain.doFilter(request, response);
            return;
        }

        // Kiểm tra session (không tự tạo mới)
        HttpSession session = request.getSession(false);
        if (session == null || !(session.getAttribute("AUTH_USER") instanceof LoginResponse)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.setHeader("Cache-Control", "no-store");
            
            String jsonMessage = objectMapper.writeValueAsString(
                    Collections.singletonMap("message", "Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn. Yêu cầu xác thực.")
            );
            response.getWriter().write(jsonMessage);
            return;
        }

        // Nếu hợp lệ, cho request đi tiếp tới Controller
        filterChain.doFilter(request, response);
    }
}
