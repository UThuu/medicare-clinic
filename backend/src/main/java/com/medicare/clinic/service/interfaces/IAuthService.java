package com.medicare.clinic.service.interfaces;

import com.medicare.clinic.entity.TaiKhoan;
import com.medicare.clinic.dto.auth.LoginResponse;

public interface IAuthService {
    TaiKhoan xacThucTaiKhoan(String tenDangNhap, String matKhau);
    String xacDinhVaiTro(TaiKhoan taiKhoan);
    LoginResponse dangNhap(String tenDangNhap, String matKhau);
}
