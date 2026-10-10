package com.medicare.clinic.service;

import com.medicare.clinic.dto.record.MedicalRecordResponse;

public interface DoctorRecordService {
    MedicalRecordResponse getMedicalRecord(String maNv, String idLichKham);
}
