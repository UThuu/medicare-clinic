package com.medicare.clinic.controller;

import com.medicare.clinic.service.interfaces.IThanhToanService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/thanhtoan")
@RequiredArgsConstructor
public class ThanhToanController {
    private final IThanhToanService thanhtoanService;
    
    // TODO: implement endpoints mapping
}
