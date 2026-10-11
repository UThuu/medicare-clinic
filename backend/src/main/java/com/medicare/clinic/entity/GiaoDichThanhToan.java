package com.medicare.clinic.entity;
import com.medicare.clinic.entity.enums.PhuongThucThanhToan;
import com.medicare.clinic.entity.enums.TrangThaiXuLyThanhToan;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
@Entity
@Table(name = "giao_dich_thanh_toan")
@Data
public class GiaoDichThanhToan {
    @Id
    @Column(name = "id_giao_dich")
    private String idGiaoDich;
    
    @ManyToOne
    @JoinColumn(name = "id_thanh_toan", nullable = false)
    private ThanhToan thanhToan;
    
    @Column(name = "ma_giao_dich")
    private String maGiaoDich;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "phuong_thuc", nullable = false)
    private PhuongThucThanhToan phuongThuc;
    
    @Column(name = "so_tien", nullable = false)
    private BigDecimal soTien;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", nullable = false)
    private TrangThaiXuLyThanhToan trangThai;
    
    @Column(name = "thoi_gian", nullable = false)
    private LocalDateTime thoiGian;
    
    public void capNhatTrangThai(TrangThaiXuLyThanhToan trangThaiMoi) {
        if (this.trangThai != TrangThaiXuLyThanhToan.DANG_XU_LY) {
            throw new IllegalStateException("Chỉ cho phép cập nhật khi giao dịch đang xử lý");
        }
        if (trangThaiMoi != TrangThaiXuLyThanhToan.THANH_CONG && trangThaiMoi != TrangThaiXuLyThanhToan.THAT_BAI) {
            throw new IllegalArgumentException("Trạng thái mới không hợp lệ");
        }
        this.trangThai = trangThaiMoi;
    }
    
    public boolean isThanhCong() {
        return this.trangThai == TrangThaiXuLyThanhToan.THANH_CONG;
    }
}
