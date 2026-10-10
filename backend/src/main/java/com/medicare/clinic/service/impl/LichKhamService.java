package com.medicare.clinic.service.impl;

import com.medicare.clinic.dto.request.BacSiGoiYDaTungKhamRequest;
import com.medicare.clinic.dto.request.LichKhamDatTaiQuayRequest;
import com.medicare.clinic.dto.request.LichKhamDatTrucTuyenRequest;
import com.medicare.clinic.dto.request.LichKhamGoiYKhungGioThayTheRequest;
import com.medicare.clinic.dto.request.LichKhamKiemTraTrongRequest;
import com.medicare.clinic.dto.response.BacSiGoiYDaTungKhamResponse;
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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LichKhamService implements ILichKhamService {

    private static final ZoneId ZONE_VIETNAM = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final int DEFAULT_DOCTOR_LIMIT = 5;
    private static final int DEFAULT_SLOT_LIMIT = 5;
    private static final int MAX_RESULT_LIMIT = 20;
    // Mỗi bước gợi ý cách nhau 30 phút vì hệ thống hiện chưa có cấu hình thời lượng khám.
    private static final int SLOT_STEP_MINUTES = 30;

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
            item.setSoLanKham(((Number) row[4]).intValue());
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
        validateSlotRequest(request.getMaBacSi(), request.getNgayKham(), request.getGioKhamMongMuon());
        String maBacSi = request.getMaBacSi().trim();
        BacSi bacSi = bacSiRepository.findById(maBacSi)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bác sĩ có mã: " + maBacSi));
        int limit = request.getSoLuongGoiY() == null ? DEFAULT_SLOT_LIMIT : request.getSoLuongGoiY();
        validateLimit(limit, "Số lượng khung giờ gợi ý");

        List<LocalTime> candidates = new ArrayList<>();
        int requestedMinute = request.getGioKhamMongMuon().getHour() * 60
                + request.getGioKhamMongMuon().getMinute();
        for (int step = 1; step <= 8; step++) {
            int delta = step * SLOT_STEP_MINUTES;
            int earlier = requestedMinute - delta;
            int later = requestedMinute + delta;
            if (earlier >= 0) candidates.add(LocalTime.of(earlier / 60, earlier % 60));
            if (later < 24 * 60) candidates.add(LocalTime.of(later / 60, later % 60));
        }
        candidates.sort(Comparator.comparingLong(t -> Math.abs(
                (long) (t.getHour() * 60 + t.getMinute()) - requestedMinute)));

        LichKhamGoiYKhungGioThayTheResponse response = new LichKhamGoiYKhungGioThayTheResponse();
        for (LocalTime candidate : candidates) {
            if (isInPast(request.getNgayKham(), candidate)) continue;
            if (!isSlotBooked(maBacSi, request.getNgayKham(), candidate)) {
                LichKhamGoiYKhungGioThayTheResponse.KhungGioGoiYItem item =
                        new LichKhamGoiYKhungGioThayTheResponse.KhungGioGoiYItem();
                item.setMaBacSi(bacSi.getMaNv());
                item.setHoTenBacSi(bacSi.getNhanVien() == null ? null : bacSi.getNhanVien().getHoTen());
                item.setChuyenKhoa(bacSi.getChuyenKhoa());
                item.setNgayKham(request.getNgayKham());
                item.setGioKham(candidate);
                response.getDanhSachKhungGio().add(item);
                if (response.getDanhSachKhungGio().size() >= limit) break;
            }
        }
        response.setThongBao(response.getDanhSachKhungGio().isEmpty()
                ? "Không tìm thấy khung giờ thay thế gần thời gian đã chọn. Hãy chọn ngày hoặc giờ khác."
                : "Các khung giờ thay thế được sắp xếp theo khoảng cách gần nhất với giờ đã chọn.");
        return response;
    }

    @Override
    @Transactional
    public LichKhamDatTrucTuyenResponse datLichKhamTrucTuyen(
            String idBenhNhan, LichKhamDatTrucTuyenRequest request) {
        requirePatientId(idBenhNhan);
        if (request == null) throw new IllegalArgumentException("Dữ liệu đặt lịch không được để trống.");
        validateSlotRequest(request.getMaBacSi(), request.getNgayKham(), request.getGioKham());
        BenhNhan benhNhan = benhNhanRepository.findById(idBenhNhan)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ bệnh nhân đang đăng nhập."));
        BacSi bacSi = bacSiRepository.findById(request.getMaBacSi().trim())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bác sĩ đã chọn."));
        ensureSlotAvailable(request.getMaBacSi().trim(), request.getNgayKham(), request.getGioKham());

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

    @Override
    @Transactional
    public LichKhamDatTaiQuayResponse datLichKhamTaiQuay(LichKhamDatTaiQuayRequest request) {
        if (request == null) throw new IllegalArgumentException("Dữ liệu đặt lịch không được để trống.");
        if (request.getIdBenhNhan() == null || request.getIdBenhNhan().isBlank())
            throw new IllegalArgumentException("Mã bệnh nhân không được để trống.");
        validateSlotRequest(request.getMaBacSi(), request.getNgayKham(), request.getGioKham());
        BenhNhan benhNhan = benhNhanRepository.findById(request.getIdBenhNhan().trim())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ bệnh nhân."));
        BacSi bacSi = bacSiRepository.findById(request.getMaBacSi().trim())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bác sĩ đã chọn."));
        ensureSlotAvailable(request.getMaBacSi().trim(), request.getNgayKham(), request.getGioKham());

        LichKham lichKham = new LichKham();
        lichKham.setIdLichKham(UUID.randomUUID().toString());
        lichKham.setBenhNhan(benhNhan);
        lichKham.setBacSi(bacSi);
        lichKham.setNgayKham(request.getNgayKham());
        lichKham.setGioKham(request.getGioKham());
        lichKham.setTrangThai(TrangThaiLichKham.DA_DAT);
        lichKham.setPhuongThucDatLich(PhuongThucDatLich.TRUC_TIEP);
        return toDeskResponse(lichKhamRepository.save(lichKham), "Đặt lịch khám tại quầy thành công.");
    }

    private void validateSlotRequest(String maBacSi, LocalDate ngayKham, LocalTime gioKham) {
        if (maBacSi == null || maBacSi.isBlank()) throw new IllegalArgumentException("Mã bác sĩ không được để trống.");
        if (ngayKham == null) throw new IllegalArgumentException("Ngày khám không được để trống.");
        if (gioKham == null) throw new IllegalArgumentException("Giờ khám không được để trống.");
        if (isInPast(ngayKham, gioKham)) throw new IllegalArgumentException("Không thể đặt lịch vào thời điểm đã qua.");
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
