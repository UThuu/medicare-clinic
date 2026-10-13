package com.medicare.clinic.service.interfaces;

import com.medicare.clinic.dto.request.DonThuocRequest;
import com.medicare.clinic.dto.response.CanhBaoDiUngResponse;
import com.medicare.clinic.dto.response.DonThuocResponse;
import com.medicare.clinic.dto.response.ThuocResponse;

import java.util.List;

public interface IDonThuocService {
    List<ThuocResponse> layDanhSachThuoc();

    List<CanhBaoDiUngResponse> kiemTraCanhBaoDiUng(String idLuotKham, List<String> danhSachIdThuoc);

    DonThuocResponse layThongTinKeDon(String idLuotKham);

    DonThuocResponse taoDonThuoc(DonThuocRequest request);

    DonThuocResponse capNhatDonThuoc(String idDonThuoc, DonThuocRequest request);

    DonThuocResponse layDonThuocDeIn(String idDonThuoc);
}
