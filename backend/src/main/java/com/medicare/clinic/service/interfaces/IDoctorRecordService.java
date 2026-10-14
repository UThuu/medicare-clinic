package com.medicare.clinic.service.interfaces;

import com.medicare.clinic.dto.response.MedicalRecordResponse;

import java.util.List;

public interface IDoctorRecordService {
    MedicalRecordResponse getMedicalRecord(String maNv, String idLichKham);

    List<MedicalRecordResponse.AllergyInfo> themHoacCapNhatDiUng(String idBenhNhan, String thanhPhan, String ghiChu);

    List<MedicalRecordResponse.AllergyInfo> xoaDiUng(String idBenhNhan, String thanhPhan);
}
