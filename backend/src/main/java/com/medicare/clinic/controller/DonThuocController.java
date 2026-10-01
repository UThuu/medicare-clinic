package com.medicare.clinic.controller;

import com.medicare.clinic.service.interfaces.IDonThuocService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/donthuoc")
@RequiredArgsConstructor
public class DonThuocController {
    private final IDonThuocService donthuocService;
    
    // TODO: implement endpoints mapping
}
