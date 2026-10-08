package com.medicare.clinic.service.impl;

import com.medicare.clinic.dto.request.TiepNhanBenhNhanRequest;
import com.medicare.clinic.dto.request.XacNhanBenhNhanRequest;

import com.medicare.clinic.dto.response.PhanHoiBenhNhanCho;
import com.medicare.clinic.dto.response.PhanHoiLichKhamTiepNhan;
import com.medicare.clinic.dto.response.PhanHoiTimBenhNhan;
import com.medicare.clinic.dto.response.PhanHoiTiepNhanBenhNhan;
import com.medicare.clinic.dto.response.PhanHoiXacNhanBenhNhan;

import com.medicare.clinic.entity.BenhNhan;
import com.medicare.clinic.entity.LichKham;
import com.medicare.clinic.entity.LuotKham;

import com.medicare.clinic.entity.enums.TrangThaiLichKham;
import com.medicare.clinic.entity.enums.TrangThaiLuotKham;

import com.medicare.clinic.repository.BenhNhanRepository;
import com.medicare.clinic.repository.LichKhamRepository;
import com.medicare.clinic.repository.LuotKhamRepository;

import com.medicare.clinic.service.interfaces.ILuotKhamService;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LuotKhamService implements ILuotKhamService {

    private final LuotKhamRepository luotKhamRepository;

    private final BenhNhanRepository benhNhanRepository;

    private final LichKhamRepository lichKhamRepository;


    // =========================================================
    // UC02 - XEM DANH SÁCH BỆNH NHÂN CHỜ
    // =========================================================

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

        LichKham lichKham =
                luotKham.getLichKham();

        BenhNhan benhNhan =
                lichKham.getBenhNhan();

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


    // =========================================================
    // UC04 - XÁC NHẬN BỆNH NHÂN
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public PhanHoiXacNhanBenhNhan xacNhanBenhNhan(
            String idLuotKham,
            XacNhanBenhNhanRequest request
    ) {

        LuotKham luotKham =
                luotKhamRepository
                        .findById(idLuotKham)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Không tìm thấy lượt khám."
                                )
                        );


        LichKham lichKham =
                luotKham.getLichKham();

        if (lichKham == null) {

            throw new RuntimeException(
                    "Lượt khám không có lịch khám."
            );
        }


        BenhNhan benhNhan =
                lichKham.getBenhNhan();

        if (benhNhan == null) {

            throw new RuntimeException(
                    "Lịch khám không có bệnh nhân."
            );
        }


        // -----------------------------------------------------
        // Kiểm tra đúng bệnh nhân
        // -----------------------------------------------------

        if (!benhNhan.getIdBenhNhan()
                .equals(request.getIdBenhNhan())) {

            throw new RuntimeException(
                    "Thông tin bệnh nhân không khớp với lượt khám."
            );
        }


        // -----------------------------------------------------
        // Kiểm tra đúng lịch khám
        // -----------------------------------------------------

        if (!lichKham.getIdLichKham()
                .equals(request.getIdLichKham())) {

            throw new RuntimeException(
                    "Thông tin lịch khám không khớp với lượt khám."
            );
        }


        // -----------------------------------------------------
        // Chỉ cho phép xác nhận lượt đang chờ
        // -----------------------------------------------------

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


    // =========================================================
    // UC27 - TÌM KIẾM HỒ SƠ BỆNH NHÂN
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<PhanHoiTimBenhNhan> timKiemBenhNhan(
            String soDienThoai,
            String hoTen,
            LocalDate ngaySinh
    ) {

        List<BenhNhan> danhSach;


        // -----------------------------------------------------
        // Tìm theo số điện thoại
        // -----------------------------------------------------

        if (soDienThoai != null
                && !soDienThoai.isBlank()) {

            danhSach =
                    benhNhanRepository
                            .findBySoDienThoaiContainingIgnoreCase(
                                    soDienThoai.trim()
                            );
        }


        // -----------------------------------------------------
        // Tìm theo họ tên + ngày sinh
        // -----------------------------------------------------

        else if (
                hoTen != null
                        && !hoTen.isBlank()
                        && ngaySinh != null
        ) {

            danhSach =
                    benhNhanRepository
                            .findByHoTenContainingIgnoreCaseAndNgaySinh(
                                    hoTen.trim(),
                                    ngaySinh
                            );
        }


        // -----------------------------------------------------
        // Không đủ điều kiện tìm kiếm
        // -----------------------------------------------------

        else {

            throw new IllegalArgumentException(
                    "Vui lòng nhập SĐT hoặc Họ tên và ngày sinh."
            );
        }


        return danhSach
                .stream()
                .map(benhNhan ->
                        new PhanHoiTimBenhNhan(

                                benhNhan.getIdBenhNhan(),

                                benhNhan.getHoTen(),

                                benhNhan.getNgaySinh(),

                                benhNhan.getGioiTinh(),

                                benhNhan.getSoDienThoai(),

                                benhNhan.getDiaChi()
                        )
                )
                .toList();
    }


    // =========================================================
    // UC27 - KIỂM TRA LỊCH KHÁM TRONG NGÀY
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<PhanHoiLichKhamTiepNhan> xemLichKhamTrongNgay(
            String idBenhNhan,
            LocalDate ngayKham
    ) {

        BenhNhan benhNhan =
                benhNhanRepository
                        .findById(idBenhNhan)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Không tìm thấy hồ sơ bệnh nhân."
                                )
                        );


        List<LichKham> danhSach =
                lichKhamRepository
                        .findByBenhNhan_IdBenhNhanAndNgayKhamOrderByGioKhamAsc(
                                idBenhNhan,
                                ngayKham
                        );


        return danhSach
                .stream()
                .map(lichKham -> {

                    boolean daCoLuotKham =
                            lichKham.getLuotKham() != null
                                    ||
                                    luotKhamRepository
                                            .existsByLichKham_IdLichKham(
                                                    lichKham.getIdLichKham()
                                            );


                    return new PhanHoiLichKhamTiepNhan(

                            lichKham.getIdLichKham(),

                            benhNhan.getIdBenhNhan(),

                            benhNhan.getHoTen(),

                            lichKham.getBacSi().getMaNv(),

                            lichKham.getNgayKham(),

                            lichKham.getGioKham(),

                            lichKham.getTrangThai(),

                            daCoLuotKham
                    );
                })
                .toList();
    }


    // =========================================================
    // UC27 - TIẾP NHẬN BỆNH NHÂN
    // =========================================================

    @Override
    @Transactional
    public PhanHoiTiepNhanBenhNhan tiepNhanBenhNhan(
            TiepNhanBenhNhanRequest request
    ) {

        // -----------------------------------------------------
        // 1. Kiểm tra request
        // -----------------------------------------------------

        if (request == null
                || request.getIdBenhNhan() == null
                || request.getIdLichKham() == null) {

            throw new IllegalArgumentException(
                    "Thiếu thông tin bệnh nhân hoặc lịch khám."
            );
        }


        // -----------------------------------------------------
        // 2. Tìm hồ sơ bệnh nhân
        // -----------------------------------------------------

        BenhNhan benhNhan =
                benhNhanRepository
                        .findById(
                                request.getIdBenhNhan()
                        )
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Không tìm thấy hồ sơ bệnh nhân."
                                )
                        );


        // -----------------------------------------------------
        // 3. Tìm lịch khám
        // -----------------------------------------------------

        LichKham lichKham =
                lichKhamRepository
                        .findById(
                                request.getIdLichKham()
                        )
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Không tìm thấy lịch khám."
                                )
                        );


        // -----------------------------------------------------
        // 4. Kiểm tra lịch thuộc đúng bệnh nhân
        // -----------------------------------------------------

        if (lichKham.getBenhNhan() == null
                || !lichKham
                .getBenhNhan()
                .getIdBenhNhan()
                .equals(
                        benhNhan.getIdBenhNhan()
                )) {

            throw new IllegalArgumentException(
                    "Lịch khám không thuộc bệnh nhân đã xác nhận."
            );
        }


        // -----------------------------------------------------
        // 5. Chỉ tiếp nhận lịch khám trong ngày
        // -----------------------------------------------------

        LocalDate homNay =
                LocalDate.now();

        if (!homNay.equals(
                lichKham.getNgayKham()
        )) {

            throw new IllegalStateException(
                    "Chỉ được tiếp nhận lịch khám trong ngày hôm nay."
            );
        }


        // -----------------------------------------------------
        // 6. Kiểm tra trạng thái lịch
        // -----------------------------------------------------

        if (lichKham.getTrangThai()
                != TrangThaiLichKham.DA_DAT) {

            if (lichKham.getLuotKham() != null) {

                throw new IllegalStateException(
                        "Lịch khám này đã được tiếp nhận."
                );
            }

            throw new IllegalStateException(
                    "Lịch khám không ở trạng thái có thể tiếp nhận."
            );
        }


        // -----------------------------------------------------
        // 7. Kiểm tra một lịch chỉ có tối đa một lượt khám
        // -----------------------------------------------------

        if (lichKham.getLuotKham() != null
                || luotKhamRepository
                .existsByLichKham_IdLichKham(
                        lichKham.getIdLichKham()
                )) {

            throw new IllegalStateException(
                    "Lịch khám này đã có lượt khám."
            );
        }


        // -----------------------------------------------------
        // 8. Tạo LuotKham từ LichKham
        // -----------------------------------------------------

        LuotKham luotKham =
                new LuotKham();

        luotKham.setIdLuotKham(
                UUID.randomUUID().toString()
        );

        luotKham.setLichKham(
                lichKham
        );

        luotKham.setTrangThai(
                TrangThaiLuotKham.CHO_KHAM
        );


        // -----------------------------------------------------
        // 9. Cập nhật trạng thái LichKham
        // -----------------------------------------------------

        lichKham.setTrangThai(
                TrangThaiLichKham.DA_TIEP_NHAN
        );


        // -----------------------------------------------------
        // 10. Lưu LuotKham
        // -----------------------------------------------------

        LuotKham luotKhamDaLuu =
                luotKhamRepository.save(
                        luotKham
                );


        // -----------------------------------------------------
        // 11. Lưu LichKham
        // -----------------------------------------------------

        lichKhamRepository.save(
                lichKham
        );


        // -----------------------------------------------------
        // 12. Trả kết quả
        // -----------------------------------------------------

        return new PhanHoiTiepNhanBenhNhan(

                true,

                "Tiếp nhận bệnh nhân thành công.",

                luotKhamDaLuu.getIdLuotKham(),

                lichKham.getIdLichKham(),

                benhNhan.getIdBenhNhan(),

                benhNhan.getHoTen(),

                lichKham.getNgayKham(),

                lichKham.getGioKham(),

                lichKham.getBacSi().getMaNv(),

                lichKham.getTrangThai(),

                luotKhamDaLuu.getTrangThai()
        );
    }
}