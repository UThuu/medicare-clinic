package com.medicare.clinic.service.impl;

import com.medicare.clinic.entity.TaiKhoan;
import com.medicare.clinic.entity.enums.TrangThaiTaiKhoan;
import com.medicare.clinic.repository.TaiKhoanRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private TaiKhoanRepository taiKhoanRepository;

    @InjectMocks
    private AuthService authService;

    private TaiKhoan mockTaiKhoan;
    private final String rawPassword = "password123";
    private final String expectedErrorMessage = "Thông tin đăng nhập không hợp lệ hoặc tài khoản không hoạt động.";
    private BCryptPasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();
        mockTaiKhoan = new TaiKhoan();
        mockTaiKhoan.setIdTaiKhoan("TK001");
        mockTaiKhoan.setTenDangNhap("user123");
        mockTaiKhoan.setMatKhauHash(passwordEncoder.encode(rawPassword));
        mockTaiKhoan.setTrangThai(TrangThaiTaiKhoan.HOAT_DONG);
    }

    @Test
    void printHash() {
        System.out.println("HASH_GEN: " + passwordEncoder.encode("Medicare@123"));
    }

    @Test
    void xacThucTaiKhoan_ThongTinDung_TaiKhoanHoatDong_ThanhCong() {
        when(taiKhoanRepository.findByTenDangNhap("user123")).thenReturn(Optional.of(mockTaiKhoan));
        
        TaiKhoan result = authService.xacThucTaiKhoan("user123", rawPassword);
        
        assertNotNull(result);
        assertEquals("user123", result.getTenDangNhap());
    }

    @Test
    void xacThucTaiKhoan_KhongTimThayTaiKhoan_BiTuChoi() {
        when(taiKhoanRepository.findByTenDangNhap("unknown_user")).thenReturn(Optional.empty());
        
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            authService.xacThucTaiKhoan("unknown_user", rawPassword);
        });
        
        assertEquals(expectedErrorMessage, exception.getMessage());
    }

    @Test
    void xacThucTaiKhoan_SaiMatKhau_BiTuChoi() {
        when(taiKhoanRepository.findByTenDangNhap("user123")).thenReturn(Optional.of(mockTaiKhoan));
        
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            authService.xacThucTaiKhoan("user123", "wrong_password");
        });
        
        assertEquals(expectedErrorMessage, exception.getMessage());
    }

    @Test
    void xacThucTaiKhoan_TaiKhoanKhoa_BiTuChoi() {
        mockTaiKhoan.setTrangThai(TrangThaiTaiKhoan.KHOA);
        when(taiKhoanRepository.findByTenDangNhap("user123")).thenReturn(Optional.of(mockTaiKhoan));
        
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            authService.xacThucTaiKhoan("user123", rawPassword);
        });
        
        assertEquals(expectedErrorMessage, exception.getMessage());
    }

    @Test
    void xacThucTaiKhoan_DauVaoThieu_BiTuChoi() {
        IllegalArgumentException exception1 = assertThrows(IllegalArgumentException.class, () -> {
            authService.xacThucTaiKhoan(null, rawPassword);
        });
        assertEquals(expectedErrorMessage, exception1.getMessage());

        IllegalArgumentException exception2 = assertThrows(IllegalArgumentException.class, () -> {
            authService.xacThucTaiKhoan("", rawPassword);
        });
        assertEquals(expectedErrorMessage, exception2.getMessage());
        
        IllegalArgumentException exception3 = assertThrows(IllegalArgumentException.class, () -> {
            authService.xacThucTaiKhoan("user123", null);
        });
        assertEquals(expectedErrorMessage, exception3.getMessage());

        IllegalArgumentException exception4 = assertThrows(IllegalArgumentException.class, () -> {
            authService.xacThucTaiKhoan("user123", "");
        });
        assertEquals(expectedErrorMessage, exception4.getMessage());
    }
    
    @Test
    void xacThucTaiKhoan_HashKhongHopLe_BiTuChoi() {
        mockTaiKhoan.setMatKhauHash("invalid_hash_string");
        when(taiKhoanRepository.findByTenDangNhap("user123")).thenReturn(Optional.of(mockTaiKhoan));
        
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            authService.xacThucTaiKhoan("user123", rawPassword);
        });
        
        assertEquals(expectedErrorMessage, exception.getMessage());
    }

    // --- Tests for xacDinhVaiTro ---
    
    @Test
    void xacDinhVaiTro_TaiKhoanNull_ThrowsException() {
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            authService.xacDinhVaiTro(null);
        });
        assertEquals("Dữ liệu tài khoản không hợp lệ.", exception.getMessage());
    }

    @Test
    void xacDinhVaiTro_KhongLienKet_ThrowsException() {
        TaiKhoan tk = new TaiKhoan();
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            authService.xacDinhVaiTro(tk);
        });
        assertEquals("Tài khoản không liên kết với chủ sở hữu nào.", exception.getMessage());
    }

    @Test
    void xacDinhVaiTro_LienKetCaHai_ThrowsException() {
        TaiKhoan tk = new TaiKhoan();
        tk.setBenhNhan(new com.medicare.clinic.entity.BenhNhan());
        tk.setNhanVien(new com.medicare.clinic.entity.NhanVien());
        
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            authService.xacDinhVaiTro(tk);
        });
        assertEquals("Tài khoản không được liên kết đồng thời nhân viên và bệnh nhân.", exception.getMessage());
    }

    @Test
    void xacDinhVaiTro_BenhNhan_Success() {
        TaiKhoan tk = new TaiKhoan();
        tk.setBenhNhan(new com.medicare.clinic.entity.BenhNhan());
        
        String role = authService.xacDinhVaiTro(tk);
        assertEquals("BENH_NHAN", role);
    }

    @Test
    void xacDinhVaiTro_NhanVien_BacSi_Success() {
        TaiKhoan tk = new TaiKhoan();
        com.medicare.clinic.entity.NhanVien nv = new com.medicare.clinic.entity.NhanVien();
        nv.setMaNv("NV001");
        tk.setNhanVien(nv);
        
        when(taiKhoanRepository.findVaiTroByMaNv("NV001")).thenReturn(java.util.Collections.singletonList("BAC_SI"));
        
        String role = authService.xacDinhVaiTro(tk);
        assertEquals("BAC_SI", role);
    }
    
    @Test
    void xacDinhVaiTro_NhanVien_DieuDuong_Success() {
        TaiKhoan tk = new TaiKhoan();
        com.medicare.clinic.entity.NhanVien nv = new com.medicare.clinic.entity.NhanVien();
        nv.setMaNv("NV002");
        tk.setNhanVien(nv);
        
        when(taiKhoanRepository.findVaiTroByMaNv("NV002")).thenReturn(java.util.Collections.singletonList("DIEU_DUONG"));
        
        String role = authService.xacDinhVaiTro(tk);
        assertEquals("DIEU_DUONG", role);
    }
    
    @Test
    void xacDinhVaiTro_NhanVien_LeTan_Success() {
        TaiKhoan tk = new TaiKhoan();
        com.medicare.clinic.entity.NhanVien nv = new com.medicare.clinic.entity.NhanVien();
        nv.setMaNv("NV003");
        tk.setNhanVien(nv);
        
        when(taiKhoanRepository.findVaiTroByMaNv("NV003")).thenReturn(java.util.Collections.singletonList("LE_TAN"));
        
        String role = authService.xacDinhVaiTro(tk);
        assertEquals("LE_TAN", role);
    }
    
    @Test
    void xacDinhVaiTro_NhanVien_ThuNgan_Success() {
        TaiKhoan tk = new TaiKhoan();
        com.medicare.clinic.entity.NhanVien nv = new com.medicare.clinic.entity.NhanVien();
        nv.setMaNv("NV004");
        tk.setNhanVien(nv);
        
        when(taiKhoanRepository.findVaiTroByMaNv("NV004")).thenReturn(java.util.Collections.singletonList("THU_NGAN"));
        
        String role = authService.xacDinhVaiTro(tk);
        assertEquals("THU_NGAN", role);
    }

    @Test
    void xacDinhVaiTro_NhanVien_KhongVaiTro_ThrowsException() {
        TaiKhoan tk = new TaiKhoan();
        com.medicare.clinic.entity.NhanVien nv = new com.medicare.clinic.entity.NhanVien();
        nv.setMaNv("NV005");
        tk.setNhanVien(nv);
        
        when(taiKhoanRepository.findVaiTroByMaNv("NV005")).thenReturn(java.util.Collections.emptyList());
        
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            authService.xacDinhVaiTro(tk);
        });
        assertEquals("Nhân viên không thuộc phòng ban/vai trò nào.", exception.getMessage());
    }

    @Test
    void xacDinhVaiTro_NhanVien_NhieuVaiTro_ThrowsException() {
        TaiKhoan tk = new TaiKhoan();
        com.medicare.clinic.entity.NhanVien nv = new com.medicare.clinic.entity.NhanVien();
        nv.setMaNv("NV006");
        tk.setNhanVien(nv);
        
        when(taiKhoanRepository.findVaiTroByMaNv("NV006")).thenReturn(java.util.Arrays.asList("BAC_SI", "DIEU_DUONG"));
        
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            authService.xacDinhVaiTro(tk);
        });
        assertEquals("Nhân viên xuất hiện trong nhiều bảng vai trò. Tạm từ chối xác định vai trò.", exception.getMessage());
    }

    // --- Tests for dangNhap ---
    
    @Test
    void dangNhap_BenhNhan_HopLe_ThanhCong() {
        com.medicare.clinic.entity.BenhNhan bn = new com.medicare.clinic.entity.BenhNhan();
        bn.setIdBenhNhan("BN001");
        bn.setHoTen("Nguyen Van A");
        mockTaiKhoan.setBenhNhan(bn);
        
        when(taiKhoanRepository.findByTenDangNhap("user123")).thenReturn(Optional.of(mockTaiKhoan));
        
        com.medicare.clinic.dto.auth.LoginResponse response = authService.dangNhap("user123", rawPassword);
        
        assertNotNull(response);
        assertEquals("TK001", response.getIdTaiKhoan());
        assertEquals("user123", response.getTenDangNhap());
        assertEquals("Nguyen Van A", response.getHoTen());
        assertEquals("BENH_NHAN", response.getVaiTro());
        assertEquals("BN001", response.getIdBenhNhan());
        assertNull(response.getMaNv());
    }

    @Test
    void dangNhap_NhanVien_HopLe_ThanhCong() {
        com.medicare.clinic.entity.NhanVien nv = new com.medicare.clinic.entity.NhanVien();
        nv.setMaNv("NV001");
        nv.setHoTen("Tran Thi B");
        mockTaiKhoan.setNhanVien(nv);
        
        when(taiKhoanRepository.findByTenDangNhap("user123")).thenReturn(Optional.of(mockTaiKhoan));
        when(taiKhoanRepository.findVaiTroByMaNv("NV001")).thenReturn(java.util.Collections.singletonList("BAC_SI"));
        
        com.medicare.clinic.dto.auth.LoginResponse response = authService.dangNhap("user123", rawPassword);
        
        assertNotNull(response);
        assertEquals("TK001", response.getIdTaiKhoan());
        assertEquals("user123", response.getTenDangNhap());
        assertEquals("Tran Thi B", response.getHoTen());
        assertEquals("BAC_SI", response.getVaiTro());
        assertEquals("NV001", response.getMaNv());
        assertNull(response.getIdBenhNhan());
    }

    @Test
    void dangNhap_XacThucThatBai_NgoaiLe() {
        when(taiKhoanRepository.findByTenDangNhap("wrong_user")).thenReturn(Optional.empty());
        
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            authService.dangNhap("wrong_user", rawPassword);
        });
        
        assertEquals(expectedErrorMessage, exception.getMessage());
        verify(taiKhoanRepository, never()).findVaiTroByMaNv(anyString());
    }

    @Test
    void dangNhap_NhanVienKhongCoVaiTro_NgoaiLe() {
        com.medicare.clinic.entity.NhanVien nv = new com.medicare.clinic.entity.NhanVien();
        nv.setMaNv("NV001");
        mockTaiKhoan.setNhanVien(nv);
        
        when(taiKhoanRepository.findByTenDangNhap("user123")).thenReturn(Optional.of(mockTaiKhoan));
        when(taiKhoanRepository.findVaiTroByMaNv("NV001")).thenReturn(java.util.Collections.emptyList());
        
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            authService.dangNhap("user123", rawPassword);
        });
        
        assertEquals("Nhân viên không thuộc phòng ban/vai trò nào.", exception.getMessage());
    }
}
