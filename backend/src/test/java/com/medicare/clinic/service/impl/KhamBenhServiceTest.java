package com.medicare.clinic.service.impl;

import com.medicare.clinic.dto.khambenh.SaveKhamBenhRequest;
import com.medicare.clinic.entity.BacSi;
import com.medicare.clinic.entity.LichKham;
import com.medicare.clinic.entity.LuotKham;
import com.medicare.clinic.entity.enums.TrangThaiLuotKham;
import com.medicare.clinic.repository.LichKhamRepository;
import com.medicare.clinic.repository.LuotKhamRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class KhamBenhServiceTest {

    @Mock
    private LichKhamRepository lichKhamRepository;

    @Mock
    private LuotKhamRepository luotKhamRepository;

    @InjectMocks
    private KhamBenhService khamBenhService;

    private SaveKhamBenhRequest validRequest;
    private LichKham lichKham;
    private LuotKham luotKham;
    private BacSi bacSi;

    @BeforeEach
    void setUp() {
        validRequest = new SaveKhamBenhRequest();
        validRequest.setIdLichKham("lich-kham-1");
        validRequest.setTrieuChung("Đau đầu");
        validRequest.setKetQuaKham("Bình thường");
        validRequest.setChanDoan("Cảm cúm");

        bacSi = new BacSi();
        bacSi.setMaNv("BS001");

        luotKham = new LuotKham();
        luotKham.setIdLuotKham("luot-kham-1");
        luotKham.setTrangThai(TrangThaiLuotKham.DANG_KHAM);

        lichKham = new LichKham();
        lichKham.setIdLichKham("lich-kham-1");
        lichKham.setBacSi(bacSi);
        lichKham.setLuotKham(luotKham);
    }

    @Test
    void saveKhamBenh_success() {
        when(lichKhamRepository.findById("lich-kham-1")).thenReturn(Optional.of(lichKham));
        when(luotKhamRepository.save(any(LuotKham.class))).thenReturn(luotKham);

        khamBenhService.saveKhamBenh("BS001", validRequest);

        verify(luotKhamRepository, times(1)).save(luotKham);
    }

    @Test
    void saveKhamBenh_wrongDoctor() {
        when(lichKhamRepository.findById("lich-kham-1")).thenReturn(Optional.of(lichKham));

        assertThrows(IllegalArgumentException.class, () -> khamBenhService.saveKhamBenh("BS002", validRequest));
        verify(luotKhamRepository, never()).save(any());
    }

    @Test
    void saveKhamBenh_alreadyHoanTat() {
        luotKham.setTrangThai(TrangThaiLuotKham.HOAN_TAT);
        when(lichKhamRepository.findById("lich-kham-1")).thenReturn(Optional.of(lichKham));

        assertThrows(IllegalArgumentException.class, () -> khamBenhService.saveKhamBenh("BS001", validRequest));
        verify(luotKhamRepository, never()).save(any());
    }
}
