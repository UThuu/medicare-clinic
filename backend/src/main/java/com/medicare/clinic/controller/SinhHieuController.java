package com.medicare.clinic.controller;

import com.medicare.clinic.service.interfaces.ISinhHieuService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/sinhhieu")
@RequiredArgsConstructor
public class SinhHieuController {
    private final ISinhHieuService sinhhieuService;
    
    // TODO: implement endpoints mapping
}
