package com.medicare.clinic.service.interfaces;

import com.medicare.clinic.dto.khambenh.SaveKhamBenhRequest;

public interface IKhamBenhService {
    void startKhamBenh(String maNv, String idLichKham);
    void saveKhamBenh(String maNv, SaveKhamBenhRequest request);
}
