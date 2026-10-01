package com.medicare.clinic.controller;

import com.medicare.clinic.service.interfaces.ILuotKhamService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/luotkham")
@RequiredArgsConstructor
public class LuotKhamController {
    private final ILuotKhamService luotkhamService;
    
    // TODO: implement endpoints mapping
}
