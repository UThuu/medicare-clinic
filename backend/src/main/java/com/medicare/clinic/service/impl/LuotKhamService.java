package com.medicare.clinic.service.impl;

import com.medicare.clinic.dto.request.XacNhanBenhNhanRequest;
import com.medicare.clinic.dto.response.PhanHoiBenhNhanCho;
import com.medicare.clinic.dto.response.PhanHoiXacNhanBenhNhan;
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

    // =========================
    // UC02 - Xem danh sách bệnh nhân chờ
    // =========================

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


    // =========================
    // UC04 - Xác nhận bệnh nhân
    // =========================

    @Override
    @Transactional(readOnly = true)
    public PhanHoiXacNhanBenhNhan xacNhanBenhNhan(
            String idLuotKham,
            XacNhanBenhNhanRequest request
    ) {

        LuotKham luotKham = luotKhamRepository
                .findById(idLuotKham)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Không tìm thấy lượt khám."
                        )
                );

        LichKham lichKham = luotKham.getLichKham();

        if (lichKham == null) {
            throw new RuntimeException(
                    "Lượt khám không có lịch khám."
            );
        }

        BenhNhan benhNhan = lichKham.getBenhNhan();

        if (benhNhan == null) {
            throw new RuntimeException(
                    "Lịch khám không có bệnh nhân."
            );
        }

        // Kiểm tra đúng bệnh nhân
        if (!benhNhan.getIdBenhNhan()
                .equals(request.getIdBenhNhan())) {

            throw new RuntimeException(
                    "Thông tin bệnh nhân không khớp với lượt khám."
            );
        }

        // Kiểm tra đúng lịch khám
        if (!lichKham.getIdLichKham()
                .equals(request.getIdLichKham())) {

            throw new RuntimeException(
                    "Thông tin lịch khám không khớp với lượt khám."
            );
        }

        // Chỉ cho phép xác nhận lượt khám đang chờ
        if (luotKham.getTrangThai()
                != TrangThaiLuotKham.CHO_KHAM) {

            throw new RuntimeException(
                    "Lượt khám không còn ở trạng thái chờ khám."
            );
        }

        return new PhanHoiXacNhanBenhNhan(
                true,

                luotKham.getIdLuotKham(),
                lichKham.getIdLichKham(),
                benhNhan.getIdBenhNhan(),

                benhNhan.getHoTen(),
                benhNhan.getNgaySinh(),
                benhNhan.getGioiTinh(),
                benhNhan.getSoDienThoai(),

                lichKham.getNgayKham(),
                lichKham.getGioKham(),

                luotKham.getTrangThai()
        );
    }
}