package com.medicare.clinic.service.interfaces;

import com.medicare.clinic.dto.request.BenhNhanTimKiemRequest;
import com.medicare.clinic.dto.request.BenhNhanTaoMoiRequest;
import com.medicare.clinic.dto.response.BenhNhanTaoMoiResponse;
import com.medicare.clinic.dto.response.BenhNhanTimKiemResponse;

import com.medicare.clinic.dto.request.BenhNhanThongBaoLichKhamRequest;
import com.medicare.clinic.dto.response.BenhNhanThongBaoLichKhamResponse;
import com.medicare.clinic.dto.response.HoSoYTeCaNhanResponse;
import com.medicare.clinic.dto.response.MedicalRecordResponse;

import java.util.List;

public interface IBenhNhanService {

    BenhNhanTimKiemResponse timKiemHoSoBenhNhan(BenhNhanTimKiemRequest request);
    BenhNhanTaoMoiResponse taoHoSoBenhNhanMoi(BenhNhanTaoMoiRequest request);
    BenhNhanTimKiemResponse kiemTraSoDienThoai(BenhNhanTimKiemRequest request);
    BenhNhanThongBaoLichKhamResponse thongBaoLichKham(String idBenhNhan, BenhNhanThongBaoLichKhamRequest request);
    HoSoYTeCaNhanResponse layHoSoYTeCaNhan(String idBenhNhan);

    List<MedicalRecordResponse.AllergyInfo> layDanhSachDiUng(String idBenhNhan);
    List<MedicalRecordResponse.AllergyInfo> themHoacCapNhatDiUng(String idBenhNhan, String thanhPhan, String ghiChu);
    List<MedicalRecordResponse.AllergyInfo> xoaDiUng(String idBenhNhan, String thanhPhan);
}
