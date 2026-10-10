package com.medicare.clinic.service;

import com.medicare.clinic.dto.request.XacNhanThanhToanRequest;
import com.medicare.clinic.dto.response.ChiPhiKhamPreviewResponse;
import com.medicare.clinic.dto.response.KetQuaThanhToanResponse;
import com.medicare.clinic.dto.response.ThongTinThanhToanResponse;
import com.medicare.clinic.entity.*;
import com.medicare.clinic.repository.*;
import com.medicare.clinic.service.impl.ThanhToanService;
import com.medicare.clinic.service.interfaces.IHoaDonService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ThanhToanServiceTest {

    @Mock
    private HoaDonRepository hoaDonRepository;

    @Mock
    private ThanhToanRepository thanhToanRepository;

    @Mock
    private GiaoDichThanhToanRepository giaoDichThanhToanRepository;

    @Mock
    private LuotKhamRepository luotKhamRepository;

    @Mock
    private IHoaDonService hoaDonService;

    @InjectMocks
    private ThanhToanService thanhToanService;

    private HoaDon mockHoaDon;
    private LuotKham mockLuotKham;

    @BeforeEach
    void setUp() {
        BenhNhan bn = new BenhNhan("BN-001", "Trần Thị Bảy", LocalDate.of(1956, 3, 15), "Nữ", "0903123456", "123 Lê Lợi");
        BacSi bs = new BacSi("Nội Tổng quát", "CKI");
        bs.setMaNv("BS-001");
        bs.setHoTen("BS. Nguyễn Anh Minh");

        LichKham lk = new LichKham("LICH-001", bn, bs, LocalDate.now(), LocalTime.of(8, 30), "DA_TIEP_NHAN", "TRUC_TUYEN");

        mockLuotKham = new LuotKham();
        mockLuotKham.setIdLuotKham("LK-001");
        mockLuotKham.setLichKham(lk);
        mockLuotKham.setTrangThai("CHO_THANH_TOAN");

        ThuNgan tn = new ThuNgan();
        tn.setMaNv("TN-001");
        tn.setHoTen("Nguyễn Thị Thu Ngân");

        mockHoaDon = new HoaDon();
        mockHoaDon.setId("HD-001");
        mockHoaDon.setLuotKham(mockLuotKham);
        mockHoaDon.setThuNgan(tn);
        mockHoaDon.setNgayTao(LocalDateTime.now());
        mockHoaDon.setPhiKham(BigDecimal.valueOf(150000));
        mockHoaDon.setTienThuoc(BigDecimal.valueOf(50000));
        mockHoaDon.setTongTien(BigDecimal.valueOf(200000));
        mockHoaDon.setTrangThai("CHUA_THANH_TOAN");
    }

    @Test
    @DisplayName("UC-17: Lấy thông tin thanh toán của hóa đơn thành công")
    void testLayThongTinThanhToan_ThanhCong() {
        when(hoaDonRepository.findById("HD-001")).thenReturn(Optional.of(mockHoaDon));
        when(thanhToanRepository.findByHoaDon_Id("HD-001")).thenReturn(Optional.empty());
        when(giaoDichThanhToanRepository.findByThanhToan_HoaDon_IdOrderByThoiGianDesc("HD-001")).thenReturn(new ArrayList<>());
        when(hoaDonService.layChiPhiDuKien("LK-001")).thenReturn(ChiPhiKhamPreviewResponse.builder()
                .danhSachKhoanThu(new ArrayList<>())
                .build());

        ThongTinThanhToanResponse response = thanhToanService.layThongTinThanhToan("HD-001");

        assertNotNull(response);
        assertEquals("HD-001", response.getIdHoaDon());
        assertEquals("Trần Thị Bảy", response.getTenBenhNhan());
        assertEquals(BigDecimal.valueOf(200000), response.getTongTien());
        assertEquals("CHUA_THANH_TOAN", response.getTrangThaiHoaDon());
    }

    @Test
    @DisplayName("UC-17: Xác nhận thanh toán thành công chuyển trạng thái hóa đơn sang DA_THANH_TOAN")
    void testXacNhanThanhToan_ThanhCong() {
        when(hoaDonRepository.findById("HD-001")).thenReturn(Optional.of(mockHoaDon));
        when(thanhToanRepository.findByHoaDon_Id("HD-001")).thenReturn(Optional.empty());
        when(thanhToanRepository.save(any(ThanhToan.class))).thenAnswer(i -> i.getArgument(0));
        when(giaoDichThanhToanRepository.save(any(GiaoDichThanhToan.class))).thenAnswer(i -> i.getArgument(0));

        XacNhanThanhToanRequest request = XacNhanThanhToanRequest.builder()
                .idHoaDon("HD-001")
                .phuongThuc("TIEN_MAT")
                .soTien(BigDecimal.valueOf(200000))
                .build();

        KetQuaThanhToanResponse result = thanhToanService.xacNhanThanhToan(request);

        assertNotNull(result);
        assertEquals("THANH_CONG", result.getTrangThai());
        assertEquals("DA_THANH_TOAN", mockHoaDon.getTrangThai());
        assertEquals("HOAN_TAT", mockLuotKham.getTrangThai());
        verify(giaoDichThanhToanRepository, times(1)).save(any(GiaoDichThanhToan.class));
        verify(hoaDonRepository, times(1)).save(mockHoaDon);
    }

    @Test
    @DisplayName("UC-17: Chặn thanh toán lại nếu hóa đơn đã được thanh toán hoàn tất")
    void testXacNhanThanhToan_DaThanhToan_BaoLoi() {
        mockHoaDon.setTrangThai("DA_THANH_TOAN");
        when(hoaDonRepository.findById("HD-001")).thenReturn(Optional.of(mockHoaDon));

        XacNhanThanhToanRequest request = XacNhanThanhToanRequest.builder()
                .idHoaDon("HD-001")
                .phuongThuc("TIEN_MAT")
                .soTien(BigDecimal.valueOf(200000))
                .build();

        assertThrows(IllegalStateException.class, () -> thanhToanService.xacNhanThanhToan(request));
        verify(giaoDichThanhToanRepository, never()).save(any());
    }

    @Test
    @DisplayName("UC-17: Báo lỗi nếu số tiền thanh toán nhỏ hơn tổng tiền hóa đơn")
    void testXacNhanThanhToan_ThieuTien_BaoLoi() {
        when(hoaDonRepository.findById("HD-001")).thenReturn(Optional.of(mockHoaDon));

        XacNhanThanhToanRequest request = XacNhanThanhToanRequest.builder()
                .idHoaDon("HD-001")
                .phuongThuc("TIEN_MAT")
                .soTien(BigDecimal.valueOf(100000)) // Hóa đơn 200.000 mà trả 100.000
                .build();

        assertThrows(IllegalArgumentException.class, () -> thanhToanService.xacNhanThanhToan(request));
        verify(giaoDichThanhToanRepository, never()).save(any());
    }
}
