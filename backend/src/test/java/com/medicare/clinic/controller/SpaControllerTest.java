package com.medicare.clinic.controller;

import com.medicare.clinic.dto.auth.LoginResponse;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SpaController.class)
class SpaControllerTest {
    @Autowired private MockMvc mvc;

    @ParameterizedTest
    @ValueSource(strings = {"/", "/login", "/patient", "/staff", "/staff/schedules",
            "/staff/medical-record/LK001", "/staff/medical-record/LK001/record-exam"})
    void reactRoutesForwardToIndex(String path) throws Exception {
        mvc.perform(get(path)).andExpect(status().isOk())
                .andExpect(forwardedUrl("/index.html"));
    }

    @ParameterizedTest
    @ValueSource(strings = {"/assets/missing.js", "/missing.css",
            "/staff/medical-record/missing.js", "/api/missing"})
    void missingStaticAndApiPathsDoNotForward(String path) throws Exception {
        LoginResponse user = new LoginResponse();
        user.setVaiTro("BAC_SI");
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("AUTH_USER", user);
        mvc.perform(get(path).session(session)).andExpect(status().isNotFound())
                .andExpect(result -> org.junit.jupiter.api.Assertions.assertNull(
                        result.getResponse().getForwardedUrl()));
    }

    @ParameterizedTest
    @ValueSource(strings = {"/login", "/staff/schedules"})
    void spaDoesNotConsumePostRequests(String path) throws Exception {
        mvc.perform(post(path)).andExpect(status().isMethodNotAllowed());
    }
}
