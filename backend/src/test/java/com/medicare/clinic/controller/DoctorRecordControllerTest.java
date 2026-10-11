package com.medicare.clinic.controller;

import com.medicare.clinic.dto.auth.LoginResponse;
import com.medicare.clinic.service.DoctorRecordService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(DoctorRecordController.class)
@AutoConfigureMockMvc(addFilters = false) // Disable security filters if any for unit test
public class DoctorRecordControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DoctorRecordService doctorRecordService;

    private MockHttpSession session;

    @BeforeEach
    void setUp() {
        session = new MockHttpSession();
    }

    @Test
    void getMedicalRecord_Unauthorized_NoSession() throws Exception {
        mockMvc.perform(get("/api/doctor/medical-record/LK001"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getMedicalRecord_Forbidden_NotDoctor() throws Exception {
        LoginResponse loginRes = new LoginResponse("TK01", "lt01", "Le Tan", "LE_TAN", "LT001", null);
        session.setAttribute("AUTH_USER", loginRes);

        mockMvc.perform(get("/api/doctor/medical-record/LK001").session(session))
                .andExpect(status().isForbidden());
    }

    @Test
    void getMedicalRecord_Success() throws Exception {
        LoginResponse loginRes = new LoginResponse("TK02", "bs01", "Bac Si", "BAC_SI", "NV001", null);
        session.setAttribute("AUTH_USER", loginRes);

        // Service mocked behavior can be verified in ServiceTest, here just check 200 OK
        mockMvc.perform(get("/api/doctor/medical-record/LK001").session(session))
                .andExpect(status().isOk());
    }
}

