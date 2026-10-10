package com.medicare.clinic.service.impl;

import com.medicare.clinic.dto.khambenh.SaveKhamBenhRequest;
import com.medicare.clinic.entity.LichKham;
import com.medicare.clinic.entity.LuotKham;
import com.medicare.clinic.entity.enums.TrangThaiLuotKham;
import com.medicare.clinic.repository.LichKhamRepository;
import com.medicare.clinic.repository.LuotKhamRepository;
import com.medicare.clinic.service.interfaces.IKhamBenhService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class KhamBenhService implements IKhamBenhService {
    
    private final LichKhamRepository lichKhamRepository;
    private final LuotKhamRepository luotKhamRepository;

    @Override
    @Transactional
    public void saveKhamBenh(String maNv, SaveKhamBenhRequest request) {
        if (request.getIdLichKham() == null || request.getIdLichKham().trim().isEmpty()) {
            throw new IllegalArgumentException("ID Lịch khám không được để trống");
        }

        LichKham lichKham = lichKhamRepository.findById(request.getIdLichKham())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy lịch khám"));

        if (!maNv.equals(lichKham.getBacSi().getMaNv())) {
            throw new IllegalArgumentException("Bạn không có quyền cập nhật kết quả cho lịch khám này");
        }

        LuotKham luotKham = lichKham.getLuotKham();
        if (luotKham == null) {
            throw new IllegalArgumentException("Bệnh nhân chưa được tiếp nhận (chưa có lượt khám)");
        }

        if (luotKham.getTrangThai() == TrangThaiLuotKham.HOAN_TAT) {
            throw new IllegalArgumentException("Lượt khám đã hoàn tất, không thể chỉnh sửa");
        }

        luotKham.setTrieuChung(request.getTrieuChung());
        luotKham.setKetQuaKham(request.getKetQuaKham());
        luotKham.setChanDoan(request.getChanDoan());

        luotKhamRepository.save(luotKham);
    }
}
