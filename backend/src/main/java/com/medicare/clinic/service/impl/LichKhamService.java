package com.medicare.clinic.service.impl;

import com.medicare.clinic.dto.request.BacSiGoiYDaTungKhamRequest;
import com.medicare.clinic.dto.request.LichKhamDatTaiQuayRequest;
import com.medicare.clinic.dto.request.LichKhamDatTrucTuyenRequest;
import com.medicare.clinic.dto.request.LichKhamGoiYKhungGioThayTheRequest;
import com.medicare.clinic.dto.request.LichKhamKiemTraTrongRequest;
import com.medicare.clinic.dto.response.BacSiGoiYDaTungKhamResponse;
import com.medicare.clinic.dto.response.BacSiDatLichResponse;
import com.medicare.clinic.dto.response.LichKhamDatTaiQuayResponse;
import com.medicare.clinic.dto.response.LichKhamDatTrucTuyenResponse;
import com.medicare.clinic.dto.response.LichKhamGoiYKhungGioThayTheResponse;
import com.medicare.clinic.dto.response.LichKhamKiemTraTrongResponse;
import com.medicare.clinic.entity.BacSi;
import com.medicare.clinic.entity.BenhNhan;
import com.medicare.clinic.entity.LichKham;
import com.medicare.clinic.entity.enums.PhuongThucDatLich;
import com.medicare.clinic.entity.enums.TrangThaiLichKham;
import com.medicare.clinic.repository.BacSiRepository;
import com.medicare.clinic.repository.BenhNhanRepository;
import com.medicare.clinic.repository.LichKhamRepository;
import com.medicare.clinic.repository.LuotKhamRepository;

