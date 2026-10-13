package com.medicare.clinic.service.impl;

import com.medicare.clinic.dto.response.HoSoYTeCaNhanResponse;
import com.medicare.clinic.entity.*;
import com.medicare.clinic.entity.enums.GioiTinh;
import com.medicare.clinic.entity.enums.TrangThaiLuotKham;
import com.medicare.clinic.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HoSoYTeCaNhanServiceTest {

    @Mock
    private BenhNhanRepository benhNhanRepository;

    @Mock
    private LichKhamRepository lichKhamRepository;

    @Mock
    private LuotKhamRepository luotKhamRepository;

    @Mock
    private BenhNhanDiUngRepository benhNhanDiUngRepository;

    @Mock
    private SinhHieuRepository sinhHieuRepository;

    @Mock
    private DonThuocRepository donThuocRepository;

    private BenhNhanService benhNhanService;

    @BeforeEach
    void setUp() {
        benhNhanService = new BenhNhanService(
                benhNhanRepository,
                lichKhamRepository,
                luotKhamRepository,
                benhNhanDiUngRepository,
                sinhHieuRepository,
                donThuocRepository
        );
    }

    @Test
    void layHoSoYTeCaNhan_ThanhCong_DayDuThongTinVaDonThuoc() {
        String idBenhNhan = "BN001";

        BenhNhan patient = new BenhNhan();
        patient.setIdBenhNhan(idBenhNhan);
        patient.setHoTen("Nguyễn Văn An");
        patient.setNgaySinh(LocalDate.of(1985, 5, 20));
        patient.setGioiTinh(GioiTinh.NAM);
        patient.setSoDienThoai("0912345678");
        patient.setDiaChi("123 Đường ABC, Q1, TP.HCM");

        when(benhNhanRepository.findById(idBenhNhan)).thenReturn(Optional.of(patient));

        // Dị ứng
        BenhNhanDiUng diUng = new BenhNhanDiUng();
        BenhNhanDiUngId diUngId = new BenhNhanDiUngId();
        diUngId.setThanhPhan("Aspirin");
        diUng.setId(diUngId);
        diUng.setGhiChu("Nổi mề đay, khó thở");
        when(benhNhanDiUngRepository.findByBenhNhan_IdBenhNhan(idBenhNhan)).thenReturn(List.of(diUng));

        // Sinh hiệu
        SinhHieu sh = new SinhHieu();
        sh.setHuyetApTamThu(120);
        sh.setHuyetApTamTruong(80);
        sh.setCanNang(new BigDecimal("65.5"));
        sh.setNhietDo(new BigDecimal("36.8"));
        sh.setThoiDiemDo(LocalDateTime.of(2026, 10, 10, 8, 30));
        when(sinhHieuRepository.findLatestByBenhNhanId(eq(idBenhNhan), any(Pageable.class)))
                .thenReturn(List.of(sh));

        // Lượt khám hoàn tất (REQ-014)
        LuotKham visit = new LuotKham();
        visit.setIdLuotKham("LK001");
        visit.setTrangThai(TrangThaiLuotKham.HOAN_TAT);
        visit.setLyDoKham("Đau đầu, sốt nhẹ");
        visit.setTrieuChung("Sốt 38 độ, mệt mỏi");
        visit.setChanDoan("Viêm họng cấp");
        visit.setKetQuaKham("Nghỉ ngơi, uống thuốc theo đơn");

        LichKham lk = new LichKham();
        lk.setIdLichKham("APPT001");
        lk.setNgayKham(LocalDate.of(2026, 10, 10));
        lk.setGioKham(LocalTime.of(9, 0));

        BacSi bs = new BacSi();
        bs.setMaNv("BS01");
        bs.setChuyenKhoa("Nội tổng quát");
        NhanVien nv = new NhanVien();
        nv.setHoTen("BS. Trần Minh");
        bs.setNhanVien(nv);
        lk.setBacSi(bs);
        visit.setLichKham(lk);

        when(luotKhamRepository.findAllByBenhNhanId(idBenhNhan)).thenReturn(List.of(visit));

        // Đơn thuốc
        DonThuoc dt = new DonThuoc();
        dt.setId("DT001");
        dt.setLuotKham(visit);
        dt.setNgayKe(LocalDate.of(2026, 10, 10));
        dt.setGhiChu("Uống nhiều nước ấm, tái khám sau 3 ngày");

        ChiTietDonThuoc ct = new ChiTietDonThuoc();
        ct.setSoLuong(10);
        ct.setLieuLuong("Ngày 2 lần, mỗi lần 1 viên");
        ct.setHuongDanSuDung("Uống sau khi ăn no");
        ct.setDonGia(new BigDecimal("5000"));

        Thuoc thuoc = new Thuoc();
        thuoc.setIdThuoc("THUOC01");
        thuoc.setTenThuoc("Paracetamol 500mg");
        thuoc.setDonViTinh("Viên");
        ct.setThuoc(thuoc);

        dt.setChiTietDonThuocs(List.of(ct));

        when(donThuocRepository.findWithDetailsByLuotKham_IdLuotKhamIn(List.of("LK001")))
                .thenReturn(List.of(dt));

        // Thực thi
        HoSoYTeCaNhanResponse res = benhNhanService.layHoSoYTeCaNhan(idBenhNhan);

        // Kiểm tra
        assertNotNull(res);
        assertEquals("BN001", res.getBenhNhan().getIdBenhNhan());
        assertEquals("Nguyễn Văn An", res.getBenhNhan().getHoTen());
        assertEquals(1, res.getDiUng().size());
        assertEquals("Aspirin", res.getDiUng().get(0).getThanhPhan());

        assertEquals(1, res.getLichSuKham().size());
        HoSoYTeCaNhanResponse.LichSuKhamDTO exam = res.getLichSuKham().get(0);
        assertEquals("Viêm họng cấp", exam.getChanDoan());
        assertEquals("BS. Trần Minh", exam.getTenBacSi());
        assertEquals(TrangThaiLuotKham.HOAN_TAT, exam.getTrangThai());

        // Kiểm tra đơn thuốc (REQ-014)
        assertNotNull(exam.getDonThuoc());
        assertEquals("DT001", exam.getDonThuoc().getIdDonThuoc());
        assertEquals(1, exam.getDonThuoc().getChiTiet().size());
        assertEquals("Paracetamol 500mg", exam.getDonThuoc().getChiTiet().get(0).getTenThuoc());
        assertEquals(10, exam.getDonThuoc().getChiTiet().get(0).getSoLuong());
    }

    @Test
    void layHoSoYTeCaNhan_ChuaHoanTatKham_KhongHienThiDonThuoc_REQ014() {
        String idBenhNhan = "BN002";

        BenhNhan patient = new BenhNhan();
        patient.setIdBenhNhan(idBenhNhan);
        patient.setHoTen("Lê Văn B");
        when(benhNhanRepository.findById(idBenhNhan)).thenReturn(Optional.of(patient));

        LuotKham visit = new LuotKham();
        visit.setIdLuotKham("LK002");
        visit.setTrangThai(TrangThaiLuotKham.DANG_KHAM); // Chưa hoàn tất khám
        when(luotKhamRepository.findAllByBenhNhanId(idBenhNhan)).thenReturn(List.of(visit));

        HoSoYTeCaNhanResponse res = benhNhanService.layHoSoYTeCaNhan(idBenhNhan);

        assertNotNull(res);
        assertEquals(1, res.getLichSuKham().size());
        // Theo REQ-014: chưa hoàn tất khám thì đơn thuốc chưa được gắn chính thức
        assertNull(res.getLichSuKham().get(0).getDonThuoc());
    }

    @Test
    void layHoSoYTeCaNhan_IdNullHoacRong_BaoLoi() {
        assertThrows(IllegalArgumentException.class, () -> benhNhanService.layHoSoYTeCaNhan(null));
        assertThrows(IllegalArgumentException.class, () -> benhNhanService.layHoSoYTeCaNhan("   "));
    }
}
