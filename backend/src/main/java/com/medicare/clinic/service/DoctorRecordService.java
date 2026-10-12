package com.medicare.clinic.service;

import com.medicare.clinic.dto.response.MedicalRecordResponse;

public interface DoctorRecordService {
    MedicalRecordResponse getMedicalRecord(String maNv, String idLichKham);
}
