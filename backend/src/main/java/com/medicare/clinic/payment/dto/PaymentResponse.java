package com.medicare.clinic.payment.dto;

import lombok.Data;
import lombok.Builder;

@Data
@Builder
public class PaymentResponse {
    private String paymentUrl;
    private String transactionId;
    private String status;
    private String message;
}
