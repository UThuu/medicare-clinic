package com.medicare.clinic.controller;

import com.medicare.clinic.dto.auth.LoginResponse;
import com.medicare.clinic.service.interfaces.IKhamBenhService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class KhamBenhControllerTest {
    @Mock private IKhamBenhService service;
    private MockMvc mvc;
    private MockHttpSession session;
    private static final String BODY = "{\"idLichKham\":\"LICH1\",\"trieuChung\":\"A\",\"ketQuaKham\":\"B\",\"chanDoan\":\"C\"}";

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.standaloneSetup(new KhamBenhController(service)).build();
        session = new MockHttpSession();
        session.setAttribute("AUTH_USER", new LoginResponse("TK1", "bs", "Bác sĩ", "BAC_SI", "BS001", null));
    }

    @Test
    void startRequiresLogin() throws Exception {
        mvc.perform(post("/api/khambenh/LICH1/bat-dau")).andExpect(status().isUnauthorized());
        verifyNoInteractions(service);
    }

    @Test
    void bothEndpointsRequireDoctorRole() throws Exception {
        session.setAttribute("AUTH_USER", new LoginResponse("TK1", "dd", "Điều dưỡng", "DIEU_DUONG", "DD001", null));
        mvc.perform(post("/api/khambenh/LICH1/bat-dau").session(session)).andExpect(status().isForbidden());
        mvc.perform(post("/api/khambenh/ket-qua").session(session).contentType(MediaType.APPLICATION_JSON).content(BODY))
                .andExpect(status().isForbidden());
        verifyNoInteractions(service);
    }

    @Test
    void startDelegatesAuthenticatedDoctor() throws Exception {
        mvc.perform(post("/api/khambenh/LICH1/bat-dau").session(session)).andExpect(status().isOk());
        verify(service).startKhamBenh("BS001", "LICH1");
    }

    @Test
    void startReturnsBadRequestWhenVitalsMissing() throws Exception {
        doThrow(new IllegalArgumentException("Thiếu sinh hiệu")).when(service).startKhamBenh("BS001", "LICH1");
        mvc.perform(post("/api/khambenh/LICH1/bat-dau").session(session)).andExpect(status().isBadRequest());
    }

    @Test
    void saveDelegatesAndReportsSuccess() throws Exception {
        mvc.perform(post("/api/khambenh/ket-qua").session(session).contentType(MediaType.APPLICATION_JSON).content(BODY))
                .andExpect(status().isOk());
        verify(service).saveKhamBenh(eq("BS001"), argThat(request -> request.getIdLichKham().equals("LICH1")));
    }

    @Test
    void saveReturnsBadRequestOnBusinessFailure() throws Exception {
        doThrow(new IllegalArgumentException("Đã hoàn tất")).when(service).saveKhamBenh(eq("BS001"), any());
        mvc.perform(post("/api/khambenh/ket-qua").session(session).contentType(MediaType.APPLICATION_JSON).content(BODY))
                .andExpect(status().isBadRequest());
    }
}
