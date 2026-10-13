package com.medicare.clinic.service.impl;

import com.medicare.clinic.dto.request.BenhNhanTimKiemRequest;
import com.medicare.clinic.dto.request.BenhNhanTaoMoiRequest;
import com.medicare.clinic.dto.response.BenhNhanTaoMoiResponse;
import java.util.UUID;
import com.medicare.clinic.dto.response.BenhNhanTimKiemResponse;
import com.medicare.clinic.entity.BenhNhan;
import com.medicare.clinic.repository.BenhNhanRepository;
import com.medicare.clinic.service.interfaces.IBenhNhanService;
import com.medicare.clinic.dto.request.BenhNhanThongBaoLichKhamRequest;
import com.medicare.clinic.dto.response.BenhNhanThongBaoLichKhamResponse;
import com.medicare.clinic.entity.LichKham;
import com.medicare.clinic.entity.enums.TrangThaiLichKham;
import com.medicare.clinic.repository.LichKhamRepository;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Locale;

import com.medicare.clinic.dto.response.HoSoYTeCaNhanResponse;
import com.medicare.clinic.dto.response.MedicalRecordResponse;
import com.medicare.clinic.entity.*;
import com.medicare.clinic.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.util.Collections;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class BenhNhanService implements IBenhNhanService {

    private static final ZoneId ZONE_VIETNAM = ZoneId.of("Asia/Ho_Chi_Minh");
    private final BenhNhanRepository benhNhanRepository;
    private final LichKhamRepository lichKhamRepository;
    private final LuotKhamRepository luotKhamRepository;
    private final BenhNhanDiUngRepository benhNhanDiUngRepository;
    private final SinhHieuRepository sinhHieuRepository;
    private final DonThuocRepository donThuocRepository;

    @org.springframework.beans.factory.annotation.Autowired
    public BenhNhanService(BenhNhanRepository benhNhanRepository,
                           LichKhamRepository lichKhamRepository,
                           LuotKhamRepository luotKhamRepository,
                           BenhNhanDiUngRepository benhNhanDiUngRepository,
                           SinhHieuRepository sinhHieuRepository,
                           DonThuocRepository donThuocRepository) {
        this.benhNhanRepository = benhNhanRepository;
        this.lichKhamRepository = lichKhamRepository;
        this.luotKhamRepository = luotKhamRepository;
        this.benhNhanDiUngRepository = benhNhanDiUngRepository;
        this.sinhHieuRepository = sinhHieuRepository;
        this.donThuocRepository = donThuocRepository;
    }

    public BenhNhanService(BenhNhanRepository benhNhanRepository, LichKhamRepository lichKhamRepository) {
        this(benhNhanRepository, lichKhamRepository, null, null, null, null);
    }

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
                .findNotificationAppointments(idBenhNhan);
        return buildNotifications(appointments, now);
    }

    BenhNhanThongBaoLichKhamResponse buildNotifications(List<LichKham> appointments, LocalDateTime now) {
        BenhNhanThongBaoLichKhamResponse response = new BenhNhanThongBaoLichKhamResponse();
        response.setThoiDiemTruyVan(now);

        for (LichKham appointment : appointments) {
            LocalDateTime appointmentAt = LocalDateTime.of(appointment.getNgayKham(), appointment.getGioKham());
            if (!appointmentAt.isAfter(now)) continue;
            if (appointment.getTrangThai() == TrangThaiLichKham.DA_HUY) {
                BenhNhanThongBaoLichKhamResponse.ThongBaoLichKhamItem cancelled = new BenhNhanThongBaoLichKhamResponse.ThongBaoLichKhamItem();
                cancelled.setIdLichKham(appointment.getIdLichKham()); cancelled.setLoaiThongBao("HUY_LICH");
                cancelled.setTieuDe("Hủy lịch khám");
                cancelled.setNoiDung("Lịch khám ngày " + appointment.getNgayKham() + " lúc " + appointment.getGioKham() + " đã được hủy.");
                fillAppointmentDetails(cancelled, appointment);
                response.getDanhSachThongBao().add(cancelled);
                continue;
            }


            BenhNhanThongBaoLichKhamResponse.ThongBaoLichKhamItem confirmation = new BenhNhanThongBaoLichKhamResponse.ThongBaoLichKhamItem();
            confirmation.setIdLichKham(appointment.getIdLichKham()); confirmation.setLoaiThongBao("XAC_NHAN_DAT_LICH");
            confirmation.setTieuDe("Xác nhận lịch khám");
            confirmation.setNoiDung("Lịch khám của bạn đã được ghi nhận vào ngày " + appointment.getNgayKham() + " lúc " + appointment.getGioKham() + ".");
            fillAppointmentDetails(confirmation, appointment);
            response.getDanhSachThongBao().add(confirmation);

            // Because LichKham has no createdAt field, these are dynamically reconstructed reminders, not sent/persisted events.
            if (!now.isBefore(appointmentAt.minusDays(1))) {
                BenhNhanThongBaoLichKhamResponse.ThongBaoLichKhamItem reminder = new BenhNhanThongBaoLichKhamResponse.ThongBaoLichKhamItem();
                reminder.setIdLichKham(appointment.getIdLichKham()); reminder.setLoaiThongBao("NHAC_LICH_1_NGAY");
                reminder.setTieuDe("Nhắc lịch khám trước 1 ngày");
                reminder.setNoiDung("Bạn có lịch khám vào ngày " + appointment.getNgayKham() + " lúc " + appointment.getGioKham() + ".");
                reminder.setThoiDiemNhac(appointmentAt.minusDays(1)); fillAppointmentDetails(reminder, appointment);
                response.getDanhSachThongBao().add(reminder);
            }
            if (!now.isBefore(appointmentAt.minusHours(2))) {
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

    @Override
    @Transactional(readOnly = true)
    public HoSoYTeCaNhanResponse layHoSoYTeCaNhan(String idBenhNhan) {
        if (idBenhNhan == null || idBenhNhan.trim().isEmpty()) {
            throw new IllegalArgumentException("Mã bệnh nhân không được để trống.");
        }

        BenhNhan patient = benhNhanRepository.findById(idBenhNhan.trim())
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Không tìm thấy hồ sơ bệnh nhân."));

        // Thông tin hành chính
        HoSoYTeCaNhanResponse.ThongTinBenhNhanDTO patientDTO = HoSoYTeCaNhanResponse.ThongTinBenhNhanDTO.builder()
                .idBenhNhan(patient.getIdBenhNhan())
                .hoTen(patient.getHoTen())
                .ngaySinh(patient.getNgaySinh())
                .gioiTinh(patient.getGioiTinh())
                .soDienThoai(patient.getSoDienThoai())
                .diaChi(patient.getDiaChi())
                .build();

        // Tiền sử dị ứng
        List<BenhNhanDiUng> diUngList = benhNhanDiUngRepository.findByBenhNhan_IdBenhNhan(patient.getIdBenhNhan());
        List<HoSoYTeCaNhanResponse.DiUngDTO> diUngDTOs = diUngList.stream()
                .map(d -> HoSoYTeCaNhanResponse.DiUngDTO.builder()
                        .thanhPhan(d.getId() != null ? d.getId().getThanhPhan() : "")
                        .ghiChu(d.getGhiChu())
                        .build())
                .collect(Collectors.toList());

        // Sinh hiệu
        List<SinhHieu> vitalsList = sinhHieuRepository.findLatestByBenhNhanId(patient.getIdBenhNhan(), org.springframework.data.domain.Pageable.unpaged());
        List<HoSoYTeCaNhanResponse.SinhHieuDTO> sinhHieuDTOs = vitalsList.stream()
                .map(sh -> HoSoYTeCaNhanResponse.SinhHieuDTO.builder()
                        .idLuotKham(sh.getLuotKham() != null ? sh.getLuotKham().getIdLuotKham() : null)
                        .huyetApTamThu(sh.getHuyetApTamThu())
                        .huyetApTamTruong(sh.getHuyetApTamTruong())
                        .canNang(sh.getCanNang())
                        .nhietDo(sh.getNhietDo())
                        .thoiDiemDo(sh.getThoiDiemDo())
                        .build())
                .collect(Collectors.toList());

        Map<String, HoSoYTeCaNhanResponse.SinhHieuDTO> vitalsMap = sinhHieuDTOs.stream()
                .filter(sh -> sh.getIdLuotKham() != null)
                .collect(Collectors.toMap(
                        HoSoYTeCaNhanResponse.SinhHieuDTO::getIdLuotKham,
                        sh -> sh,
                        (existing, replacement) -> existing));

        // Lịch sử khám
        List<LuotKham> visits = luotKhamRepository.findAllByBenhNhanId(patient.getIdBenhNhan());
        List<String> visitIds = visits.stream().map(LuotKham::getIdLuotKham).collect(Collectors.toList());

        Map<String, DonThuoc> donThuocMap = Collections.emptyMap();
        if (!visitIds.isEmpty()) {
            List<DonThuoc> donThuocList = donThuocRepository.findWithDetailsByLuotKham_IdLuotKhamIn(visitIds);
            donThuocMap = donThuocList.stream()
                    .filter(dt -> dt.getLuotKham() != null)
                    .collect(Collectors.toMap(
                            dt -> dt.getLuotKham().getIdLuotKham(),
                            dt -> dt,
                            (existing, replacement) -> existing));
        }

        final Map<String, DonThuoc> finalDonThuocMap = donThuocMap;
        List<HoSoYTeCaNhanResponse.LichSuKhamDTO> lichSuKhamDTOs = visits.stream().map(v -> {
            LichKham lk = v.getLichKham();
            String bacSiName = (lk != null && lk.getBacSi() != null && lk.getBacSi().getNhanVien() != null)
                    ? lk.getBacSi().getNhanVien().getHoTen() : "";
            String chuyenKhoa = (lk != null && lk.getBacSi() != null)
                    ? lk.getBacSi().getChuyenKhoa() : "";

            // REQ-014: Chỉ gắn đơn thuốc và kết quả chẩn đoán chính thức khi khám hoàn tất
            boolean isHoanTat = v.getTrangThai() == com.medicare.clinic.entity.enums.TrangThaiLuotKham.HOAN_TAT;
            HoSoYTeCaNhanResponse.DonThuocDTO donThuocDTO = null;

            if (isHoanTat && finalDonThuocMap.containsKey(v.getIdLuotKham())) {
                DonThuoc dt = finalDonThuocMap.get(v.getIdLuotKham());
                List<HoSoYTeCaNhanResponse.ChiTietThuocDTO> chiTietList = Collections.emptyList();
                if (dt.getChiTietDonThuocs() != null) {
                    chiTietList = dt.getChiTietDonThuocs().stream().map(ct -> {
                        Thuoc thuoc = ct.getThuoc();
                        return HoSoYTeCaNhanResponse.ChiTietThuocDTO.builder()
                                .idThuoc(thuoc != null ? thuoc.getIdThuoc() : null)
                                .tenThuoc(thuoc != null ? thuoc.getTenThuoc() : "Thuốc")
                                .donViTinh(thuoc != null ? thuoc.getDonViTinh() : "Đơn vị")
                                .soLuong(ct.getSoLuong())
                                .lieuLuong(ct.getLieuLuong())
                                .huongDanSuDung(ct.getHuongDanSuDung())
                                .donGia(ct.getDonGia())
                                .thanhTien(ct.tinhThanhTien())
                                .build();
                    }).collect(Collectors.toList());
                }

                donThuocDTO = HoSoYTeCaNhanResponse.DonThuocDTO.builder()
                        .idDonThuoc(dt.getId())
                        .ngayKe(dt.getNgayKe())
                        .ghiChu(dt.getGhiChu())
                        .chiTiet(chiTietList)
                        .build();
            }

            return HoSoYTeCaNhanResponse.LichSuKhamDTO.builder()
                    .idLuotKham(v.getIdLuotKham())
                    .idLichKham(lk != null ? lk.getIdLichKham() : null)
                    .ngayKham(lk != null ? lk.getNgayKham() : null)
                    .gioKham(lk != null ? lk.getGioKham() : null)
                    .tenBacSi(bacSiName)
                    .chuyenKhoa(chuyenKhoa)
                    .lyDoKham(v.getLyDoKham())
                    .trieuChung(v.getTrieuChung())
                    .chanDoan(v.getChanDoan())
                    .ketQuaKham(v.getKetQuaKham())
                    .trangThai(v.getTrangThai())
                    .sinhHieu(vitalsMap.get(v.getIdLuotKham()))
                    .donThuoc(donThuocDTO)
                    .build();
        }).collect(Collectors.toList());

        return HoSoYTeCaNhanResponse.builder()
                .benhNhan(patientDTO)
                .diUng(diUngDTOs)
                .sinhHieu(sinhHieuDTOs)
                .lichSuKham(lichSuKhamDTOs)
                .build();
    }

    @Override
    @Transactional
    public List<MedicalRecordResponse.AllergyInfo> themHoacCapNhatDiUng(String idBenhNhan, String thanhPhan, String ghiChu) {
        if (idBenhNhan == null || idBenhNhan.trim().isEmpty()) {
            throw new IllegalArgumentException("ID Bệnh nhân không được để trống");
        }
        if (thanhPhan == null || thanhPhan.trim().isEmpty()) {
            throw new IllegalArgumentException("Thành phần dị ứng không được để trống");
        }

        BenhNhan benhNhan = benhNhanRepository.findById(idBenhNhan.trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy hồ sơ bệnh nhân"));

        String sanitizedThanhPhan = thanhPhan.trim();
        BenhNhanDiUngId id = new BenhNhanDiUngId();
        id.setIdBenhNhan(benhNhan.getIdBenhNhan());
        id.setThanhPhan(sanitizedThanhPhan);

        BenhNhanDiUng diUng = benhNhanDiUngRepository.findById(id).orElseGet(() -> {
            BenhNhanDiUng newDu = new BenhNhanDiUng();
            newDu.setId(id);
            newDu.setBenhNhan(benhNhan);
            return newDu;
        });

        diUng.setGhiChu(ghiChu != null ? ghiChu.trim() : null);
        benhNhanDiUngRepository.save(diUng);

        return benhNhanDiUngRepository.findByBenhNhan_IdBenhNhan(benhNhan.getIdBenhNhan()).stream()
                .map(d -> MedicalRecordResponse.AllergyInfo.builder()
                        .thanhPhan(d.getId().getThanhPhan())
                        .ghiChu(d.getGhiChu())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public List<MedicalRecordResponse.AllergyInfo> xoaDiUng(String idBenhNhan, String thanhPhan) {
        if (idBenhNhan == null || idBenhNhan.trim().isEmpty()) {
            throw new IllegalArgumentException("ID Bệnh nhân không được để trống");
        }
        if (thanhPhan == null || thanhPhan.trim().isEmpty()) {
            throw new IllegalArgumentException("Thành phần dị ứng không được để trống");
        }

        BenhNhanDiUngId id = new BenhNhanDiUngId();
        id.setIdBenhNhan(idBenhNhan.trim());
        id.setThanhPhan(thanhPhan.trim());

        if (benhNhanDiUngRepository.existsById(id)) {
            benhNhanDiUngRepository.deleteById(id);
        }

        return benhNhanDiUngRepository.findByBenhNhan_IdBenhNhan(idBenhNhan.trim()).stream()
                .map(d -> MedicalRecordResponse.AllergyInfo.builder()
                        .thanhPhan(d.getId().getThanhPhan())
                        .ghiChu(d.getGhiChu())
                        .build())
                .collect(Collectors.toList());
    }
}
