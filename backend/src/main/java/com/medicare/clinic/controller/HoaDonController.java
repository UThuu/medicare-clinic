package com.medicare.clinic.controller;

import com.medicare.clinic.service.interfaces.IHoaDonService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/hoadon")
@RequiredArgsConstructor
public class HoaDonController {
    private final IHoaDonService hoadonService;
    
    // TODO: implement endpoints mapping
}
