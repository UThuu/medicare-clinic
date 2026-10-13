package com.medicare.clinic.controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.*;
import java.util.Map;
@RestControllerAdvice(assignableTypes={ThanhToanController.class,PatientPaymentController.class})
public class PaymentErrorHandler {
 @ExceptionHandler(ResponseStatusException.class) public ResponseEntity<?> status(ResponseStatusException ex){return ResponseEntity.status(ex.getStatusCode()).cacheControl(CacheControl.noStore()).body(Map.of("error",ex.getReason()==null?"Không thể xử lý yêu cầu":ex.getReason()));}
 @ExceptionHandler(IllegalArgumentException.class) public ResponseEntity<?> invalid(IllegalArgumentException ex){return ResponseEntity.badRequest().cacheControl(CacheControl.noStore()).body(Map.of("error",ex.getMessage()));}
 @ExceptionHandler(IllegalStateException.class) public ResponseEntity<?> conflict(IllegalStateException ex){return ResponseEntity.status(409).cacheControl(CacheControl.noStore()).body(Map.of("error",ex.getMessage()));}
}
