package com.medicare.clinic.controller;

import com.medicare.clinic.dto.response.HoaDonResponse;
import com.medicare.clinic.dto.response.InHoaDonResponse;
import com.medicare.clinic.dto.response.ThongTinThanhToanResponse;
import com.medicare.clinic.dto.response.VNPayPaymentResponse;
import com.medicare.clinic.service.PaymentAccess;
import com.medicare.clinic.service.interfaces.IThanhToanService;
import com.medicare.clinic.service.interfaces.IHoaDonService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;

import java.util.List;

@RestController
@RequestMapping("/api/patient/invoices")
@RequiredArgsConstructor
public class PatientPaymentController {
    private final PaymentAccess access;
    private final IHoaDonService billing;
    private final IThanhToanService payment;

    @GetMapping
    public ResponseEntity<List<HoaDonResponse>> list(HttpServletRequest request) {
        String patientId = access.patient(request).getIdBenhNhan();
        List<HoaDonResponse> result = billing.layDanhSachHoaDonCuaBenhNhan(patientId);
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ThongTinThanhToanResponse> detail(@PathVariable String id, HttpServletRequest request) {
        access.own(request, id);
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(payment.layThongTinThanhToan(id));
    }

    @PostMapping("/{id}/vnpay")
    public ResponseEntity<VNPayPaymentResponse> create(@PathVariable String id, HttpServletRequest request) {
        access.own(request, id);
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(payment.taoGiaoDichVNPay(id));
    }

    @GetMapping("/{id}/print")
    public ResponseEntity<InHoaDonResponse> print(@PathVariable String id, HttpServletRequest request) {
        access.own(request, id);
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(billing.layThongTinInHoaDon(id));
    }
}
