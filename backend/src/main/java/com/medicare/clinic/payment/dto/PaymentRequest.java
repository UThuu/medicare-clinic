package com.medicare.clinic.payment.dto;

import lombok.Data;
import lombok.Builder;
import java.math.BigDecimal;

@Data
@Builder
public class PaymentRequest {
    private String orderId;
    private BigDecimal amount;
    private String orderInfo;
    private String returnUrl;
}
