package com.medicare.clinic.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String idTaiKhoan;
    private String tenDangNhap;
    private String hoTen;
    private String vaiTro;
    private String maNv;
    private String idBenhNhan;
}
