package com.medicare.clinic.controller;

import com.medicare.clinic.service.interfaces.ILichKhamService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/lichkham")
@RequiredArgsConstructor
public class LichKhamController {
    private final ILichKhamService lichkhamService;
    
    // TODO: implement endpoints mapping
}
