package com.medicare.clinic.controller;

import com.medicare.clinic.service.interfaces.IKhamBenhService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/khambenh")
@RequiredArgsConstructor
public class KhamBenhController {
    private final IKhamBenhService khambenhService;
    
    // TODO: implement endpoints mapping
}
