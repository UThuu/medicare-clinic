package com.medicare.clinic.service.impl;

import com.medicare.clinic.dto.request.LichKhamDatTaiQuayRequest;
import com.medicare.clinic.dto.response.*;
import com.medicare.clinic.entity.*;
import com.medicare.clinic.entity.enums.*;
import com.medicare.clinic.repository.*;
import com.medicare.clinic.service.interfaces.ILichKhamService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.*;
import java.time.*;
import java.util.*;

@Service
@RequiredArgsConstructor
public class LichKhamService implements ILichKhamService {
    private static final ZoneId ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final LocalTime OPEN = LocalTime.of(7, 0);
    private static final LocalTime CLOSE = LocalTime.of(16, 0);
    private static final int SLOT_MINUTES = 10;
    private final LichKhamRepository lichKhamRepository;
    private final BenhNhanRepository benhNhanRepository;
    private final BacSiRepository bacSiRepository;

    @Override @Transactional(readOnly = true)
    public List<BacSiDatLichResponse> danhSachBacSi() {
        return bacSiRepository.findDoctorsWithNames().stream()
                .map(b -> new BacSiDatLichResponse(b.getMaNv(), b.getNhanVien().getHoTen(), b.getChuyenKhoa())).toList();
    }
    @Override @Transactional(readOnly = true)
    public LichKhamKhungGioResponse khungGioTrong(String maBacSi, LocalDate date) {
        String doctor = requireDoctor(maBacSi); validateDate(date);
        LocalDateTime now = LocalDateTime.now(ZONE);
        List<LocalTime> times = freeTimes(doctor, date, now);
        List<LocalDate> alternatives = new ArrayList<>();
        if (times.isEmpty()) {
            LocalDate maxDate = LocalDate.of(9999, 12, 31);
            for (int offset = 1; offset <= 14 && alternatives.size() < 5; offset++) {
                LocalDate candidate = date.plusDays(offset);
                if (candidate.isAfter(maxDate)) break;
                if (!freeTimes(doctor, candidate, now).isEmpty()) alternatives.add(candidate);
            }
        }
        return new LichKhamKhungGioResponse(doctor, date, times, alternatives);
    }
    @Override @Transactional(isolation = Isolation.READ_COMMITTED)
    public LichKhamDatTaiQuayResponse datLichKhamTaiQuay(LichKhamDatTaiQuayRequest request) {
        if (request == null) throw new IllegalArgumentException("Dữ liệu đặt lịch không được để trống.");
        validateDate(request.getNgayKham());
        LocalTime time = request.getGioKham();
        if (time == null || time.getSecond() != 0 || time.getNano() != 0
                || time.isBefore(OPEN) || !time.isBefore(CLOSE) || time.getMinute() % SLOT_MINUTES != 0)
            throw new IllegalArgumentException("Giờ khám phải từ 07:00 đến 15:50, cách nhau 10 phút.");
        if (LocalDateTime.of(request.getNgayKham(), time).isBefore(LocalDateTime.now(ZONE)))
            throw new IllegalArgumentException("Không thể đặt lịch vào thời điểm đã qua.");
        if (request.getMaBacSi() == null || request.getMaBacSi().isBlank())
            throw new IllegalArgumentException("Vui lòng chọn bác sĩ.");
        if (request.getIdBenhNhan() == null || request.getIdBenhNhan().isBlank())
            throw new IllegalArgumentException("Vui lòng chọn hồ sơ bệnh nhân.");
        // Serialize UC30 bookings per doctor across application instances, using an existing row.
        // READ_COMMITTED ensures the availability check sees the preceding booking after the lock is acquired.
        BacSi doctor = bacSiRepository.lockForBooking(request.getMaBacSi().trim())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bác sĩ đã chọn."));
        if (lichKhamRepository.existsByBacSi_MaNvAndNgayKhamAndGioKhamAndTrangThaiNot(
                doctor.getMaNv(), request.getNgayKham(), time, TrangThaiLichKham.DA_HUY))
            throw new IllegalStateException("Khung giờ vừa được đặt bởi người khác, vui lòng chọn lại.");
        BenhNhan patient = benhNhanRepository.findById(request.getIdBenhNhan().trim())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ bệnh nhân."));
        LichKham booking = new LichKham(); booking.setIdLichKham(UUID.randomUUID().toString());
        booking.setBenhNhan(patient); booking.setBacSi(doctor);
        booking.setNgayKham(request.getNgayKham()); booking.setGioKham(time);
        booking.setTrangThai(TrangThaiLichKham.DA_DAT); booking.setPhuongThucDatLich(PhuongThucDatLich.TRUC_TIEP);
        LichKham saved = lichKhamRepository.saveAndFlush(booking);
        LichKhamDatTaiQuayResponse response = new LichKhamDatTaiQuayResponse();
        response.setThongBao("Đặt lịch khám tại quầy thành công."); response.setIdLichKham(saved.getIdLichKham());
        response.setIdBenhNhan(patient.getIdBenhNhan()); response.setHoTenBenhNhan(patient.getHoTen());
        response.setMaBacSi(saved.getBacSi().getMaNv()); response.setHoTenBacSi(saved.getBacSi().getNhanVien().getHoTen());
        response.setNgayKham(saved.getNgayKham()); response.setGioKham(saved.getGioKham());
        response.setTrangThai(saved.getTrangThai()); response.setPhuongThucDatLich(saved.getPhuongThucDatLich());
        return response;
    }
    private List<LocalTime> freeTimes(String doctor, LocalDate date, LocalDateTime now) {
        Set<LocalTime> occupied = new HashSet<>(lichKhamRepository.findOccupiedTimes(doctor, date, TrangThaiLichKham.DA_HUY));
        List<LocalTime> free = new ArrayList<>();
        for (LocalTime time = OPEN; time.isBefore(CLOSE); time = time.plusMinutes(SLOT_MINUTES)) {
            if (LocalDateTime.of(date, time).isAfter(now) && !occupied.contains(time)) free.add(time);
        }
        return free;
    }
    private void validateDate(LocalDate date) {
        if (date == null || date.isBefore(LocalDate.now(ZONE)) || date.getYear() > 9999)
            throw new IllegalArgumentException("Ngày khám phải hợp lệ và không ở quá khứ.");
    }
    private String requireDoctor(String value) {
        if (value == null || value.isBlank() || !bacSiRepository.existsById(value.trim()))
            throw new IllegalArgumentException("Không tìm thấy bác sĩ đã chọn.");
        return value.trim();
    }
}
