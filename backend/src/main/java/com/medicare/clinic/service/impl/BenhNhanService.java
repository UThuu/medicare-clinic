package com.medicare.clinic.service.impl;

import com.medicare.clinic.dto.request.BenhNhanTimKiemRequest;
import com.medicare.clinic.dto.response.BenhNhanTimKiemResponse;
import com.medicare.clinic.entity.BenhNhan;
import com.medicare.clinic.repository.BenhNhanRepository;
import com.medicare.clinic.service.interfaces.IBenhNhanService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BenhNhanService implements IBenhNhanService {

    private static final ZoneId ZONE_VIETNAM = ZoneId.of("Asia/Ho_Chi_Minh");
    private final BenhNhanRepository benhNhanRepository;

    @Override
    @Transactional(readOnly = true)
    public BenhNhanTimKiemResponse timKiemHoSoBenhNhan(BenhNhanTimKiemRequest request) {
        if (request == null) throw new IllegalArgumentException("Dữ liệu tìm kiếm không được để trống.");
        boolean hasPhone = request.getSoDienThoai() != null && !request.getSoDienThoai().isBlank();
        boolean hasName = request.getHoTen() != null && !request.getHoTen().isBlank();
        boolean hasDob = request.getNgaySinh() != null;
        if (hasPhone && (hasName || hasDob))
            throw new IllegalArgumentException("Hãy tìm theo số điện thoại hoặc theo họ tên kèm ngày sinh, không nhập đồng thời hai cách.");
        if (!hasPhone && !(hasName && hasDob))
            throw new IllegalArgumentException("Nhập số điện thoại hoặc nhập đủ họ tên và ngày sinh để tìm kiếm.");
        if (!hasPhone && request.getNgaySinh().isAfter(LocalDate.now(ZONE_VIETNAM)))
            throw new IllegalArgumentException("Ngày sinh không thể ở tương lai.");

        if (hasPhone && !request.getSoDienThoai().trim().matches("(?=.*[0-9])[0-9+() .-]{8,20}"))
            throw new IllegalArgumentException("Số điện thoại không đúng định dạng.");
        if (hasName && request.getHoTen().trim().length() > 100)
            throw new IllegalArgumentException("Họ tên không được vượt quá 100 ký tự.");

        List<BenhNhan> patients = hasPhone
                ? benhNhanRepository.findBySoDienThoaiContainingIgnoreCase(request.getSoDienThoai().trim())
                : benhNhanRepository.findByHoTenContainingIgnoreCaseAndNgaySinh(request.getHoTen().trim(), request.getNgaySinh());

        BenhNhanTimKiemResponse response = new BenhNhanTimKiemResponse();
        response.setTongSoKetQua(patients.size());
        response.setThongBao(patients.isEmpty() ? "Không tìm thấy hồ sơ bệnh nhân phù hợp." : "Đã tìm thấy hồ sơ bệnh nhân phù hợp.");
        for (BenhNhan patient : patients) {
            BenhNhanTimKiemResponse.BenhNhanItem item = new BenhNhanTimKiemResponse.BenhNhanItem();
            item.setIdBenhNhan(patient.getIdBenhNhan()); item.setHoTen(patient.getHoTen());
            item.setNgaySinh(patient.getNgaySinh()); item.setGioiTinh(patient.getGioiTinh());
            item.setSoDienThoai(patient.getSoDienThoai()); item.setDiaChi(patient.getDiaChi());
            response.getDanhSachBenhNhan().add(item);
        }
        return response;
    }
}
