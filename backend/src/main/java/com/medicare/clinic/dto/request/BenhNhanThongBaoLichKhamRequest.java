package com.medicare.clinic.dto.request;

import lombok.Data;

/**
 * Request for UC25 - dynamically build appointment notifications for the logged-in patient.
 * No patient ID is accepted from the client; the service resolves it from the authenticated account.
 */
@Data
public class BenhNhanThongBaoLichKhamRequest {
    // Intentionally no fields for the current UC25 scope.
}
