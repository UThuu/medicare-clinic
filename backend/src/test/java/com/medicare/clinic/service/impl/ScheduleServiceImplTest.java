package com.medicare.clinic.service.impl;

import com.medicare.clinic.dto.response.DoctorScheduleResponse;
import com.medicare.clinic.entity.BenhNhan;
import com.medicare.clinic.entity.LichKham;
import com.medicare.clinic.entity.LuotKham;
import com.medicare.clinic.entity.enums.GioiTinh;
import com.medicare.clinic.entity.enums.PhuongThucDatLich;
import com.medicare.clinic.entity.enums.TrangThaiLichKham;
import com.medicare.clinic.entity.enums.TrangThaiLuotKham;
import com.medicare.clinic.repository.LichKhamRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ScheduleServiceImplTest {

    @Mock
    private LichKhamRepository lichKhamRepository;

    @InjectMocks
    private ScheduleServiceImpl scheduleService;

    private LocalDate testDate;
    private String doctorId;
    private LichKham lichKhamNoLuotKham;
    private LichKham lichKhamWithLuotKham;

    @BeforeEach
    void setUp() {
        testDate = LocalDate.of(2026, 10, 8);
        doctorId = "NV001";

        BenhNhan bn1 = new BenhNhan();
        bn1.setIdBenhNhan("BN001");
        bn1.setHoTen("Nguyen Van A");
        bn1.setGioiTinh(GioiTinh.NAM);
        bn1.setNgaySinh(LocalDate.of(1990, 1, 1));
        bn1.setSoDienThoai("0901234567");

        BenhNhan bn2 = new BenhNhan();
        bn2.setIdBenhNhan("BN002");
        bn2.setHoTen("Tran Thi B");
        bn2.setGioiTinh(GioiTinh.NU);
        bn2.setNgaySinh(LocalDate.of(1995, 5, 5));
        bn2.setSoDienThoai("0909876543");

        lichKhamNoLuotKham = new LichKham();
        lichKhamNoLuotKham.setIdLichKham("LK001");
        lichKhamNoLuotKham.setNgayKham(testDate);
        lichKhamNoLuotKham.setGioKham(LocalTime.of(8, 0));
        lichKhamNoLuotKham.setTrangThai(TrangThaiLichKham.DA_DAT);
        lichKhamNoLuotKham.setPhuongThucDatLich(PhuongThucDatLich.TRUC_TUYEN);
        lichKhamNoLuotKham.setBenhNhan(bn1);

        LuotKham luotKham = new LuotKham();
        luotKham.setIdLuotKham("LUK001");
        luotKham.setTrangThai(TrangThaiLuotKham.CHO_KHAM);

        lichKhamWithLuotKham = new LichKham();
        lichKhamWithLuotKham.setIdLichKham("LK002");
        lichKhamWithLuotKham.setNgayKham(testDate);
        lichKhamWithLuotKham.setGioKham(LocalTime.of(9, 0));
        lichKhamWithLuotKham.setTrangThai(TrangThaiLichKham.DA_TIEP_NHAN);
        lichKhamWithLuotKham.setPhuongThucDatLich(PhuongThucDatLich.TRUC_TIEP);
        lichKhamWithLuotKham.setBenhNhan(bn2);
        lichKhamWithLuotKham.setLuotKham(luotKham);
    }

    @Test
    void getDoctorSchedule_WithInvalidParams_ThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> scheduleService.getDoctorSchedule(null, testDate));
        assertThrows(IllegalArgumentException.class, () -> scheduleService.getDoctorSchedule("", testDate));
        assertThrows(IllegalArgumentException.class, () -> scheduleService.getDoctorSchedule("  ", testDate));
        assertThrows(IllegalArgumentException.class, () -> scheduleService.getDoctorSchedule(doctorId, null));
        verify(lichKhamRepository, never()).findScheduleByDoctorAndDate(anyString(), any());
    }

    @Test
    void getDoctorSchedule_WhenNoSchedule_ReturnsEmptyList() {
        when(lichKhamRepository.findScheduleByDoctorAndDate(doctorId, testDate))
                .thenReturn(Collections.emptyList());

        List<DoctorScheduleResponse> result = scheduleService.getDoctorSchedule(doctorId, testDate);

        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(lichKhamRepository, times(1)).findScheduleByDoctorAndDate(doctorId, testDate);
    }

    @Test
    void getDoctorSchedule_WithSchedules_ReturnsMappedList() {
        when(lichKhamRepository.findScheduleByDoctorAndDate(doctorId, testDate))
                .thenReturn(Arrays.asList(lichKhamNoLuotKham, lichKhamWithLuotKham));

        List<DoctorScheduleResponse> result = scheduleService.getDoctorSchedule(doctorId, testDate);

        assertNotNull(result);
        assertEquals(2, result.size());

        // Kịch bản 1: Lịch khám chưa có lượt khám
        DoctorScheduleResponse res1 = result.get(0);
        assertEquals("LK001", res1.getIdLichKham());
        assertEquals(LocalTime.of(8, 0), res1.getGioKham());
        assertEquals(TrangThaiLichKham.DA_DAT, res1.getTrangThaiLichKham());
        assertEquals("BN001", res1.getIdBenhNhan());
        assertEquals("Nguyen Van A", res1.getTenBenhNhan());
        assertNull(res1.getIdLuotKham());
        assertNull(res1.getTrangThaiLuotKham());

        // Kịch bản 2: Lịch khám đã có lượt khám
        DoctorScheduleResponse res2 = result.get(1);
        assertEquals("LK002", res2.getIdLichKham());
        assertEquals(TrangThaiLichKham.DA_TIEP_NHAN, res2.getTrangThaiLichKham());
        assertEquals("BN002", res2.getIdBenhNhan());
        assertEquals("Tran Thi B", res2.getTenBenhNhan());
        assertEquals("LUK001", res2.getIdLuotKham());
        assertEquals(TrangThaiLuotKham.CHO_KHAM, res2.getTrangThaiLuotKham());
    }
}
