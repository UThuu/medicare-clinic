package com.medicare.clinic.service.interfaces;

import com.medicare.clinic.dto.response.MedicalRecordResponse;

public interface IDoctorRecordService {
    MedicalRecordResponse getMedicalRecord(String maNv, String idLichKham);
}
