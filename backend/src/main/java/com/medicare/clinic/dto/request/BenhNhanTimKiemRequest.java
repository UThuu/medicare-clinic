package com.medicare.clinic.dto.request;

import lombok.Data;

import java.time.LocalDate;

/** Request for UC28. Search by phone OR by full name plus date of birth. */
@Data
public class BenhNhanTimKiemRequest {

    private String soDienThoai;
    private String hoTen;
    private LocalDate ngaySinh;
}
