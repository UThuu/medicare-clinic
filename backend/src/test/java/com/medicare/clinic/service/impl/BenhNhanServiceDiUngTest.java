package com.medicare.clinic.service.impl;

import com.medicare.clinic.dto.response.MedicalRecordResponse;
import com.medicare.clinic.entity.BenhNhan;
import com.medicare.clinic.entity.BenhNhanDiUng;
import com.medicare.clinic.entity.BenhNhanDiUngId;
import com.medicare.clinic.repository.BenhNhanDiUngRepository;
import com.medicare.clinic.repository.BenhNhanRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BenhNhanServiceDiUngTest {

    @Mock
    private BenhNhanRepository benhNhanRepository;

    @Mock
    private BenhNhanDiUngRepository benhNhanDiUngRepository;

    @InjectMocks
    private BenhNhanService benhNhanService;

    private BenhNhan mockBenhNhan;

    @BeforeEach
    void setUp() {
        mockBenhNhan = new BenhNhan();
        mockBenhNhan.setIdBenhNhan("BN001");
        mockBenhNhan.setHoTen("Nguyễn Văn A");
    }

    @Test
    void themHoacCapNhatDiUng_ThemMoiThanhCong() {
        when(benhNhanRepository.findById("BN001")).thenReturn(Optional.of(mockBenhNhan));

        BenhNhanDiUng diUng = new BenhNhanDiUng();
        BenhNhanDiUngId id = new BenhNhanDiUngId();
        id.setIdBenhNhan("BN001");
        id.setThanhPhan("Penicillin");
        diUng.setId(id);
        diUng.setGhiChu("Nổi mề đay");

        when(benhNhanDiUngRepository.findById(any())).thenReturn(Optional.empty());
        when(benhNhanDiUngRepository.findByBenhNhan_IdBenhNhan("BN001")).thenReturn(List.of(diUng));

        List<MedicalRecordResponse.AllergyInfo> ketQua = benhNhanService.themHoacCapNhatDiUng("BN001", "Penicillin", "Nổi mề đay");

        assertThat(ketQua).hasSize(1);
        assertThat(ketQua.get(0).getThanhPhan()).isEqualTo("Penicillin");
        assertThat(ketQua.get(0).getGhiChu()).isEqualTo("Nổi mề đay");
        verify(benhNhanDiUngRepository, times(1)).save(any());
    }

    @Test
    void xoaDiUng_ThanhCong() {
        when(benhNhanDiUngRepository.existsById(any())).thenReturn(true);
        when(benhNhanDiUngRepository.findByBenhNhan_IdBenhNhan("BN001")).thenReturn(Collections.emptyList());

        List<MedicalRecordResponse.AllergyInfo> ketQua = benhNhanService.xoaDiUng("BN001", "Penicillin");

        assertThat(ketQua).isEmpty();
        verify(benhNhanDiUngRepository, times(1)).deleteById(any());
    }

    @Test
    void themDiUng_BenhNhanKhongTonTai_Throw404() {
        when(benhNhanRepository.findById("BN999")).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () ->
                benhNhanService.themHoacCapNhatDiUng("BN999", "Aspirin", "Khó thở"));
    }

    @Test
    void themDiUng_ThanhPhanRong_ThrowIllegalArgument() {
        assertThrows(IllegalArgumentException.class, () ->
                benhNhanService.themHoacCapNhatDiUng("BN001", "   ", "Khó thở"));
    }
}
