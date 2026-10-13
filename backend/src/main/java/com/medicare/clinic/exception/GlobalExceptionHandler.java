package com.medicare.clinic.exception;

import org.springframework.dao.ConcurrencyFailureException;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> handleResponseStatusException(ResponseStatusException ex) {
        String msg = ex.getReason() != null ? ex.getReason() : "Yêu cầu không hợp lệ";
        return buildErrorResponse(HttpStatus.valueOf(ex.getStatusCode().value()), msg);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgumentException(IllegalArgumentException ex) {
        String msg = ex.getMessage() != null ? ex.getMessage() : "Dữ liệu không hợp lệ";
        return buildErrorResponse(HttpStatus.BAD_REQUEST, msg);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> handleIllegalStateException(IllegalStateException ex) {
        String msg = ex.getMessage() != null ? ex.getMessage() : "Xung đột dữ liệu";
        return buildErrorResponse(HttpStatus.CONFLICT, msg);
    }

    @ExceptionHandler(ConcurrencyFailureException.class)
    public ResponseEntity<Map<String, String>> handleConcurrencyFailureException(ConcurrencyFailureException ex) {
        return buildErrorResponse(HttpStatus.CONFLICT, "Khung giờ đang được đặt. Hãy tải lại và chọn giờ khác.");
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<Map<String, String>> handleDataAccessException(DataAccessException ex) {
        return buildErrorResponse(HttpStatus.SERVICE_UNAVAILABLE, "Không thể kết nối hoặc lưu cơ sở dữ liệu. Vui lòng thử lại.");
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        StringBuilder sb = new StringBuilder();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            if (sb.length() > 0) sb.append("; ");
            sb.append(error.getDefaultMessage());
        }
        String msg = sb.length() > 0 ? sb.toString() : "Dữ liệu nhập không hợp lệ";
        return buildErrorResponse(HttpStatus.BAD_REQUEST, msg);
    }

    private ResponseEntity<Map<String, String>> buildErrorResponse(HttpStatus status, String message) {
        Map<String, String> body = new HashMap<>();
        body.put("message", message);
        body.put("error", message);
        return ResponseEntity.status(status).body(body);
    }
}
