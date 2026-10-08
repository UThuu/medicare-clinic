package com.medicare.clinic.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medicare.clinic.dto.auth.LoginRequest;
import com.medicare.clinic.dto.auth.LoginResponse;
import com.medicare.clinic.service.interfaces.IAuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private IAuthService authService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void login_HopLe_TraVe200() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setTenDangNhap("user123");
        req.setMatKhau("password");

        LoginResponse res = new LoginResponse();
        res.setIdTaiKhoan("TK001");
        res.setTenDangNhap("user123");
        res.setVaiTro("BENH_NHAN");
        res.setHoTen("Nguyen Van A");

        when(authService.dangNhap("user123", "password")).thenReturn(res);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idTaiKhoan").value("TK001"))
                .andExpect(jsonPath("$.tenDangNhap").value("user123"))
                .andExpect(jsonPath("$.vaiTro").value("BENH_NHAN"))
                .andExpect(jsonPath("$.hoTen").value("Nguyen Van A"))
                .andExpect(jsonPath("$.matKhau").doesNotExist());
    }

    @Test
    void login_HopLe_TaoSessionMoi() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setTenDangNhap("user123");
        req.setMatKhau("password");

        LoginResponse res = new LoginResponse();
        res.setIdTaiKhoan("TK001");
        res.setTenDangNhap("user123");
        res.setVaiTro("BENH_NHAN");
        res.setHoTen("Nguyen Van A");

        when(authService.dangNhap("user123", "password")).thenReturn(res);

        org.springframework.test.web.servlet.MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idTaiKhoan").value("TK001"))
                .andReturn();
                
        jakarta.servlet.http.HttpSession session = result.getRequest().getSession(false);
        assertNotNull(session);
        assertEquals(1800, session.getMaxInactiveInterval());
        assertEquals(res, session.getAttribute("AUTH_USER"));
    }

    @Test
    void login_HopLe_HuySessionCu() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setTenDangNhap("user123");
        req.setMatKhau("password");

        LoginResponse res = new LoginResponse();
        res.setIdTaiKhoan("TK001");
        when(authService.dangNhap("user123", "password")).thenReturn(res);

        org.springframework.mock.web.MockHttpSession oldSession = new org.springframework.mock.web.MockHttpSession();
        oldSession.setAttribute("old", "data");

        org.springframework.test.web.servlet.MvcResult result = mockMvc.perform(post("/api/auth/login")
                .session(oldSession)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andReturn();
                
        assertTrue(oldSession.isInvalid());
        jakarta.servlet.http.HttpSession newSession = result.getRequest().getSession(false);
        assertNotNull(newSession);
        assertNotSame(oldSession, newSession);
        assertEquals(res, newSession.getAttribute("AUTH_USER"));
    }

    @Test
    void login_ThieuDauVao_KhongTaoSession() throws Exception {
        LoginRequest req = new LoginRequest();

        org.springframework.test.web.servlet.MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andReturn();
                
        assertNull(result.getRequest().getSession(false));
        verify(authService, never()).dangNhap(anyString(), anyString());
    }

    @Test
    void login_RongTenDangNhap_KhongTaoSession() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setTenDangNhap("   ");
        req.setMatKhau("pass");

        org.springframework.test.web.servlet.MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andReturn();
                
        assertNull(result.getRequest().getSession(false));
        verify(authService, never()).dangNhap(anyString(), anyString());
    }

    @Test
    void login_ServiceTuChoi_KhongTaoSession() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setTenDangNhap("user123");
        req.setMatKhau("wrongpass");

        when(authService.dangNhap("user123", "wrongpass"))
            .thenThrow(new IllegalArgumentException("Loi tu service"));

        org.springframework.test.web.servlet.MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized())
                .andReturn();
                
        assertNull(result.getRequest().getSession(false));
    }

    @Test
    void login_LoiHeThong_TraVe500() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setTenDangNhap("user123");
        req.setMatKhau("password");

        when(authService.dangNhap("user123", "password"))
            .thenThrow(new RuntimeException("System error"));

        jakarta.servlet.ServletException exception = assertThrows(jakarta.servlet.ServletException.class, () -> {
            mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(req)));
        });
        
        assertTrue(exception.getCause() instanceof RuntimeException);
        assertEquals("System error", exception.getCause().getMessage());
    }

    // --- Tests for /api/auth/me ---
    
    @Test
    void getMe_HopLe_TraVe200() throws Exception {
        LoginResponse res = new LoginResponse();
        res.setIdTaiKhoan("TK001");
        res.setTenDangNhap("user123");
        res.setVaiTro("BENH_NHAN");
        res.setHoTen("Nguyen Van A");

        org.springframework.mock.web.MockHttpSession session = new org.springframework.mock.web.MockHttpSession();
        session.setAttribute("AUTH_USER", res);

        mockMvc.perform(get("/api/auth/me")
                .session(session))
                .andExpect(status().isOk())
                .andExpect(header().string("Cache-Control", "no-store"))
                .andExpect(jsonPath("$.idTaiKhoan").value("TK001"))
                .andExpect(jsonPath("$.tenDangNhap").value("user123"))
                .andExpect(jsonPath("$.hoTen").value("Nguyen Van A"))
                .andExpect(jsonPath("$.vaiTro").value("BENH_NHAN"))
                .andExpect(jsonPath("$.matKhau").doesNotExist());
    }

    @Test
    void getMe_KhongCoSession_TraVe401() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn."));
    }

    @Test
    void getMe_CoSessionThieuAttribute_TraVe401() throws Exception {
        org.springframework.mock.web.MockHttpSession session = new org.springframework.mock.web.MockHttpSession();

        mockMvc.perform(get("/api/auth/me")
                .session(session))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn."));
    }

    @Test
    void getMe_SaiKieuAttribute_TraVe401() throws Exception {
        org.springframework.mock.web.MockHttpSession session = new org.springframework.mock.web.MockHttpSession();
        session.setAttribute("AUTH_USER", "Một chuỗi thay vì LoginResponse");

        mockMvc.perform(get("/api/auth/me")
                .session(session))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn."));
    }

    @Test
    void loginXong_getMe_ThanhCong() throws Exception {
        // Đăng nhập
        LoginRequest req = new LoginRequest();
        req.setTenDangNhap("user123");
        req.setMatKhau("password");

        LoginResponse res = new LoginResponse();
        res.setIdTaiKhoan("TK001");
        res.setTenDangNhap("user123");
        res.setVaiTro("BENH_NHAN");
        res.setHoTen("Nguyen Van A");

        when(authService.dangNhap("user123", "password")).thenReturn(res);

        org.springframework.test.web.servlet.MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andReturn();
                
        jakarta.servlet.http.HttpSession newSession = loginResult.getRequest().getSession(false);
        assertNotNull(newSession);

        // Lấy thông tin
        mockMvc.perform(get("/api/auth/me")
                .session((org.springframework.mock.web.MockHttpSession) newSession))
                .andExpect(status().isOk())
                .andExpect(header().string("Cache-Control", "no-store"))
                .andExpect(jsonPath("$.idTaiKhoan").value("TK001"))
                .andExpect(jsonPath("$.hoTen").value("Nguyen Van A"));
    }

    // --- Tests for /api/auth/logout ---
    
    @Test
    void logout_CoSession_TraVe204_VaHuySession() throws Exception {
        org.springframework.mock.web.MockHttpSession session = new org.springframework.mock.web.MockHttpSession();
        session.setAttribute("AUTH_USER", new LoginResponse());

        mockMvc.perform(post("/api/auth/logout")
                .session(session))
                .andExpect(status().isNoContent())
                .andExpect(header().string("Cache-Control", "no-store"))
                .andExpect(content().string(""));
                
        assertTrue(session.isInvalid());
        verify(authService, never()).dangNhap(anyString(), anyString());
    }

    @Test
    void logout_KhongCoSession_TraVe204() throws Exception {
        mockMvc.perform(post("/api/auth/logout"))
                .andExpect(status().isNoContent())
                .andExpect(header().string("Cache-Control", "no-store"))
                .andExpect(content().string(""));
                
        verify(authService, never()).dangNhap(anyString(), anyString());
    }

    @Test
    void logout_CoSessionNhungThieuAttribute_TraVe204_VaHuySession() throws Exception {
        org.springframework.mock.web.MockHttpSession session = new org.springframework.mock.web.MockHttpSession();

        mockMvc.perform(post("/api/auth/logout")
                .session(session))
                .andExpect(status().isNoContent())
                .andExpect(header().string("Cache-Control", "no-store"))
                .andExpect(content().string(""));
                
        assertTrue(session.isInvalid());
    }

    @Test
    void luong_Login_Logout_Me() throws Exception {
        // Đăng nhập
        LoginRequest req = new LoginRequest();
        req.setTenDangNhap("user123");
        req.setMatKhau("password");

        LoginResponse res = new LoginResponse();
        res.setIdTaiKhoan("TK001");

        when(authService.dangNhap("user123", "password")).thenReturn(res);

        org.springframework.test.web.servlet.MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andReturn();
                
        jakarta.servlet.http.HttpSession session = loginResult.getRequest().getSession(false);
        assertNotNull(session);
        assertFalse(((org.springframework.mock.web.MockHttpSession) session).isInvalid());

        // Đăng xuất
        mockMvc.perform(post("/api/auth/logout")
                .session((org.springframework.mock.web.MockHttpSession) session))
                .andExpect(status().isNoContent());
                
        assertTrue(((org.springframework.mock.web.MockHttpSession) session).isInvalid());

        // Gọi /me với phiên đã bị hủy sẽ sinh lỗi 401 do framework (hoặc controller)
        // Spring Test MockMvc có thể từ chối nhận session đã bị invalid nên tạo mới không chứa attribute
        mockMvc.perform(get("/api/auth/me")
                .session((org.springframework.mock.web.MockHttpSession) session))
                .andExpect(status().isUnauthorized());
    }
}
