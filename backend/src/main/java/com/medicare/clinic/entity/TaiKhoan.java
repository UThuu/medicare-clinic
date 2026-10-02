package com.medicare.clinic.entity;
import com.medicare.clinic.entity.enums.TrangThaiTaiKhoan;
import jakarta.persistence.*;
import lombok.Data;
@Entity
@Table(name = "tai_khoan")
@Data
public class TaiKhoan {
    @Id
    @Column(name = "id_tai_khoan")
    private String idTaiKhoan;
    
    @OneToOne
    @JoinColumn(name = "id_nhan_vien")
    private NhanVien nhanVien;
    
    @OneToOne
    @JoinColumn(name = "id_benh_nhan")
    private BenhNhan benhNhan;
    
    @Column(name = "ten_dang_nhap", nullable = false)
    private String tenDangNhap;
    
    @Column(name = "mat_khau_hash", nullable = false)
    private String matKhauHash;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", nullable = false)
    private TrangThaiTaiKhoan trangThai;
}
