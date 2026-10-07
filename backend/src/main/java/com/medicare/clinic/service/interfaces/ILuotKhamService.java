package com.medicare.clinic.service.interfaces;

import com.medicare.clinic.dto.response.PhanHoiBenhNhanCho;

import java.time.LocalDate;
import java.util.List;

public interface ILuotKhamService {

    List<PhanHoiBenhNhanCho> xemDanhSachBenhNhanCho(LocalDate ngayKham);
}