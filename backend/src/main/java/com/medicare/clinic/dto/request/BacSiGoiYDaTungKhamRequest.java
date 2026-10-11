package com.medicare.clinic.dto.request;

import lombok.Data;

/**
 * Request for UC24 - suggest doctors the authenticated patient has visited before.
 * The patient identity should be resolved from the authenticated session on the server.
 */
@Data
public class BacSiGoiYDaTungKhamRequest {

    /** Optional result limit; null means the service's default limit. */
    private Integer soLuongToiDa;
}
