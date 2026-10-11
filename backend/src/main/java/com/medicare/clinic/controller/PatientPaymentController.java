package com.medicare.clinic.controller;
import com.medicare.clinic.service.PaymentAccess;
import com.medicare.clinic.service.interfaces.IThanhToanService;
import com.medicare.clinic.service.interfaces.IHoaDonService;
import com.medicare.clinic.repository.HoaDonRepository;
import com.medicare.clinic.entity.enums.TrangThaiHoaDon;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
@RestController @RequestMapping("/api/patient/invoices") @RequiredArgsConstructor
public class PatientPaymentController {
    private final PaymentAccess access;
    private final HoaDonRepository invoices;
    private final IHoaDonService billing;
    private final IThanhToanService payment;
    private ResponseEntity<?> ok(Object value){return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(value);}
    @GetMapping public ResponseEntity<?> list(HttpServletRequest request) {
        String patientId=access.patient(request).getIdBenhNhan();
        return ok(invoices.findByLuotKham_LichKham_BenhNhan_IdBenhNhanOrderByNgayTaoDesc(patientId).stream().map(h -> billing.layHoaDonTheoId(h.getId())).toList());
    }
    @GetMapping("/{id}") public ResponseEntity<?> detail(@PathVariable String id,HttpServletRequest request){access.own(request,id);return ok(payment.layThongTinThanhToan(id));}
    @PostMapping("/{id}/vnpay") public ResponseEntity<?> create(@PathVariable String id,HttpServletRequest request){access.own(request,id);return ok(payment.taoGiaoDichVNPay(id));}
    @GetMapping("/{id}/print") public ResponseEntity<?> print(@PathVariable String id,HttpServletRequest request){access.own(request,id);return ok(billing.layThongTinInHoaDon(id));}
}
