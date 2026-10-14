package com.medicare.clinic.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Request DTO cho tiếp nhận hoặc xác nhận bệnh nhân vào khám. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TiepNhanBenhNhanRequest {

    private String idBenhNhan;

    private String idLichKham;
}