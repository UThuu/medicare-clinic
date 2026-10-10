package com.medicare.clinic.service.impl;

import com.medicare.clinic.dto.khambenh.SaveKhamBenhRequest;
import com.medicare.clinic.entity.*;
import com.medicare.clinic.entity.enums.TrangThaiLuotKham;
import com.medicare.clinic.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class KhamBenhServiceTest {
    @Mock private LichKhamRepository lichKhamRepository;
    @Mock private LuotKhamRepository luotKhamRepository;
    @Mock private SinhHieuRepository sinhHieuRepository;
    @InjectMocks private KhamBenhService service;
    private SaveKhamBenhRequest request;
    private LichKham schedule;
    private LuotKham visit;
    private SinhHieu vitals;

    @BeforeEach
    void setUp() {
        request = new SaveKhamBenhRequest();
        request.setIdLichKham("LICH1");
        request.setTrieuChung(" Đau đầu ");
        request.setKetQuaKham(" Bình thường ");
        request.setChanDoan(" Cảm cúm ");
        BacSi doctor = new BacSi();
        doctor.setMaNv("BS001");
        visit = new LuotKham();
        visit.setIdLuotKham("LUOT1");
        visit.setTrangThai(TrangThaiLuotKham.DANG_KHAM);
        schedule = new LichKham();
        schedule.setBacSi(doctor);
        schedule.setLuotKham(visit);
        vitals = new SinhHieu();
        vitals.setLuotKham(visit);
        vitals.setHuyetApTamThu(120);
        vitals.setHuyetApTamTruong(80);
        vitals.setCanNang(new BigDecimal("60"));
        vitals.setNhietDo(new BigDecimal("36.5"));
    }

    private void stubVisit() {
        when(lichKhamRepository.findById("LICH1")).thenReturn(Optional.of(schedule));
    }
    private void stubVitals() {
        stubVisit();
        when(sinhHieuRepository.findByLuotKham_IdLuotKham("LUOT1")).thenReturn(Optional.of(vitals));
    }

    @Test
    void startTransitionsWaitingVisitAndPreservesSavedResults() {
        visit.setTrangThai(TrangThaiLuotKham.CHO_KHAM);
        visit.setChanDoan("Đã lưu");
        stubVitals();
        service.startKhamBenh("BS001", "LICH1");
        assertEquals(TrangThaiLuotKham.DANG_KHAM, visit.getTrangThai());
        assertEquals("Đã lưu", visit.getChanDoan());
        verify(luotKhamRepository).save(visit);
    }

    @Test
    void startIsIdempotentForInProgressVisit() {
        stubVitals();
        service.startKhamBenh("BS001", "LICH1");
        assertEquals(TrangThaiLuotKham.DANG_KHAM, visit.getTrangThai());
        verify(luotKhamRepository, never()).save(any());
    }

    @Test
    void startRejectsMissingCurrentVitalsWithoutChangingStatus() {
        visit.setTrangThai(TrangThaiLuotKham.CHO_KHAM);
        stubVisit();
        assertThrows(IllegalArgumentException.class, () -> service.startKhamBenh("BS001", "LICH1"));
        assertEquals(TrangThaiLuotKham.CHO_KHAM, visit.getTrangThai());
        verify(sinhHieuRepository).findByLuotKham_IdLuotKham("LUOT1");
        verify(luotKhamRepository, never()).save(any());
    }

    @Test
    void startRejectsIncompleteCurrentVitals() {
        vitals.setNhietDo(null);
        stubVitals();
        assertThrows(IllegalArgumentException.class, () -> service.startKhamBenh("BS001", "LICH1"));
        verify(luotKhamRepository, never()).save(any());
    }

    @Test
    void startRejectsWrongDoctor() {
        stubVisit();
        assertThrows(IllegalArgumentException.class, () -> service.startKhamBenh("BS002", "LICH1"));
        verifyNoInteractions(sinhHieuRepository, luotKhamRepository);
    }

    @Test
    void startRejectsCompletedVisit() {
        visit.setTrangThai(TrangThaiLuotKham.HOAN_TAT);
        stubVisit();
        assertThrows(IllegalArgumentException.class, () -> service.startKhamBenh("BS001", "LICH1"));
        verifyNoInteractions(sinhHieuRepository, luotKhamRepository);
    }

    @Test
    void startRejectsMissingVisit() {
        schedule.setLuotKham(null);
        stubVisit();
        assertThrows(IllegalArgumentException.class, () -> service.startKhamBenh("BS001", "LICH1"));
        verifyNoInteractions(sinhHieuRepository, luotKhamRepository);
    }

    @Test
    void saveKeepsInProgressAndAllowsUpdatingResults() {
        stubVitals();
        service.saveKhamBenh("BS001", request);
        assertEquals("Đau đầu", visit.getTrieuChung());
        assertEquals("Bình thường", visit.getKetQuaKham());
        assertEquals("Cảm cúm", visit.getChanDoan());
        assertEquals(TrangThaiLuotKham.DANG_KHAM, visit.getTrangThai());
        request.setChanDoan("Chẩn đoán mới");
        service.saveKhamBenh("BS001", request);
        assertEquals("Chẩn đoán mới", visit.getChanDoan());
        assertEquals(TrangThaiLuotKham.DANG_KHAM, visit.getTrangThai());
        verify(luotKhamRepository, times(2)).save(visit);
    }

    @Test
    void saveRejectsWaitingVisitEvenWithVitals() {
        visit.setTrangThai(TrangThaiLuotKham.CHO_KHAM);
        stubVitals();
        assertThrows(IllegalArgumentException.class, () -> service.saveKhamBenh("BS001", request));
        assertEquals(TrangThaiLuotKham.CHO_KHAM, visit.getTrangThai());
        verify(luotKhamRepository, never()).save(any());
    }

    @Test
    void saveRejectsMissingVitalsAndKeepsExistingResults() {
        visit.setChanDoan("Đã lưu");
        stubVisit();
        assertThrows(IllegalArgumentException.class, () -> service.saveKhamBenh("BS001", request));
        assertEquals("Đã lưu", visit.getChanDoan());
        verify(luotKhamRepository, never()).save(any());
    }

    @Test
    void saveRejectsWrongDoctor() {
        stubVisit();
        assertThrows(IllegalArgumentException.class, () -> service.saveKhamBenh("BS002", request));
        verify(luotKhamRepository, never()).save(any());
    }

    @Test
    void saveRejectsCompletedVisit() {
        visit.setTrangThai(TrangThaiLuotKham.HOAN_TAT);
        stubVisit();
        assertThrows(IllegalArgumentException.class, () -> service.saveKhamBenh("BS001", request));
        verify(luotKhamRepository, never()).save(any());
    }

    @Test
    void saveRejectsBlankFields() {
        request.setChanDoan("  ");
        assertThrows(IllegalArgumentException.class, () -> service.saveKhamBenh("BS001", request));
        verifyNoInteractions(lichKhamRepository, sinhHieuRepository, luotKhamRepository);
    }
}
