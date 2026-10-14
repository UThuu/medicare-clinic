package com.medicare.clinic.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.*;
import java.util.Map;

@RestControllerAdvice(assignableTypes={ThanhToanController.class, PatientPaymentController.class})
public class PaymentErrorHandler {
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> status(ResponseStatusException ex) {
        String msg = ex.getReason() == null ? "Không thể xử lý yêu cầu" : ex.getReason();
        return ResponseEntity.status(ex.getStatusCode())
                .cacheControl(CacheControl.noStore())
                .body(Map.of("error", msg, "message", msg));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> invalid(IllegalArgumentException ex) {
        String msg = ex.getMessage() == null ? "Dữ liệu không hợp lệ" : ex.getMessage();
        return ResponseEntity.badRequest()
                .cacheControl(CacheControl.noStore())
                .body(Map.of("error", msg, "message", msg));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> conflict(IllegalStateException ex) {
        String msg = ex.getMessage() == null ? "Xung đột dữ liệu" : ex.getMessage();
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .cacheControl(CacheControl.noStore())
                .body(Map.of("error", msg, "message", msg));
    }
}
