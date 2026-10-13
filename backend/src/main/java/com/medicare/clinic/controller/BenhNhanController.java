package com.medicare.clinic.controller;

import com.medicare.clinic.service.interfaces.IBenhNhanService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/benhnhan")
@RequiredArgsConstructor
public class BenhNhanController {
    private final IBenhNhanService benhnhanService;
    
    // TODO: implement endpoints mapping
}
