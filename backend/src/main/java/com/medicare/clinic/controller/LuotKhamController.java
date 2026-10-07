package com.medicare.clinic.controller;

import com.medicare.clinic.dto.response.PhanHoiBenhNhanCho;
import com.medicare.clinic.service.interfaces.ILuotKhamService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/luotkham")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class LuotKhamController {

    private final ILuotKhamService luotKhamService;

    @GetMapping("/cho-kham")
    public List<PhanHoiBenhNhanCho> xemDanhSachBenhNhanCho(
            @RequestParam(required = false) LocalDate ngayKham
    ) {

        if (ngayKham == null) {
            ngayKham = LocalDate.now();
        }

        return luotKhamService.xemDanhSachBenhNhanCho(
                ngayKham
        );
    }
}