package com.medicare.clinic.payment;

import com.medicare.clinic.payment.dto.PaymentRequest;
import com.medicare.clinic.payment.dto.PaymentResponse;

public interface PaymentGateway {
    PaymentResponse createPaymentRequest(PaymentRequest request);
    boolean verifyPaymentResult(Object callbackData);
}
