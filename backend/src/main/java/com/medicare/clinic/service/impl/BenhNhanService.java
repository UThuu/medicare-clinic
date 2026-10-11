package com.medicare.clinic.service.impl;

import com.medicare.clinic.dto.request.BenhNhanTimKiemRequest;
import com.medicare.clinic.dto.request.BenhNhanTaoMoiRequest;
import com.medicare.clinic.dto.response.BenhNhanTaoMoiResponse;
import java.util.UUID;
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
import java.util.Locale;

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
                ? benhNhanRepository.findByNormalizedPhoneContaining(request.getSoDienThoai().trim().replaceAll("[() .-]", ""))
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
    @Override
    @Transactional
    public BenhNhanTaoMoiResponse taoHoSoBenhNhanMoi(BenhNhanTaoMoiRequest request) {
        if (request == null) throw new IllegalArgumentException("Dữ liệu bệnh nhân không được để trống.");
        String name = request.getHoTen() == null ? "" : request.getHoTen().strip();
        if (name.isEmpty()) throw new IllegalArgumentException("Họ tên không được để trống.");
        if (name.length() > 100) throw new IllegalArgumentException("Họ tên không được vượt quá 100 ký tự.");
        if (request.getNgaySinh() == null) throw new IllegalArgumentException("Ngày sinh không được để trống.");
        if (request.getNgaySinh().getYear() < 1000 || request.getNgaySinh().isAfter(LocalDate.now(ZONE_VIETNAM)))
            throw new IllegalArgumentException("Ngày sinh phải từ năm 1000 đến ngày hiện tại.");
        if (request.getGioiTinh() == null) throw new IllegalArgumentException("Giới tính không được để trống.");
        String phone = normalizePhone(request.getSoDienThoai());
        String address = request.getDiaChi() == null ? "" : request.getDiaChi().strip();
        if (address.length() > 255) throw new IllegalArgumentException("Địa chỉ không được vượt quá 255 ký tự.");
        boolean sameIdentity = benhNhanRepository.findByNormalizedPhone(phone).stream()
                .anyMatch(existing -> normalizeName(existing.getHoTen()).equals(normalizeName(name))
                        && request.getNgaySinh().equals(existing.getNgaySinh()));
        if (sameIdentity && !Boolean.TRUE.equals(request.getXacNhanTaoMoi()))
            throw new IllegalStateException("Hồ sơ trùng họ tên, ngày sinh và số điện thoại. Hãy chọn hồ sơ hiện có hoặc xác nhận tạo mới.");
        BenhNhan patient = new BenhNhan();
        patient.setIdBenhNhan(UUID.randomUUID().toString());
        patient.setHoTen(name); patient.setNgaySinh(request.getNgaySinh());
        patient.setGioiTinh(request.getGioiTinh()); patient.setSoDienThoai(phone);
        patient.setDiaChi(address.isEmpty() ? null : address);
        BenhNhan saved = benhNhanRepository.saveAndFlush(patient);
        BenhNhanTaoMoiResponse response = new BenhNhanTaoMoiResponse();
        response.setThongBao("Tạo hồ sơ bệnh nhân mới thành công.");
        response.setIdBenhNhan(saved.getIdBenhNhan()); response.setHoTen(saved.getHoTen());
        response.setNgaySinh(saved.getNgaySinh()); response.setGioiTinh(saved.getGioiTinh());
        response.setSoDienThoai(saved.getSoDienThoai()); response.setDiaChi(saved.getDiaChi());
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public BenhNhanTimKiemResponse kiemTraSoDienThoai(BenhNhanTimKiemRequest request) {
        if (request == null) throw new IllegalArgumentException("Vui lòng nhập số điện thoại.");
        if ((request.getHoTen() != null && !request.getHoTen().isBlank()) || request.getNgaySinh() != null)
            throw new IllegalArgumentException("Chỉ nhập số điện thoại để kiểm tra hồ sơ dùng chung.");
        String phone = normalizePhone(request.getSoDienThoai());
        List<BenhNhan> matches = benhNhanRepository.findByNormalizedPhone(phone);
        BenhNhanTimKiemResponse response = new BenhNhanTimKiemResponse();
        response.setTongSoKetQua(matches.size());
        response.setThongBao(matches.isEmpty() ? "Số điện thoại chưa có hồ sơ."
                : "Số điện thoại đã tồn tại. Hãy đối chiếu hồ sơ; bệnh nhân khác có thể dùng chung số của người giám hộ.");
        for (BenhNhan patient : matches) {
            BenhNhanTimKiemResponse.BenhNhanItem item = new BenhNhanTimKiemResponse.BenhNhanItem();
            item.setIdBenhNhan(patient.getIdBenhNhan()); item.setHoTen(patient.getHoTen());
            item.setNgaySinh(patient.getNgaySinh()); item.setGioiTinh(patient.getGioiTinh());
            item.setSoDienThoai(patient.getSoDienThoai()); item.setDiaChi(patient.getDiaChi());
            response.getDanhSachBenhNhan().add(item);
        }
        return response;
    }

    private String normalizeName(String value) {
        return value == null ? "" : value.strip().replaceAll("\\s+", " ").toLowerCase(Locale.ROOT);
    }

    private String normalizePhone(String value) {
        String rawPhone = value == null ? "" : value.strip();
        String phone = rawPhone.replaceAll("[() .-]", "");
        if (rawPhone.length() > 20 || !rawPhone.matches("[0-9+() .-]+") || !phone.matches("\\+?[0-9]{8,20}"))
            throw new IllegalArgumentException("Số điện thoại phải có 8–20 chữ số, có thể bắt đầu bằng +.");
        return phone;
    }

}
