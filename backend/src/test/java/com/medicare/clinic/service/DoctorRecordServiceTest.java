package com.medicare.clinic.service;

import com.medicare.clinic.dto.record.MedicalRecordResponse;
import com.medicare.clinic.entity.*;
import com.medicare.clinic.entity.enums.TrangThaiLichKham;
import com.medicare.clinic.repository.*;
import com.medicare.clinic.service.impl.DoctorRecordServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.data.domain.PageRequest;

import java.util.Collections;
import java.util.Optional;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class DoctorRecordServiceTest {

    @Mock
    private LichKhamRepository lichKhamRepository;
    @Mock
    private SinhHieuRepository sinhHieuRepository;
    @Mock
    private LuotKhamRepository luotKhamRepository;
    @Mock
    private BenhNhanDiUngRepository benhNhanDiUngRepository;
    @Mock
    private DonThuocRepository donThuocRepository;

    @InjectMocks
    private DoctorRecordServiceImpl doctorRecordService;

    private LichKham mockLichKham;
    private BenhNhan mockBenhNhan;
    private BacSi mockBacSi;
    private NhanVien mockNhanVien;

    @BeforeEach
    void setUp() {
        mockBenhNhan = new BenhNhan();
        mockBenhNhan.setIdBenhNhan("BN001");
        mockBenhNhan.setHoTen("Nguyen Van A");

        mockNhanVien = new NhanVien();
        mockNhanVien.setMaNv("NV001");

        mockBacSi = new BacSi();
        mockBacSi.setMaNv("NV001");
        mockBacSi.setNhanVien(mockNhanVien);

        mockLichKham = new LichKham();
        mockLichKham.setIdLichKham("LK001");
        mockLichKham.setBenhNhan(mockBenhNhan);
        mockLichKham.setBacSi(mockBacSi);
        mockLichKham.setTrangThai(TrangThaiLichKham.DA_TIEP_NHAN);
    }

    @Test
    void getMedicalRecord_Success_NoVisit() {
        when(lichKhamRepository.findByIdWithDetails("LK001")).thenReturn(Optional.of(mockLichKham));
        when(benhNhanDiUngRepository.findByBenhNhan_IdBenhNhan("BN001")).thenReturn(Collections.emptyList());
        when(sinhHieuRepository.findLatestByBenhNhanId(eq("BN001"), any(PageRequest.class))).thenReturn(Collections.emptyList());
        when(luotKhamRepository.findHistoryByBenhNhanId("BN001", "LK001")).thenReturn(Collections.emptyList());

        MedicalRecordResponse res = doctorRecordService.getMedicalRecord("NV001", "LK001");
        
        assertThat(res).isNotNull();
        assertThat(res.getBenhNhan().getIdBenhNhan()).isEqualTo("BN001");
        assertThat(res.getLichKhamHienTai().getIdLichKham()).isEqualTo("LK001");
        assertThat(res.getLuotKhamHienTai()).isNull();
        assertThat(res.getSinhHieuHienTai()).isNull();
        assertThat(res.getSinhHieuMoiNhat()).isNull();
        assertThat(res.getDiUng()).isEmpty();
        assertThat(res.getLichSuKham()).isEmpty();
    }

    @Test
    void getMedicalRecord_NotFoundLichKham() {
        when(lichKhamRepository.findByIdWithDetails("LK001")).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, 
            () -> doctorRecordService.getMedicalRecord("NV001", "LK001"));
        assertThat(ex.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void getMedicalRecord_ForbiddenOtherDoctor() {
        when(lichKhamRepository.findByIdWithDetails("LK001")).thenReturn(Optional.of(mockLichKham));

        // Another doctor tries to access
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, 
            () -> doctorRecordService.getMedicalRecord("NV002", "LK001"));
        assertThat(ex.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }
}

