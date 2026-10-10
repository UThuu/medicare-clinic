package com.medicare.clinic.service.impl;

import com.medicare.clinic.dto.khambenh.SaveKhamBenhRequest;
import com.medicare.clinic.entity.LichKham;
import com.medicare.clinic.entity.LuotKham;
import com.medicare.clinic.entity.SinhHieu;
import com.medicare.clinic.entity.enums.TrangThaiLuotKham;
import com.medicare.clinic.repository.LichKhamRepository;
import com.medicare.clinic.repository.LuotKhamRepository;
import com.medicare.clinic.repository.SinhHieuRepository;
import com.medicare.clinic.service.interfaces.IKhamBenhService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class KhamBenhService implements IKhamBenhService {
    private final LichKhamRepository lichKhamRepository;
    private final LuotKhamRepository luotKhamRepository;
    private final SinhHieuRepository sinhHieuRepository;

    @Override
    @Transactional
    public void startKhamBenh(String maNv, String idLichKham) {
        LuotKham luotKham = requireExaminableVisit(maNv, idLichKham);
        if (luotKham.getTrangThai() == TrangThaiLuotKham.CHO_KHAM) {
            luotKham.setTrangThai(TrangThaiLuotKham.DANG_KHAM);
            luotKhamRepository.save(luotKham);
        }
    }

    @Override
    @Transactional
    public void saveKhamBenh(String maNv, SaveKhamBenhRequest request) {
        if (request == null || isBlank(request.getTrieuChung())
                || isBlank(request.getKetQuaKham()) || isBlank(request.getChanDoan())) {
            throw new IllegalArgumentException("Vui lòng nhập đầy đủ triệu chứng, kết quả khám và chẩn đoán");
        }
        LuotKham luotKham = requireExaminableVisit(maNv, request.getIdLichKham());
        if (luotKham.getTrangThai() != TrangThaiLuotKham.DANG_KHAM) {
            throw new IllegalArgumentException("Vui lòng bắt đầu khám trước khi lưu kết quả");
        }
        luotKham.setTrieuChung(request.getTrieuChung().trim());
        luotKham.setKetQuaKham(request.getKetQuaKham().trim());
        luotKham.setChanDoan(request.getChanDoan().trim());
        luotKhamRepository.save(luotKham);
    }

    private LuotKham requireExaminableVisit(String maNv, String idLichKham) {
        if (isBlank(idLichKham)) {
            throw new IllegalArgumentException("ID Lịch khám không được để trống");
        }
        LichKham lichKham = lichKhamRepository.findById(idLichKham)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy lịch khám"));
        if (isBlank(maNv) || lichKham.getBacSi() == null || !maNv.equals(lichKham.getBacSi().getMaNv())) {
            throw new IllegalArgumentException("Bạn không có quyền cập nhật kết quả cho lịch khám này");
        }
        LuotKham luotKham = lichKham.getLuotKham();
        if (luotKham == null) {
            throw new IllegalArgumentException("Bệnh nhân chưa được tiếp nhận (chưa có lượt khám)");
        }
        if (luotKham.getTrangThai() != TrangThaiLuotKham.CHO_KHAM
                && luotKham.getTrangThai() != TrangThaiLuotKham.DANG_KHAM) {
            throw new IllegalArgumentException("Lượt khám đã hoàn tất hoặc không thể chỉnh sửa");
        }
        SinhHieu sinhHieu = sinhHieuRepository.findByLuotKham_IdLuotKham(luotKham.getIdLuotKham())
                .orElseThrow(() -> new IllegalArgumentException("Cần ghi nhận sinh hiệu của lượt khám hiện tại trước khi khám"));
        if (sinhHieu.getHuyetApTamThu() == null || sinhHieu.getHuyetApTamThu() <= 0
                || sinhHieu.getHuyetApTamTruong() == null || sinhHieu.getHuyetApTamTruong() <= 0
                || sinhHieu.getCanNang() == null || sinhHieu.getCanNang().signum() <= 0
                || sinhHieu.getNhietDo() == null || sinhHieu.getNhietDo().signum() <= 0) {
            throw new IllegalArgumentException("Sinh hiệu lượt khám hiện tại chưa đầy đủ");
        }
        return luotKham;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
