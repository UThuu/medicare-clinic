package com.medicare.clinic.service.impl;

import com.medicare.clinic.dto.request.GhiNhanSinhHieuRequest;
import com.medicare.clinic.dto.response.PhanHoiSinhHieu;
import com.medicare.clinic.entity.DieuDuong;
import com.medicare.clinic.entity.LuotKham;
import com.medicare.clinic.entity.SinhHieu;
import com.medicare.clinic.repository.DieuDuongRepository;
import com.medicare.clinic.repository.LuotKhamRepository;
import com.medicare.clinic.repository.SinhHieuRepository;
import com.medicare.clinic.service.interfaces.ISinhHieuService;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SinhHieuService implements ISinhHieuService {

    private final SinhHieuRepository sinhHieuRepository;
    private final LuotKhamRepository luotKhamRepository;
    private final DieuDuongRepository dieuDuongRepository;

    @Override
    @Transactional
    public PhanHoiSinhHieu ghiNhanSinhHieu(
            String idLuotKham,
            GhiNhanSinhHieuRequest request
    ) {

        // ==============================
        // 1. Tìm lượt khám
        // ==============================

        LuotKham luotKham = luotKhamRepository
                .findById(idLuotKham)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Không tìm thấy lượt khám: " + idLuotKham
                        )
                );

        // ==============================
        // 2. Kiểm tra lượt khám hợp lệ
        // ==============================

        if (luotKham.getLichKham() == null) {
            throw new IllegalStateException(
                    "Lượt khám không còn hợp lệ."
            );
        }

        // ==============================
        // 3. Kiểm tra đã có sinh hiệu chưa
        // ==============================

        if (sinhHieuRepository
                .findByLuotKham_IdLuotKham(idLuotKham)
                .isPresent()) {

            throw new IllegalStateException(
                    "Lượt khám này đã có sinh hiệu. "
                            + "Nếu cần sửa, hãy sử dụng UC05."
            );
        }

        // ==============================
        // 4. Tìm điều dưỡng
        // ==============================

        DieuDuong dieuDuong = dieuDuongRepository
                .findById(request.getMaDieuDuong())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Không tìm thấy điều dưỡng: "
                                        + request.getMaDieuDuong()
                        )
                );

        // ==============================
        // 5. Kiểm tra dữ liệu
        // ==============================

        if (request.getHuyetApTamThu() <= 0) {
            throw new IllegalArgumentException(
                    "Huyết áp tâm thu không hợp lệ."
            );
        }

        if (request.getHuyetApTamTruong() <= 0) {
            throw new IllegalArgumentException(
                    "Huyết áp tâm trương không hợp lệ."
            );
        }

        if (request.getCanNang() == null
                || request.getCanNang().signum() <= 0) {

            throw new IllegalArgumentException(
                    "Cân nặng không hợp lệ."
            );
        }

        if (request.getNhietDo() == null
                || request.getNhietDo().signum() <= 0) {

            throw new IllegalArgumentException(
                    "Nhiệt độ không hợp lệ."
            );
        }

        // ==============================
        // 6. Tạo sinh hiệu
        // ==============================

        SinhHieu sinhHieu = new SinhHieu();

        sinhHieu.setIdSinhHieu(
                UUID.randomUUID().toString()
        );

        sinhHieu.setLuotKham(luotKham);

        sinhHieu.setDieuDuong(dieuDuong);

        sinhHieu.setHuyetApTamThu(
                request.getHuyetApTamThu()
        );

        sinhHieu.setHuyetApTamTruong(
                request.getHuyetApTamTruong()
        );

        sinhHieu.setCanNang(
                request.getCanNang()
        );

        sinhHieu.setNhietDo(
                request.getNhietDo()
        );

        sinhHieu.setThoiDiemDo(
                LocalDateTime.now()
        );

        // ==============================
        // 7. Lưu database
        // ==============================

        SinhHieu sinhHieuDaLuu =
                sinhHieuRepository.save(sinhHieu);

        // ==============================
        // 8. Trả kết quả
        // ==============================

        return chuyenSangPhanHoi(sinhHieuDaLuu);
    }

    @Override
    @Transactional(readOnly = true)
    public PhanHoiSinhHieu xemSinhHieuMoiNhat(
            String idLuotKham
    ) {

        SinhHieu sinhHieu =
                sinhHieuRepository
                        .findByLuotKham_IdLuotKham(idLuotKham)
                        .orElse(null);

        if (sinhHieu == null) {
            return null;
        }

        return chuyenSangPhanHoi(sinhHieu);
    }

    private PhanHoiSinhHieu chuyenSangPhanHoi(
            SinhHieu sinhHieu
    ) {

        return new PhanHoiSinhHieu(
                sinhHieu.getIdSinhHieu(),

                sinhHieu.getLuotKham()
                        .getIdLuotKham(),

                sinhHieu.getDieuDuong()
                        .getMaNv(),

                sinhHieu.getHuyetApTamThu(),

                sinhHieu.getHuyetApTamTruong(),

                sinhHieu.getCanNang(),

                sinhHieu.getNhietDo(),

                sinhHieu.getThoiDiemDo()
        );
    }
}