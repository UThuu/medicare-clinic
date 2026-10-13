package com.medicare.clinic.service.impl;

import com.medicare.clinic.dto.request.ChiTietDonThuocRequest;
import com.medicare.clinic.dto.request.DonThuocRequest;
import com.medicare.clinic.dto.response.CanhBaoDiUngResponse;
import com.medicare.clinic.dto.response.DonThuocResponse;
import com.medicare.clinic.entity.*;
import com.medicare.clinic.entity.enums.TrangThaiLuotKham;
import com.medicare.clinic.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DonThuocServiceTest {

    @Mock
    private DonThuocRepository donThuocRepository;

    @Mock
    private ChiTietDonThuocRepository chiTietDonThuocRepository;

    @Mock
    private ThuocRepository thuocRepository;

    @Mock
    private LuotKhamRepository luotKhamRepository;

    @Mock
    private BenhNhanDiUngRepository benhNhanDiUngRepository;

    @InjectMocks
    private DonThuocService donThuocService;

    private LuotKham luotKham;
    private BenhNhan benhNhan;
    private Thuoc thuocParacetamol;
    private Thuoc thuocAmoxicillin;
    private BenhNhanDiUng diUngPenicillin;

    @BeforeEach
    void setUp() {
        benhNhan = new BenhNhan();
        benhNhan.setIdBenhNhan("BN001");
        benhNhan.setHoTen("Nguyễn Văn A");
        benhNhan.setNgaySinh(LocalDate.of(1990, 1, 1));

        LichKham lichKham = new LichKham();
        lichKham.setBenhNhan(benhNhan);

        luotKham = new LuotKham();
        luotKham.setIdLuotKham("LK001");
        luotKham.setLichKham(lichKham);
        luotKham.setTrangThai(TrangThaiLuotKham.DANG_KHAM);
        luotKham.setChanDoan("Viêm họng cấp");

        thuocParacetamol = new Thuoc();
        thuocParacetamol.setIdThuoc("THUOC01");
        thuocParacetamol.setTenThuoc("Paracetamol 500mg");
        thuocParacetamol.setDonViTinh("Viên");
        thuocParacetamol.setDonGia(new BigDecimal("2000"));

        thuocAmoxicillin = new Thuoc();
        thuocAmoxicillin.setIdThuoc("THUOC02");
        thuocAmoxicillin.setTenThuoc("Amoxicillin 500mg");
        thuocAmoxicillin.setDonViTinh("Viên");
        thuocAmoxicillin.setDonGia(new BigDecimal("5000"));

        ThuocThanhPhan tp = new ThuocThanhPhan();
        ThuocThanhPhanId tpId = new ThuocThanhPhanId();
        tpId.setIdThuoc("THUOC02");
        tpId.setThanhPhan("Penicillin");
        tp.setId(tpId);
        tp.setThuoc(thuocAmoxicillin);
        thuocAmoxicillin.setThanhPhans(List.of(tp));

        diUngPenicillin = new BenhNhanDiUng();
        BenhNhanDiUngId duId = new BenhNhanDiUngId();
        duId.setIdBenhNhan("BN001");
        duId.setThanhPhan("Penicillin");
        diUngPenicillin.setId(duId);
        diUngPenicillin.setGhiChu("Nổi mề đay, khó thở");
    }

    @Test
    @DisplayName("UC13: Phát hiện cảnh báo dị ứng khi thuốc chứa thành phần Penicillin mà bệnh nhân bị dị ứng")
    void testKiemTraCanhBaoDiUng_PhatHienDiUng() {
        when(luotKhamRepository.findById("LK001")).thenReturn(Optional.of(luotKham));
        when(benhNhanDiUngRepository.findByBenhNhan_IdBenhNhan("BN001")).thenReturn(List.of(diUngPenicillin));
        when(thuocRepository.findById("THUOC02")).thenReturn(Optional.of(thuocAmoxicillin));

        List<CanhBaoDiUngResponse> result = donThuocService.kiemTraCanhBaoDiUng("LK001", List.of("THUOC02"));

        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
        assertTrue(result.get(0).isCoCanhBao());
        assertEquals("Penicillin", result.get(0).getThanhPhanTrung());
        assertEquals("THUOC02", result.get(0).getIdThuoc());
    }

    @Test
    @DisplayName("UC13: Cho phép kê thuốc dị ứng nếu bác sĩ đã nhập lý do tiếp tục kê")
    void testTaoDonThuoc_CoDiUng_NhungCoLyDoBoQua() {
        when(luotKhamRepository.findById("LK001")).thenReturn(Optional.of(luotKham));
        when(donThuocRepository.findByLuotKham_IdLuotKham("LK001")).thenReturn(Optional.empty());
        when(benhNhanDiUngRepository.findByBenhNhan_IdBenhNhan("BN001")).thenReturn(List.of(diUngPenicillin));
        when(thuocRepository.findById("THUOC02")).thenReturn(Optional.of(thuocAmoxicillin));
        when(donThuocRepository.save(any(DonThuoc.class))).thenAnswer(inv -> inv.getArgument(0));
        when(chiTietDonThuocRepository.save(any(ChiTietDonThuoc.class))).thenAnswer(inv -> inv.getArgument(0));

        ChiTietDonThuocRequest item = ChiTietDonThuocRequest.builder()
                .idThuoc("THUOC02")
                .soLuong(10)
                .lieuLuong("1 viên/lần")
                .huongDanSuDung("Sau ăn")
                .lyDoBoQuaCanhBao("Bệnh nhân cần điều trị cấp bách, đã test da âm tính")
                .build();

        DonThuocRequest req = DonThuocRequest.builder()
                .idLuotKham("LK001")
                .ghiChu("Uống đủ liều")
                .chiTietDonThuoc(List.of(item))
                .build();

        assertDoesNotThrow(() -> donThuocService.taoDonThuoc(req));
        verify(donThuocRepository).save(any(DonThuoc.class));
        verify(chiTietDonThuocRepository).save(any(ChiTietDonThuoc.class));
    }

    @Test
    @DisplayName("UC13: Từ chối tạo đơn nếu thuốc dị ứng nhưng thiếu lý do tiếp tục kê")
    void testTaoDonThuoc_CoDiUng_ThieuLyDoBoQua_BaoLoi() {
        when(luotKhamRepository.findById("LK001")).thenReturn(Optional.of(luotKham));
        when(donThuocRepository.findByLuotKham_IdLuotKham("LK001")).thenReturn(Optional.empty());
        when(benhNhanDiUngRepository.findByBenhNhan_IdBenhNhan("BN001")).thenReturn(List.of(diUngPenicillin));
        when(thuocRepository.findById("THUOC02")).thenReturn(Optional.of(thuocAmoxicillin));

        ChiTietDonThuocRequest item = ChiTietDonThuocRequest.builder()
                .idThuoc("THUOC02")
                .soLuong(10)
                .lieuLuong("1 viên/lần")
                .huongDanSuDung("Sau ăn")
                .lyDoBoQuaCanhBao(null) // Không có lý do
                .build();

        DonThuocRequest req = DonThuocRequest.builder()
                .idLuotKham("LK001")
                .chiTietDonThuoc(List.of(item))
                .build();

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> donThuocService.taoDonThuoc(req));
        assertTrue(ex.getMessage().contains("gây cảnh báo dị ứng"));
    }

    @Test
    @DisplayName("UC11: Tạo đơn thuốc thành công khi thuốc không gây dị ứng")
    void testTaoDonThuoc_KhongDiUng_ThanhCong() {
        when(luotKhamRepository.findById("LK001")).thenReturn(Optional.of(luotKham));
        when(donThuocRepository.findByLuotKham_IdLuotKham("LK001")).thenReturn(Optional.empty());
        when(benhNhanDiUngRepository.findByBenhNhan_IdBenhNhan("BN001")).thenReturn(List.of(diUngPenicillin));
        when(thuocRepository.findById("THUOC01")).thenReturn(Optional.of(thuocParacetamol));
        when(donThuocRepository.save(any(DonThuoc.class))).thenAnswer(inv -> inv.getArgument(0));
        when(chiTietDonThuocRepository.save(any(ChiTietDonThuoc.class))).thenAnswer(inv -> inv.getArgument(0));

        ChiTietDonThuocRequest item = ChiTietDonThuocRequest.builder()
                .idThuoc("THUOC01")
                .soLuong(20)
                .lieuLuong("1 viên/lần, ngày 2 lần")
                .huongDanSuDung("Sau ăn")
                .build();

        DonThuocRequest req = DonThuocRequest.builder()
                .idLuotKham("LK001")
                .ghiChu("Uống khi sốt")
                .chiTietDonThuoc(List.of(item))
                .build();

        assertDoesNotThrow(() -> donThuocService.taoDonThuoc(req));
        verify(donThuocRepository).save(any(DonThuoc.class));
        verify(chiTietDonThuocRepository).save(any(ChiTietDonThuoc.class));
    }

    @Test
    @DisplayName("UC12: Cập nhật đơn thuốc đã lưu độc lập")
    void testCapNhatDonThuoc_ThanhCong() {
        DonThuoc existingDt = new DonThuoc();
        existingDt.setId("DT-12345");
        existingDt.setLuotKham(luotKham);

        when(donThuocRepository.findById("DT-12345")).thenReturn(Optional.of(existingDt));
        when(luotKhamRepository.findById("LK001")).thenReturn(Optional.of(luotKham));
        when(benhNhanDiUngRepository.findByBenhNhan_IdBenhNhan("BN001")).thenReturn(Collections.emptyList());
        when(thuocRepository.findById("THUOC01")).thenReturn(Optional.of(thuocParacetamol));
        when(chiTietDonThuocRepository.save(any(ChiTietDonThuoc.class))).thenAnswer(inv -> inv.getArgument(0));

        ChiTietDonThuocRequest item = ChiTietDonThuocRequest.builder()
                .idThuoc("THUOC01")
                .soLuong(15)
                .lieuLuong("1 viên/lần")
                .huongDanSuDung("Sau ăn")
                .build();

        DonThuocRequest req = DonThuocRequest.builder()
                .idLuotKham("LK001")
                .ghiChu("Đã cập nhật số lượng")
                .chiTietDonThuoc(List.of(item))
                .build();

        assertDoesNotThrow(() -> donThuocService.capNhatDonThuoc("DT-12345", req));
        verify(chiTietDonThuocRepository).deleteByDonThuoc_Id("DT-12345");
        verify(donThuocRepository).save(existingDt);
    }

    @Test
    @DisplayName("Fix 404: Tìm lượt khám thành công khi truyền mã lịch khám idLichKham")
    void testLayThongTinKeDon_TimKiemTheoIdLichKham() {
        // Giả sử idLuotKham không tìm thấy trực tiếp bằng id, nhưng tìm thấy bằng idLichKham
        when(luotKhamRepository.findById("LICH-KHAM-123")).thenReturn(Optional.empty());
        when(luotKhamRepository.findByLichKham_IdLichKham("LICH-KHAM-123")).thenReturn(Optional.of(luotKham));
        when(benhNhanDiUngRepository.findByBenhNhan_IdBenhNhan("BN001")).thenReturn(Collections.emptyList());
        when(donThuocRepository.findByLuotKham_IdLuotKham("LK001")).thenReturn(Optional.empty());

        DonThuocResponse res = donThuocService.layThongTinKeDon("LICH-KHAM-123");

        assertNotNull(res);
        assertEquals("LK001", res.getIdLuotKham());
        assertEquals("BN001", res.getIdBenhNhan());
    }
}
