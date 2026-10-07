package com.medicare.clinic.service.impl;

import com.medicare.clinic.dto.response.PhanHoiBenhNhanCho;
import com.medicare.clinic.entity.BenhNhan;
import com.medicare.clinic.entity.LichKham;
import com.medicare.clinic.entity.LuotKham;
import com.medicare.clinic.entity.enums.TrangThaiLuotKham;
import com.medicare.clinic.repository.LuotKhamRepository;
import com.medicare.clinic.service.interfaces.ILuotKhamService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LuotKhamService implements ILuotKhamService {

    private final LuotKhamRepository luotKhamRepository;

    @Override
    @Transactional(readOnly = true)
    public List<PhanHoiBenhNhanCho> xemDanhSachBenhNhanCho(
            LocalDate ngayKham
    ) {

        List<LuotKham> danhSachLuotKham =
                luotKhamRepository
                        .findByTrangThaiAndLichKham_NgayKhamOrderByLichKham_GioKhamAsc(
                                TrangThaiLuotKham.CHO_KHAM,
                                ngayKham
                        );

        return danhSachLuotKham
                .stream()
                .map(this::chuyenSangPhanHoi)
                .toList();
    }

    private PhanHoiBenhNhanCho chuyenSangPhanHoi(
            LuotKham luotKham
    ) {

        LichKham lichKham = luotKham.getLichKham();

        BenhNhan benhNhan = lichKham.getBenhNhan();

        return new PhanHoiBenhNhanCho(
                luotKham.getIdLuotKham(),
                lichKham.getIdLichKham(),
                benhNhan.getIdBenhNhan(),

                benhNhan.getHoTen(),
                benhNhan.getNgaySinh(),
                benhNhan.getGioiTinh(),
                benhNhan.getSoDienThoai(),

                lichKham.getNgayKham(),
                lichKham.getGioKham(),

                luotKham.getLyDoKham(),
                luotKham.getTrieuChung(),
                luotKham.getTrangThai()
        );
    }
}