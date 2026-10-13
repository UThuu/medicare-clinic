package com.medicare.clinic.controller;

import com.medicare.clinic.service.interfaces.IAuthService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final IAuthService authService;
    
    // TODO: implement endpoints mapping
}
