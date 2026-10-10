package com.medicare.clinic.service;

import com.medicare.clinic.dto.request.ThanhToanQrRequest;
import com.medicare.clinic.dto.request.ThanhToanTienMatRequest;
import com.medicare.clinic.dto.request.XacNhanThanhToanRequest;
import com.medicare.clinic.dto.response.ChiPhiKhamPreviewResponse;
import com.medicare.clinic.dto.response.KetQuaThanhToanResponse;
import com.medicare.clinic.dto.response.ThanhToanTienMatResponse;
import com.medicare.clinic.dto.response.ThongTinQrResponse;
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

    // ==========================================
    // CÁC TEST CASES CHO UC-18 (THANH TOÁN TIỀN MẶT)
    // ==========================================

    @Test
    @DisplayName("UC-18: Thanh toán tiền mặt thành công khi khách đưa vừa đủ tiền")
    void testThanhToanTienMat_VuaDuTien_ThanhCong() {
        when(hoaDonRepository.findById("HD-001")).thenReturn(Optional.of(mockHoaDon));
        when(thanhToanRepository.findByHoaDon_Id("HD-001")).thenReturn(Optional.empty());
        when(thanhToanRepository.save(any(ThanhToan.class))).thenAnswer(i -> i.getArgument(0));
        when(giaoDichThanhToanRepository.save(any(GiaoDichThanhToan.class))).thenAnswer(i -> i.getArgument(0));

        ThanhToanTienMatRequest request = ThanhToanTienMatRequest.builder()
                .idHoaDon("HD-001")
                .tienKhachDua(BigDecimal.valueOf(200000)) // Khách đưa đúng 200k
                .ghiChu("Khách thanh toán tiền mặt đủ")
                .build();

        ThanhToanTienMatResponse response = thanhToanService.thanhToanTienMat(request);

        assertNotNull(response);
        assertEquals("HD-001", response.getIdHoaDon());
        assertEquals("TIEN_MAT", response.getPhuongThuc());
        assertEquals("THANH_CONG", response.getTrangThai());
        assertEquals(BigDecimal.valueOf(200000), response.getTongTien());
        assertEquals(BigDecimal.valueOf(200000), response.getTienKhachDua());
        assertEquals(BigDecimal.ZERO, response.getTienThoiLai());
        assertEquals("DA_THANH_TOAN", mockHoaDon.getTrangThai());
        assertEquals("HOAN_TAT", mockLuotKham.getTrangThai());
        verify(hoaDonRepository, times(1)).save(mockHoaDon);
        verify(giaoDichThanhToanRepository, times(1)).save(any(GiaoDichThanhToan.class));
    }

    @Test
    @DisplayName("UC-18: Thanh toán tiền mặt thành công và tính chính xác tiền thối lại khi khách đưa thừa")
    void testThanhToanTienMat_KhachDuaThua_TinhTienThoiChinhXac() {
        when(hoaDonRepository.findById("HD-001")).thenReturn(Optional.of(mockHoaDon));
        when(thanhToanRepository.findByHoaDon_Id("HD-001")).thenReturn(Optional.empty());
        when(thanhToanRepository.save(any(ThanhToan.class))).thenAnswer(i -> i.getArgument(0));
        when(giaoDichThanhToanRepository.save(any(GiaoDichThanhToan.class))).thenAnswer(i -> i.getArgument(0));

        ThanhToanTienMatRequest request = ThanhToanTienMatRequest.builder()
                .idHoaDon("HD-001")
                .tienKhachDua(BigDecimal.valueOf(500000)) // Hóa đơn 200k, khách đưa tờ 500k
                .build();

        ThanhToanTienMatResponse response = thanhToanService.thanhToanTienMat(request);

        assertNotNull(response);
        assertEquals(BigDecimal.valueOf(500000), response.getTienKhachDua());
        assertEquals(BigDecimal.valueOf(300000), response.getTienThoiLai());
        assertEquals("DA_THANH_TOAN", mockHoaDon.getTrangThai());
        assertTrue(response.getThongBao().contains("300000"));
    }

    @Test
    @DisplayName("UC-18 (E2): Báo lỗi khi tiền khách đưa nhỏ hơn tổng tiền hóa đơn")
    void testThanhToanTienMat_ThieuTien_BaoLoi() {
        when(hoaDonRepository.findById("HD-001")).thenReturn(Optional.of(mockHoaDon));

        ThanhToanTienMatRequest request = ThanhToanTienMatRequest.builder()
                .idHoaDon("HD-001")
                .tienKhachDua(BigDecimal.valueOf(150000)) // Hóa đơn 200k, khách đưa 150k
                .build();

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> thanhToanService.thanhToanTienMat(request));

        assertTrue(ex.getMessage().contains("không đủ"));
        assertTrue(ex.getMessage().contains("50000"));
        verify(giaoDichThanhToanRepository, never()).save(any());
    }

    @Test
    @DisplayName("UC-18: Báo lỗi khi tiền khách đưa là null")
    void testThanhToanTienMat_TienNull_BaoLoi() {
        when(hoaDonRepository.findById("HD-001")).thenReturn(Optional.of(mockHoaDon));

        ThanhToanTienMatRequest request = ThanhToanTienMatRequest.builder()
                .idHoaDon("HD-001")
                .tienKhachDua(null)
                .build();

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> thanhToanService.thanhToanTienMat(request));

        assertTrue(ex.getMessage().contains("Vui lòng nhập"));
        verify(giaoDichThanhToanRepository, never()).save(any());
    }

    @Test
    @DisplayName("UC-18 (E3): Báo lỗi nếu hóa đơn đã được thanh toán trước đó")
    void testThanhToanTienMat_DaThanhToan_BaoLoi() {
        mockHoaDon.setTrangThai("DA_THANH_TOAN");
        when(hoaDonRepository.findById("HD-001")).thenReturn(Optional.of(mockHoaDon));

        ThanhToanTienMatRequest request = ThanhToanTienMatRequest.builder()
                .idHoaDon("HD-001")
                .tienKhachDua(BigDecimal.valueOf(200000))
                .build();

        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> thanhToanService.thanhToanTienMat(request));

        assertTrue(ex.getMessage().contains("đã được thanh toán"));
        verify(giaoDichThanhToanRepository, never()).save(any());
    }

    // ==========================================
    // CÁC TEST CASES CHO UC-19 (THANH TOÁN QR / NGÂN HÀNG)
    // ==========================================

    @Test
    @DisplayName("UC-19: Lấy thông tin mã VietQR thành công với đúng STK, chủ TK và nội dung")
    void testLayThongTinQrThanhToan_ThanhCong() {
        when(hoaDonRepository.findById("HD-001")).thenReturn(Optional.of(mockHoaDon));

        ThongTinQrResponse qrResponse = thanhToanService.layThongTinQrThanhToan("HD-001");

        assertNotNull(qrResponse);
        assertEquals("HD-001", qrResponse.getIdHoaDon());
        assertEquals(BigDecimal.valueOf(200000), qrResponse.getSoTien());
        assertEquals("Vietcombank", qrResponse.getNganHang());
        assertEquals("1038034475", qrResponse.getSoTaiKhoan());
        assertEquals("NGUYEN MAI NHUT TAN", qrResponse.getTenChuTaiKhoan());
        assertEquals("MEDICARE HD-001", qrResponse.getNoiDung());
        assertTrue(qrResponse.getQrImageUrl().contains("vietcombank-1038034475"));
        assertTrue(qrResponse.getQrImageUrl().contains("200000"));
    }

    @Test
    @DisplayName("UC-19 (E3): Báo lỗi khi lấy mã QR cho hóa đơn đã thanh toán")
    void testLayThongTinQrThanhToan_DaThanhToan_BaoLoi() {
        mockHoaDon.setTrangThai("DA_THANH_TOAN");
        when(hoaDonRepository.findById("HD-001")).thenReturn(Optional.of(mockHoaDon));

        assertThrows(IllegalStateException.class, () -> thanhToanService.layThongTinQrThanhToan("HD-001"));
    }

    @Test
    @DisplayName("UC-19: Xác nhận thanh toán qua QR thành công cập nhật trạng thái hóa đơn")
    void testXacNhanThanhToanQr_ThanhCong() {
        when(hoaDonRepository.findById("HD-001")).thenReturn(Optional.of(mockHoaDon));
        when(thanhToanRepository.findByHoaDon_Id("HD-001")).thenReturn(Optional.empty());
        when(thanhToanRepository.save(any(ThanhToan.class))).thenAnswer(i -> i.getArgument(0));
        when(giaoDichThanhToanRepository.save(any(GiaoDichThanhToan.class))).thenAnswer(i -> i.getArgument(0));

        ThanhToanQrRequest request = ThanhToanQrRequest.builder()
                .idHoaDon("HD-001")
                .maGiaoDichNgoai("VCB-TEST-123")
                .ghiChu("Khách đã quét mã Vietcombank thành công")
                .build();

        KetQuaThanhToanResponse response = thanhToanService.xacNhanThanhToanQr(request);

        assertNotNull(response);
        assertEquals("HD-001", response.getIdHoaDon());
        assertEquals("VNPAY_QR", response.getPhuongThuc());
        assertEquals("THANH_CONG", response.getTrangThai());
        assertEquals("VCB-TEST-123", response.getMaGiaoDich());
        assertEquals("DA_THANH_TOAN", mockHoaDon.getTrangThai());
        assertEquals("HOAN_TAT", mockLuotKham.getTrangThai());
        verify(hoaDonRepository, times(1)).save(mockHoaDon);
        verify(giaoDichThanhToanRepository, times(1)).save(any(GiaoDichThanhToan.class));
    }

    @Test
    @DisplayName("UC-19 (E3): Chặn xác nhận thanh toán QR nếu hóa đơn đã được thanh toán")
    void testXacNhanThanhToanQr_DaThanhToan_BaoLoi() {
        mockHoaDon.setTrangThai("DA_THANH_TOAN");
        when(hoaDonRepository.findById("HD-001")).thenReturn(Optional.of(mockHoaDon));

        ThanhToanQrRequest request = ThanhToanQrRequest.builder()
                .idHoaDon("HD-001")
                .build();

        assertThrows(IllegalStateException.class, () -> thanhToanService.xacNhanThanhToanQr(request));
        verify(giaoDichThanhToanRepository, never()).save(any());
    }
}
