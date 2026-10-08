package com.medicare.clinic.service.impl;

import com.medicare.clinic.service.interfaces.IAuthService;
import com.medicare.clinic.entity.TaiKhoan;
import com.medicare.clinic.entity.enums.TrangThaiTaiKhoan;
import com.medicare.clinic.repository.TaiKhoanRepository;
import com.medicare.clinic.dto.auth.LoginResponse;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class AuthService implements IAuthService {
    
    private final TaiKhoanRepository taiKhoanRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(TaiKhoanRepository taiKhoanRepository) {
        this.taiKhoanRepository = taiKhoanRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    @Override
    public TaiKhoan xacThucTaiKhoan(String tenDangNhap, String matKhau) {
        if (tenDangNhap == null || tenDangNhap.isEmpty() || matKhau == null || matKhau.isEmpty()) {
            throw new IllegalArgumentException("Thông tin đăng nhập không hợp lệ hoặc tài khoản không hoạt động.");
        }

        Optional<TaiKhoan> optionalTaiKhoan = taiKhoanRepository.findByTenDangNhap(tenDangNhap);
        if (optionalTaiKhoan.isEmpty()) {
            throw new IllegalArgumentException("Thông tin đăng nhập không hợp lệ hoặc tài khoản không hoạt động.");
        }

        TaiKhoan taiKhoan = optionalTaiKhoan.get();
        if (taiKhoan.getTrangThai() != TrangThaiTaiKhoan.HOAT_DONG) {
            throw new IllegalArgumentException("Thông tin đăng nhập không hợp lệ hoặc tài khoản không hoạt động.");
        }

        if (!passwordEncoder.matches(matKhau, taiKhoan.getMatKhauHash())) {
            throw new IllegalArgumentException("Thông tin đăng nhập không hợp lệ hoặc tài khoản không hoạt động.");
        }

        return taiKhoan;
    }

    @Override
    public String xacDinhVaiTro(TaiKhoan taiKhoan) {
        if (taiKhoan == null) {
            throw new IllegalArgumentException("Dữ liệu tài khoản không hợp lệ.");
        }
        
        boolean isBenhNhan = taiKhoan.getBenhNhan() != null;
        boolean isNhanVien = taiKhoan.getNhanVien() != null;

        if (!isBenhNhan && !isNhanVien) {
            throw new IllegalArgumentException("Tài khoản không liên kết với chủ sở hữu nào.");
        }
        
        if (isBenhNhan && isNhanVien) {
            throw new IllegalArgumentException("Tài khoản không được liên kết đồng thời nhân viên và bệnh nhân.");
        }

        if (isBenhNhan) {
            return "BENH_NHAN";
        }

        String maNv = taiKhoan.getNhanVien().getMaNv();
        java.util.List<String> roles = taiKhoanRepository.findVaiTroByMaNv(maNv);

        if (roles == null || roles.isEmpty()) {
            throw new IllegalArgumentException("Nhân viên không thuộc phòng ban/vai trò nào.");
        }
        
        if (roles.size() > 1) {
            throw new IllegalArgumentException("Nhân viên xuất hiện trong nhiều bảng vai trò. Tạm từ chối xác định vai trò.");
        }

        return roles.get(0);
    }

    @Override
    @Transactional(readOnly = true)
    public LoginResponse dangNhap(String tenDangNhap, String matKhau) {
        TaiKhoan taiKhoan = xacThucTaiKhoan(tenDangNhap, matKhau);
        String vaiTro = xacDinhVaiTro(taiKhoan);

        LoginResponse response = new LoginResponse();
        response.setIdTaiKhoan(taiKhoan.getIdTaiKhoan());
        response.setTenDangNhap(taiKhoan.getTenDangNhap());
        response.setVaiTro(vaiTro);

        if ("BENH_NHAN".equals(vaiTro)) {
            response.setHoTen(taiKhoan.getBenhNhan().getHoTen());
            response.setIdBenhNhan(taiKhoan.getBenhNhan().getIdBenhNhan());
            response.setMaNv(null);
        } else {
            response.setHoTen(taiKhoan.getNhanVien().getHoTen());
            response.setMaNv(taiKhoan.getNhanVien().getMaNv());
            response.setIdBenhNhan(null);
        }

        return response;
    }
}
