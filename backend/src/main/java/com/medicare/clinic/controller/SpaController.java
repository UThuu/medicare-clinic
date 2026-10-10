package com.medicare.clinic.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/** Keep these entry points in sync with frontend/src/App.tsx. */
@Controller
public class SpaController {
    @GetMapping({"/", "/login", "/patient", "/staff", "/staff/schedules", "/staff/patient-search", "/staff/lich-kham/dat-tai-quay",
            "/staff/medical-record/{id:[^.]+}",
            "/staff/medical-record/{id:[^.]+}/record-exam"})
    public String index() {
        return "forward:/index.html";
    }
}
