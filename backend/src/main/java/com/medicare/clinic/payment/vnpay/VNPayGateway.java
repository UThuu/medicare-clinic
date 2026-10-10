package com.medicare.clinic.payment.vnpay;

import com.medicare.clinic.payment.PaymentGateway;
import com.medicare.clinic.payment.dto.PaymentRequest;
import com.medicare.clinic.payment.dto.PaymentResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class VNPayGateway implements PaymentGateway {

    private final VNPayConfig vnPayConfig;

    @Override
    public PaymentResponse createPaymentRequest(PaymentRequest request) {
        try {
            String vnp_Version = "2.1.0";
            String vnp_Command = "pay";
            String vnp_TxnRef = request.getOrderId() + "_" + System.currentTimeMillis();
            String vnp_IpAddr = "127.0.0.1";
            String vnp_TmnCode = vnPayConfig.getTmnCode();

            long amount = request.getAmount().multiply(new java.math.BigDecimal(100)).longValue();

            Map<String, String> vnp_Params = new HashMap<>();
            vnp_Params.put("vnp_Version", vnp_Version);
            vnp_Params.put("vnp_Command", vnp_Command);
            vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
            vnp_Params.put("vnp_Amount", String.valueOf(amount));
            vnp_Params.put("vnp_CurrCode", "VND");
            vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
            vnp_Params.put("vnp_OrderInfo", request.getOrderInfo() != null ? request.getOrderInfo() : "Thanh toan vien phi Medicare");
            vnp_Params.put("vnp_OrderType", "other");
            vnp_Params.put("vnp_Locale", "vn");
            vnp_Params.put("vnp_ReturnUrl", request.getReturnUrl() != null && !request.getReturnUrl().isEmpty() 
                    ? request.getReturnUrl() : vnPayConfig.getReturnUrl());
            vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

            Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
            SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
            String vnp_CreateDate = formatter.format(cld.getTime());
            vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

            cld.add(Calendar.MINUTE, 15);
            String vnp_ExpireDate = formatter.format(cld.getTime());
            vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

            List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
            Collections.sort(fieldNames);
            StringBuilder hashData = new StringBuilder();
            StringBuilder query = new StringBuilder();
            Iterator<String> itr = fieldNames.iterator();
            while (itr.hasNext()) {
                String fieldName = itr.next();
                String fieldValue = vnp_Params.get(fieldName);
                if ((fieldValue != null) && (fieldValue.length() > 0)) {
                    // Build hash data
                    hashData.append(fieldName);
                    hashData.append('=');
                    hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                    // Build query
                    query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()));
                    query.append('=');
                    query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                    if (itr.hasNext()) {
                        query.append('&');
                        hashData.append('&');
                    }
                }
            }

            String queryUrl = query.toString();
            String vnp_SecureHash = VNPayConfig.hmacSHA512(vnPayConfig.getHashSecret(), hashData.toString());
            queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
            String paymentUrl = vnPayConfig.getPayUrl() + "?" + queryUrl;

            log.info("Khởi tạo VNPay Payment URL thành công cho Order: {}, TxnRef: {}", request.getOrderId(), vnp_TxnRef);

            return PaymentResponse.builder()
                    .paymentUrl(paymentUrl)
                    .transactionId(vnp_TxnRef)
                    .status("SUCCESS")
                    .message("Khởi tạo liên kết thanh toán VNPay thành công")
                    .build();
        } catch (Exception e) {
            log.error("Lỗi khi tạo liên kết thanh toán VNPay: ", e);
            return PaymentResponse.builder()
                    .status("FAILED")
                    .message("Lỗi tạo thanh toán VNPay: " + e.getMessage())
                    .build();
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    public boolean verifyPaymentResult(Object callbackData) {
        if (!(callbackData instanceof Map)) {
            return false;
        }
        Map<String, String> fields = (Map<String, String>) callbackData;
        String vnp_SecureHash = fields.get("vnp_SecureHash");
        if (vnp_SecureHash == null || vnp_SecureHash.trim().isEmpty()) {
            return false;
        }

        Map<String, String> hashParams = new HashMap<>(fields);
        hashParams.remove("vnp_SecureHash");
        hashParams.remove("vnp_SecureHashType");

        String calculatedHash = VNPayConfig.hashAllFields(hashParams, vnPayConfig.getHashSecret());
        boolean isValid = calculatedHash.equalsIgnoreCase(vnp_SecureHash);
        log.info("Xác thực chữ ký VNPay: kết quả={}, calculatedHash={}, receivedHash={}",
                isValid, calculatedHash, vnp_SecureHash);
        return isValid;
    }
}
