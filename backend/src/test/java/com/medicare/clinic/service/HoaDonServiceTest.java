package com.medicare.clinic.service;

import com.medicare.clinic.dto.request.TaoHoaDonRequest;
import com.medicare.clinic.dto.response.ChiPhiKhamPreviewResponse;
import com.medicare.clinic.dto.response.HoaDonResponse;
import com.medicare.clinic.entity.*;
import com.medicare.clinic.repository.DonThuocRepository;
import com.medicare.clinic.repository.HoaDonRepository;
import com.medicare.clinic.repository.LuotKhamRepository;
import com.medicare.clinic.repository.ThuNganRepository;
import com.medicare.clinic.service.impl.HoaDonService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class HoaDonServiceTest {

    @Mock
    private HoaDonRepository hoaDonRepository;

    @Mock
    private LuotKhamRepository luotKhamRepository;

    @Mock
    private DonThuocRepository donThuocRepository;

    @Mock
    private ThuNganRepository thuNganRepository;

    @InjectMocks
    private HoaDonService hoaDonService;

    private LuotKham sampleLuotKham;
    private DonThuoc sampleDonThuoc;
    private ThuNgan sampleThuNgan;

    @BeforeEach
    void setUp() {
        BenhNhan bn = new BenhNhan("BN-001", "Trần Thị Bảy", LocalDate.of(1956, 3, 15), "Nữ", "0903123456", "TP.HCM");
        BacSi bs = new BacSi();
        bs.setMaNv("BS-001");
        bs.setHoTen("BS. Nguyễn Anh Minh");
        bs.setChuyenKhoa("Nội Tổng quát");

        LichKham lk = new LichKham("LICH-001", bn, bs, LocalDate.now(), LocalTime.of(8, 30), "DA_TIEP_NHAN", "TRUC_TUYEN");

        sampleLuotKham = new LuotKham();
        sampleLuotKham.setIdLuotKham("LK-001");
        sampleLuotKham.setLichKham(lk);
        sampleLuotKham.setTrangThai("CHO_THANH_TOAN");
        sampleLuotKham.setChanDoan("Tăng huyết áp độ 1");

        Thuoc t1 = new Thuoc("THUOC-01", "Panadol Extra", "Vỉ", BigDecimal.valueOf(25000));
        sampleDonThuoc = new DonThuoc();
        sampleDonThuoc.setIdDonThuoc("DT-001");
        sampleDonThuoc.setLuotKham(sampleLuotKham);
        sampleDonThuoc.setChiTietDonThuocs(new ArrayList<>());

        ChiTietDonThuoc ct = new ChiTietDonThuoc("CT-001", sampleDonThuoc, t1, 2, "1 viên/lần", "Sáng, chiều", BigDecimal.valueOf(25000), null);
        sampleDonThuoc.getChiTietDonThuocs().add(ct);

        sampleThuNgan = new ThuNgan();
        sampleThuNgan.setMaNv("TN-001");
        sampleThuNgan.setHoTen("Nguyễn Thị Thu Ngân");
    }

    @Test
    @DisplayName("UC-16: Xem trước chi phí và tính đúng tổng tiền (Phí khám + Tiền thuốc)")
    void testLayChiPhiDuKien() {
        when(luotKhamRepository.findById("LK-001")).thenReturn(Optional.of(sampleLuotKham));
        when(hoaDonRepository.findByLuotKham_IdLuotKham("LK-001")).thenReturn(Optional.empty());
        when(donThuocRepository.findByLuotKham_IdLuotKham("LK-001")).thenReturn(Optional.of(sampleDonThuoc));

        ChiPhiKhamPreviewResponse res = hoaDonService.layChiPhiDuKien("LK-001");

        assertNotNull(res);
        assertEquals("LK-001", res.getIdLuotKham());
        assertEquals("Trần Thị Bảy", res.getTenBenhNhan());
        assertEquals(BigDecimal.valueOf(150000), res.getPhiKham());
        assertEquals(BigDecimal.valueOf(50000), res.getTienThuoc()); // 2 vỉ * 25.000 = 50.000
        assertEquals(BigDecimal.valueOf(200000), res.getTongTien()); // 150.000 + 50.000 = 200.000
        assertEquals(2, res.getDanhSachKhoanThu().size()); // 1 dòng khám + 1 dòng thuốc
    }

    @Test
    @DisplayName("UC-15: Tạo hóa đơn thành công và lưu trạng thái CHUA_THANH_TOAN")
    void testTaoHoaDonThanhCong() {
        TaoHoaDonRequest req = new TaoHoaDonRequest("LK-001", "TN-001", null, null);

        when(luotKhamRepository.findById("LK-001")).thenReturn(Optional.of(sampleLuotKham));
        when(hoaDonRepository.existsByLuotKham_IdLuotKham("LK-001")).thenReturn(false);
        when(thuNganRepository.findById("TN-001")).thenReturn(Optional.of(sampleThuNgan));
        when(donThuocRepository.findByLuotKham_IdLuotKham("LK-001")).thenReturn(Optional.of(sampleDonThuoc));
        when(hoaDonRepository.save(any(HoaDon.class))).thenAnswer(invocation -> invocation.getArgument(0));

        HoaDonResponse res = hoaDonService.taoHoaDon(req);

        assertNotNull(res);
        assertNotNull(res.getIdHoaDon());
        assertTrue(res.getIdHoaDon().startsWith("HD-"));
        assertEquals("CHUA_THANH_TOAN", res.getTrangThai());
        assertEquals(BigDecimal.valueOf(200000), res.getTongTien());
        assertEquals("Nguyễn Thị Thu Ngân", res.getThuNganLap());
        verify(hoaDonRepository, times(1)).save(any(HoaDon.class));
    }

    @Test
    @DisplayName("UC-15 Exception: Chặn tạo trùng lặp khi lượt khám đã có hóa đơn")
    void testTaoHoaDon_DaCoHoaDon_NemLoi() {
        TaoHoaDonRequest req = new TaoHoaDonRequest("LK-001", "TN-001", null, null);

        when(luotKhamRepository.findById("LK-001")).thenReturn(Optional.of(sampleLuotKham));
        when(hoaDonRepository.existsByLuotKham_IdLuotKham("LK-001")).thenReturn(true);

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> {
            hoaDonService.taoHoaDon(req);
        });

        assertTrue(ex.getMessage().contains("đã được lập hóa đơn trước đó"));
        verify(hoaDonRepository, never()).save(any(HoaDon.class));
    }
}