import com.medicare.clinic.service.interfaces.ILichKhamService;
import org.springframework.transaction.annotation.Isolation;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Map;
import java.util.HashMap;
import java.util.Set;
import java.util.HashSet;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LichKhamService implements ILichKhamService {

    private static final ZoneId ZONE_VIETNAM = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final int DEFAULT_DOCTOR_LIMIT = 5;
    private static final int DEFAULT_SLOT_LIMIT = 3;
    private static final int MAX_RESULT_LIMIT = 20;
    private static final LocalTime OPEN = LocalTime.of(7, 0);
    private static final LocalTime CLOSE = LocalTime.of(16, 0);
    private static final int SLOT_STEP_MINUTES = 10;

    private final LichKhamRepository lichKhamRepository;
    private final LuotKhamRepository luotKhamRepository;
    private final BenhNhanRepository benhNhanRepository;
    private final BacSiRepository bacSiRepository;

    @Override
    @Transactional(readOnly = true)
    public LichKhamKiemTraTrongResponse kiemTraLichTrong(LichKhamKiemTraTrongRequest request) {
        if (request == null) throw new IllegalArgumentException("Dữ liệu kiểm tra lịch không được để trống.");
        validateSlotRequest(request.getMaBacSi(), request.getNgayKham(), request.getGioKham());
        if (!bacSiRepository.existsById(request.getMaBacSi().trim())) {
            throw new IllegalArgumentException("Không tìm thấy bác sĩ có mã: " + request.getMaBacSi());
        }

        boolean conTrong = !isSlotBooked(
                request.getMaBacSi().trim(), request.getNgayKham(), request.getGioKham());
        LichKhamKiemTraTrongResponse response = new LichKhamKiemTraTrongResponse();
        response.setMaBacSi(request.getMaBacSi().trim());
        response.setNgayKham(request.getNgayKham());
        response.setGioKham(request.getGioKham());
        response.setConTrong(conTrong);
        response.setThongBao(conTrong ? "Khung giờ còn trống." : "Khung giờ đã có lịch khám.");
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public BacSiGoiYDaTungKhamResponse goiYBacSiDaTungKham(
            String idBenhNhan, BacSiGoiYDaTungKhamRequest request) {
        requirePatientId(idBenhNhan);
        if (!benhNhanRepository.existsById(idBenhNhan)) {
            throw new IllegalArgumentException("Không tìm thấy hồ sơ bệnh nhân đang đăng nhập.");
        }

        int limit = request == null || request.getSoLuongToiDa() == null
                ? DEFAULT_DOCTOR_LIMIT : request.getSoLuongToiDa();
        validateLimit(limit, "Số lượng bác sĩ gợi ý");

        List<Object[]> rows = luotKhamRepository.findDoctorHistoryByPatient(
                idBenhNhan, com.medicare.clinic.entity.enums.TrangThaiLuotKham.HOAN_TAT);
        BacSiGoiYDaTungKhamResponse response = new BacSiGoiYDaTungKhamResponse();
        response.setThongBao(rows.isEmpty()
                ? "Bệnh nhân chưa có lịch sử khám với bác sĩ nào."
                : "Danh sách bác sĩ bệnh nhân đã từng khám, ưu tiên theo số lần khám và lần khám gần nhất.");

        rows.stream().limit(limit).forEach(row -> {
            BacSiGoiYDaTungKhamResponse.BacSiGoiYItem item =
                    new BacSiGoiYDaTungKhamResponse.BacSiGoiYItem();
            item.setMaBacSi((String) row[0]);
            item.setHoTenBacSi((String) row[1]);
            item.setChuyenKhoa((String) row[2]);
            item.setBangCap((String) row[3]);
            item.setSoLanKhamTruoc(((Number) row[4]).intValue());
            item.setNgayKhamGanNhat((LocalDate) row[5]);
            response.getDanhSachBacSi().add(item);
        });
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public LichKhamGoiYKhungGioThayTheResponse goiYKhungGioThayThe(
            LichKhamGoiYKhungGioThayTheRequest request) {
        if (request == null) throw new IllegalArgumentException("Dữ liệu yêu cầu không được để trống.");
        validateDate(request.getNgayKham());
        validateTime(request.getGioKhamMongMuon());
        String maBacSi = request.getMaBacSi() == null ? "" : request.getMaBacSi().trim();
        BacSi bacSi = bacSiRepository.findById(maBacSi)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bác sĩ đã chọn."));
        int limit = request.getSoLuongGoiY() == null ? DEFAULT_SLOT_LIMIT : request.getSoLuongGoiY();
        if (limit < 1 || limit > DEFAULT_SLOT_LIMIT) throw new IllegalArgumentException("Số lượng gợi ý phải từ 1 đến 3.");
        LichKhamGoiYKhungGioThayTheResponse response = new LichKhamGoiYKhungGioThayTheResponse();
        LocalDateTime now = LocalDateTime.now(ZONE_VIETNAM);
        for (int offset = 1; offset <= 14 && response.getDanhSachKhungGio().size() < limit; offset++) {
            LocalDate day = request.getNgayKham().plusDays(offset);
            if (day.getYear() > 9999) break;
            for (LocalTime time : freeTimes(maBacSi, day, now)) {
                LichKhamGoiYKhungGioThayTheResponse.KhungGioGoiYItem item = new LichKhamGoiYKhungGioThayTheResponse.KhungGioGoiYItem();
                item.setMaBacSi(maBacSi); item.setHoTenBacSi(bacSi.getNhanVien().getHoTen()); item.setChuyenKhoa(bacSi.getChuyenKhoa());
                item.setNgayKham(day); item.setGioKham(time); response.getDanhSachKhungGio().add(item);
                if (response.getDanhSachKhungGio().size() == limit) break;
            }
        }
        response.setThongBao(response.getDanhSachKhungGio().isEmpty()
                ? "Không tìm thấy giờ trống trong 14 ngày tiếp theo. Hãy chọn ngày hoặc bác sĩ khác."
                : "Các giờ trống gần nhất trong những ngày tiếp theo.");
        return response;
    }

    @Override
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public LichKhamDatTrucTuyenResponse datLichKhamTrucTuyen(
            String idBenhNhan, LichKhamDatTrucTuyenRequest request) {
        requirePatientId(idBenhNhan);
        if (request == null) throw new IllegalArgumentException("Dữ liệu đặt lịch không được để trống.");
        validateSlotRequest(request.getMaBacSi(), request.getNgayKham(), request.getGioKham());
        BenhNhan benhNhan = benhNhanRepository.findById(idBenhNhan)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ bệnh nhân đang đăng nhập."));
        BacSi bacSi = bacSiRepository.lockForBooking(request.getMaBacSi().trim())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bác sĩ đã chọn."));
        ensureSlotAvailable(request.getMaBacSi().trim(), request.getNgayKham(), request.getGioKham());

        validatePatient(benhNhan);
        LichKham lichKham = new LichKham();
        lichKham.setIdLichKham(UUID.randomUUID().toString());
        lichKham.setBenhNhan(benhNhan);
        lichKham.setBacSi(bacSi);
        lichKham.setNgayKham(request.getNgayKham());
        lichKham.setGioKham(request.getGioKham());
        lichKham.setTrangThai(TrangThaiLichKham.DA_DAT);
        lichKham.setPhuongThucDatLich(PhuongThucDatLich.TRUC_TUYEN);
        return toOnlineResponse(lichKhamRepository.save(lichKham), "Đặt lịch khám trực tuyến thành công.");
    }

    @Override @Transactional(isolation = Isolation.READ_COMMITTED)
    public LichKhamDatTaiQuayResponse datLichKhamTaiQuay(LichKhamDatTaiQuayRequest request) {
        if (request == null) throw new IllegalArgumentException("Dữ liệu đặt lịch không được để trống.");
        validateDate(request.getNgayKham());
        LocalTime time = request.getGioKham();
        if (time == null || time.getSecond() != 0 || time.getNano() != 0
                || time.isBefore(OPEN) || !time.isBefore(CLOSE) || time.getMinute() % SLOT_STEP_MINUTES != 0)
            throw new IllegalArgumentException("Giờ khám phải từ 07:00 đến 15:50, cách nhau 10 phút.");
        if (LocalDateTime.of(request.getNgayKham(), time).isBefore(LocalDateTime.now(ZONE_VIETNAM)))
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
    @Override @Transactional(readOnly = true)
    public List<BacSiDatLichResponse> danhSachBacSi() {
        return bacSiRepository.findDoctorsWithNames().stream()
                .map(b -> new BacSiDatLichResponse(b.getMaNv(), b.getNhanVien().getHoTen(), b.getChuyenKhoa())).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public BacSiGoiYDaTungKhamResponse danhSachBacSi(String idBenhNhan) {
        Map<String, Object[]> history = new HashMap<>();
        if (idBenhNhan != null && !idBenhNhan.isBlank())
            luotKhamRepository.findDoctorHistoryByPatient(idBenhNhan, com.medicare.clinic.entity.enums.TrangThaiLuotKham.HOAN_TAT)
                    .forEach(row -> history.put((String) row[0], row));
        BacSiGoiYDaTungKhamResponse response = new BacSiGoiYDaTungKhamResponse();
        for (BacSi doctor : bacSiRepository.findDoctorsWithNames()) {
            BacSiGoiYDaTungKhamResponse.BacSiGoiYItem item = new BacSiGoiYDaTungKhamResponse.BacSiGoiYItem();
            item.setMaBacSi(doctor.getMaNv()); item.setHoTenBacSi(doctor.getNhanVien().getHoTen());
            item.setChuyenKhoa(doctor.getChuyenKhoa()); item.setBangCap(doctor.getBangCap());
            Object[] row = history.get(doctor.getMaNv()); item.setSoLanKhamTruoc(row == null ? 0 : ((Number) row[4]).intValue());
            item.setNgayKhamGanNhat(row == null ? null : (LocalDate) row[5]); response.getDanhSachBacSi().add(item);
        }
        response.getDanhSachBacSi().sort(Comparator.comparing(BacSiGoiYDaTungKhamResponse.BacSiGoiYItem::getSoLanKhamTruoc).reversed()
                .thenComparing(BacSiGoiYDaTungKhamResponse.BacSiGoiYItem::getNgayKhamGanNhat, Comparator.nullsLast(Comparator.reverseOrder()))
                .thenComparing(BacSiGoiYDaTungKhamResponse.BacSiGoiYItem::getHoTenBacSi));
        response.setThongBao("Danh sách bác sĩ, ưu tiên bác sĩ đã từng khám."); return response;
    }

    @Override
    @Transactional(readOnly = true)
    public com.medicare.clinic.dto.response.LichKhamKhungGioResponse khungGioTrong(String doctor, LocalDate date) {
        if (doctor == null || doctor.isBlank() || !bacSiRepository.existsById(doctor.trim()))
            throw new IllegalArgumentException("Không tìm thấy bác sĩ đã chọn.");
        validateDate(date); LocalDateTime now = LocalDateTime.now(ZONE_VIETNAM);
        List<LocalTime> times = freeTimes(doctor.trim(), date, now); List<LocalDate> days = new ArrayList<>();
        if (times.isEmpty()) for (int offset=1; offset<=14 && days.size()<5; offset++) {
            LocalDate candidate=date.plusDays(offset); if(candidate.getYear()>9999) break;
            if(!freeTimes(doctor.trim(),candidate,now).isEmpty()) days.add(candidate);
        }
        return new com.medicare.clinic.dto.response.LichKhamKhungGioResponse(doctor.trim(),date,times,days);
    }
    private List<LocalTime> freeTimes(String doctor, LocalDate date, LocalDateTime now) {
        Set<LocalTime> occupied = new HashSet<>(lichKhamRepository.findOccupiedTimes(doctor,date,TrangThaiLichKham.DA_HUY));
        List<LocalTime> times = new ArrayList<>();
        for(LocalTime t=OPEN;t.isBefore(CLOSE);t=t.plusMinutes(SLOT_STEP_MINUTES))
            if(LocalDateTime.of(date,t).isAfter(now) && !occupied.contains(t)) times.add(t);
        return times;
    }

    private void validateSlotRequest(String maBacSi, LocalDate ngayKham, LocalTime gioKham) {
        if (maBacSi == null || maBacSi.isBlank()) throw new IllegalArgumentException("Mã bác sĩ không được để trống.");
        validateDate(ngayKham); validateTime(gioKham);
        if (isInPast(ngayKham, gioKham)) throw new IllegalArgumentException("Không thể đặt lịch vào thời điểm đã qua.");
    }

    private void validateDate(LocalDate day) {
        if (day == null || day.isBefore(LocalDate.now(ZONE_VIETNAM)) || day.getYear() > 9999)
            throw new IllegalArgumentException("Ngày khám không hợp lệ hoặc đã qua.");
    }
    private void validateTime(LocalTime time) {
        if (time == null || time.isBefore(OPEN) || !time.isBefore(CLOSE) || time.getMinute() % SLOT_STEP_MINUTES != 0
                || time.getSecond() != 0 || time.getNano() != 0)
            throw new IllegalArgumentException("Giờ khám phải từ 07:00 đến 15:50, cách nhau 10 phút.");
    }
    private void validatePatient(BenhNhan patient) {
        if (patient.getHoTen() == null || patient.getHoTen().isBlank() || patient.getNgaySinh() == null
                || patient.getNgaySinh().isAfter(LocalDate.now(ZONE_VIETNAM)) || patient.getGioiTinh() == null
                || patient.getSoDienThoai() == null || patient.getSoDienThoai().isBlank())
            throw new IllegalArgumentException("Vui lòng cập nhật đầy đủ hồ sơ bệnh nhân trước khi đặt lịch.");
    }

    private boolean isInPast(LocalDate date, LocalTime time) {
        return LocalDateTime.of(date, time).isBefore(LocalDateTime.now(ZONE_VIETNAM));
    }

    private boolean isSlotBooked(String maBacSi, LocalDate date, LocalTime time) {
        return lichKhamRepository.existsByBacSi_MaNvAndNgayKhamAndGioKhamAndTrangThaiNot(
                maBacSi, date, time, TrangThaiLichKham.DA_HUY);
    }

    private void ensureSlotAvailable(String maBacSi, LocalDate date, LocalTime time) {
        if (isSlotBooked(maBacSi, date, time)) {
            throw new IllegalStateException("Khung giờ vừa được đặt bởi lịch khác. Hãy chọn khung giờ khác.");
        }
    }

    private void requirePatientId(String idBenhNhan) {
        if (idBenhNhan == null || idBenhNhan.isBlank())
            throw new IllegalArgumentException("Tài khoản hiện tại chưa được liên kết với hồ sơ bệnh nhân.");
    }

    private void validateLimit(int limit, String label) {
        if (limit < 1 || limit > MAX_RESULT_LIMIT)
            throw new IllegalArgumentException(label + " phải nằm trong khoảng 1 đến " + MAX_RESULT_LIMIT + ".");
    }

    private LichKhamDatTrucTuyenResponse toOnlineResponse(LichKham lk, String message) {
        LichKhamDatTrucTuyenResponse r = new LichKhamDatTrucTuyenResponse();
        r.setThongBao(message); r.setIdLichKham(lk.getIdLichKham());
        r.setIdBenhNhan(lk.getBenhNhan().getIdBenhNhan()); r.setHoTenBenhNhan(lk.getBenhNhan().getHoTen());
        r.setMaBacSi(lk.getBacSi().getMaNv());
        r.setHoTenBacSi(lk.getBacSi().getNhanVien() == null ? null : lk.getBacSi().getNhanVien().getHoTen());
        r.setNgayKham(lk.getNgayKham()); r.setGioKham(lk.getGioKham());
        r.setTrangThai(lk.getTrangThai()); r.setPhuongThucDatLich(lk.getPhuongThucDatLich());
        return r;
    }

    private LichKhamDatTaiQuayResponse toDeskResponse(LichKham lk, String message) {
        LichKhamDatTaiQuayResponse r = new LichKhamDatTaiQuayResponse();
        r.setThongBao(message); r.setIdLichKham(lk.getIdLichKham());
        r.setIdBenhNhan(lk.getBenhNhan().getIdBenhNhan()); r.setHoTenBenhNhan(lk.getBenhNhan().getHoTen());
        r.setMaBacSi(lk.getBacSi().getMaNv());
        r.setHoTenBacSi(lk.getBacSi().getNhanVien() == null ? null : lk.getBacSi().getNhanVien().getHoTen());
        r.setNgayKham(lk.getNgayKham()); r.setGioKham(lk.getGioKham());
        r.setTrangThai(lk.getTrangThai()); r.setPhuongThucDatLich(lk.getPhuongThucDatLich());
        return r;
    }
}
