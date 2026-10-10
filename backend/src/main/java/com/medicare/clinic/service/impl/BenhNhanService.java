package com.medicare.clinic.service.impl;

import com.medicare.clinic.dto.request.BenhNhanTaoMoiRequest;
import com.medicare.clinic.dto.request.BenhNhanTimKiemRequest;
import com.medicare.clinic.dto.request.BenhNhanThongBaoLichKhamRequest;
import com.medicare.clinic.dto.response.BenhNhanTaoMoiResponse;
import com.medicare.clinic.dto.response.BenhNhanTimKiemResponse;
import com.medicare.clinic.dto.response.BenhNhanThongBaoLichKhamResponse;
import com.medicare.clinic.entity.BenhNhan;
import com.medicare.clinic.entity.LichKham;
import com.medicare.clinic.entity.enums.TrangThaiLichKham;
import com.medicare.clinic.repository.BenhNhanRepository;
import com.medicare.clinic.repository.LichKhamRepository;
import com.medicare.clinic.service.interfaces.IBenhNhanService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BenhNhanService implements IBenhNhanService {

    private static final ZoneId ZONE_VIETNAM = ZoneId.of("Asia/Ho_Chi_Minh");
    private final BenhNhanRepository benhNhanRepository;
    private final LichKhamRepository lichKhamRepository;

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

    @Override
    @Transactional
    public BenhNhanTaoMoiResponse taoHoSoBenhNhanMoi(BenhNhanTaoMoiRequest request) {
        if (request == null) throw new IllegalArgumentException("Dữ liệu bệnh nhân không được để trống.");
        if (request.getHoTen() == null || request.getHoTen().isBlank()) throw new IllegalArgumentException("Họ tên không được để trống.");
        if (request.getNgaySinh() == null) throw new IllegalArgumentException("Ngày sinh không được để trống.");
        if (request.getNgaySinh().isAfter(LocalDate.now(ZONE_VIETNAM))) throw new IllegalArgumentException("Ngày sinh không thể ở tương lai.");
        if (request.getGioiTinh() == null) throw new IllegalArgumentException("Giới tính không được để trống.");
        if (request.getSoDienThoai() == null || request.getSoDienThoai().isBlank()) throw new IllegalArgumentException("Số điện thoại không được để trống.");
        String phone = request.getSoDienThoai().trim();
        if (!phone.matches("[0-9+() .-]{8,20}")) throw new IllegalArgumentException("Số điện thoại không đúng định dạng.");

        BenhNhan patient = new BenhNhan();
        patient.setIdBenhNhan(UUID.randomUUID().toString());
        patient.setHoTen(request.getHoTen().trim()); patient.setNgaySinh(request.getNgaySinh());
        patient.setGioiTinh(request.getGioiTinh()); patient.setSoDienThoai(phone);
        patient.setDiaChi(request.getDiaChi() == null || request.getDiaChi().isBlank() ? null : request.getDiaChi().trim());
        BenhNhan saved = benhNhanRepository.save(patient);

        BenhNhanTaoMoiResponse response = new BenhNhanTaoMoiResponse();
        response.setThongBao("Tạo hồ sơ bệnh nhân mới thành công."); response.setIdBenhNhan(saved.getIdBenhNhan());
        response.setHoTen(saved.getHoTen()); response.setNgaySinh(saved.getNgaySinh());
        response.setGioiTinh(saved.getGioiTinh()); response.setSoDienThoai(saved.getSoDienThoai());
        response.setDiaChi(saved.getDiaChi());
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public BenhNhanThongBaoLichKhamResponse thongBaoLichKham(
            String idBenhNhan, BenhNhanThongBaoLichKhamRequest request) {
        if (idBenhNhan == null || idBenhNhan.isBlank())
            throw new IllegalArgumentException("Tài khoản hiện tại chưa được liên kết với hồ sơ bệnh nhân.");
        if (!benhNhanRepository.existsById(idBenhNhan))
            throw new IllegalArgumentException("Không tìm thấy hồ sơ bệnh nhân đang đăng nhập.");

        LocalDateTime now = LocalDateTime.now(ZONE_VIETNAM);
        List<LichKham> appointments = lichKhamRepository
                .findByBenhNhan_IdBenhNhanAndTrangThaiNotOrderByNgayKhamAscGioKhamAsc(
                        idBenhNhan, TrangThaiLichKham.DA_HUY);
        BenhNhanThongBaoLichKhamResponse response = new BenhNhanThongBaoLichKhamResponse();
        response.setThoiDiemTruyVan(now);

        for (LichKham appointment : appointments) {
            LocalDateTime appointmentAt = LocalDateTime.of(appointment.getNgayKham(), appointment.getGioKham());
            if (!appointmentAt.isAfter(now)) continue;

            BenhNhanThongBaoLichKhamResponse.ThongBaoLichKhamItem confirmation = new BenhNhanThongBaoLichKhamResponse.ThongBaoLichKhamItem();
            confirmation.setIdLichKham(appointment.getIdLichKham()); confirmation.setLoaiThongBao("XAC_NHAN_DAT_LICH");
            confirmation.setTieuDe("Xác nhận lịch khám");
            confirmation.setNoiDung("Lịch khám của bạn đã được ghi nhận vào ngày " + appointment.getNgayKham() + " lúc " + appointment.getGioKham() + ".");
            fillAppointmentDetails(confirmation, appointment);
            response.getDanhSachThongBao().add(confirmation);

            // Because LichKham has no createdAt field, these are dynamically reconstructed reminders, not sent/persisted events.
            if (!now.isBefore(appointmentAt.minusDays(1)) && now.isBefore(appointmentAt.minusHours(2))) {
                BenhNhanThongBaoLichKhamResponse.ThongBaoLichKhamItem reminder = new BenhNhanThongBaoLichKhamResponse.ThongBaoLichKhamItem();
                reminder.setIdLichKham(appointment.getIdLichKham()); reminder.setLoaiThongBao("NHAC_LICH_1_NGAY");
                reminder.setTieuDe("Nhắc lịch khám ngày mai");
                reminder.setNoiDung("Bạn có lịch khám vào ngày " + appointment.getNgayKham() + " lúc " + appointment.getGioKham() + ".");
                reminder.setThoiDiemNhac(appointmentAt.minusDays(1)); fillAppointmentDetails(reminder, appointment);
                response.getDanhSachThongBao().add(reminder);
            } else if (!now.isBefore(appointmentAt.minusHours(2)) && now.isBefore(appointmentAt)) {
                BenhNhanThongBaoLichKhamResponse.ThongBaoLichKhamItem reminder = new BenhNhanThongBaoLichKhamResponse.ThongBaoLichKhamItem();
                reminder.setIdLichKham(appointment.getIdLichKham()); reminder.setLoaiThongBao("NHAC_LICH_2_GIO");
                reminder.setTieuDe("Nhắc lịch khám trong 2 giờ tới");
                reminder.setNoiDung("Lịch khám của bạn sắp bắt đầu vào lúc " + appointment.getGioKham() + ".");
                reminder.setThoiDiemNhac(appointmentAt.minusHours(2)); fillAppointmentDetails(reminder, appointment);
                response.getDanhSachThongBao().add(reminder);
            }
        }
        response.setTongSoThongBao(response.getDanhSachThongBao().size());
        return response;
    }

    private void fillAppointmentDetails(
            BenhNhanThongBaoLichKhamResponse.ThongBaoLichKhamItem item, LichKham appointment) {
        item.setMaBacSi(appointment.getBacSi().getMaNv());
        item.setHoTenBacSi(appointment.getBacSi().getNhanVien() == null ? null : appointment.getBacSi().getNhanVien().getHoTen());
        item.setNgayKham(appointment.getNgayKham()); item.setGioKham(appointment.getGioKham());
        item.setTrangThaiLichKham(appointment.getTrangThai());
    }
}
