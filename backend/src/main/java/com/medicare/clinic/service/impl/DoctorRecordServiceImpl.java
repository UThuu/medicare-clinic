package com.medicare.clinic.service.impl;

import com.medicare.clinic.dto.record.MedicalRecordResponse;
import com.medicare.clinic.entity.*;
import com.medicare.clinic.repository.*;
import com.medicare.clinic.service.DoctorRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorRecordServiceImpl implements DoctorRecordService {

    private final LichKhamRepository lichKhamRepository;
    private final SinhHieuRepository sinhHieuRepository;
    private final LuotKhamRepository luotKhamRepository;
    private final BenhNhanDiUngRepository benhNhanDiUngRepository;
    private final DonThuocRepository donThuocRepository;

    @Override
    @Transactional(readOnly = true)
    public MedicalRecordResponse getMedicalRecord(String maNv, String idLichKham) {
        if (idLichKham == null || idLichKham.trim().isEmpty()) {
            throw new IllegalArgumentException("ID Lịch khám không được để trống");
        }

        LichKham lichKham = lichKhamRepository.findByIdWithDetails(idLichKham)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy lịch khám"));

        if (!lichKham.getBacSi().getMaNv().equals(maNv)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Không có quyền truy cập hồ sơ của lịch khám này");
        }

        BenhNhan benhNhan = lichKham.getBenhNhan();
        LuotKham luotKham = lichKham.getLuotKham(); // Co the null

        // Map Patient
        MedicalRecordResponse.PatientInfo patientInfo = MedicalRecordResponse.PatientInfo.builder()
                .idBenhNhan(benhNhan.getIdBenhNhan())
                .hoTen(benhNhan.getHoTen())
                .ngaySinh(benhNhan.getNgaySinh())
                .gioiTinh(benhNhan.getGioiTinh())
                .soDienThoai(benhNhan.getSoDienThoai())
                .diaChi(benhNhan.getDiaChi())
                .build();

        // Map Schedule
        MedicalRecordResponse.CurrentScheduleInfo scheduleInfo = MedicalRecordResponse.CurrentScheduleInfo.builder()
                .idLichKham(lichKham.getIdLichKham())
                .ngayKham(lichKham.getNgayKham())
                .gioKham(lichKham.getGioKham())
                .trangThai(lichKham.getTrangThai())
                .build();

        // Map Visit
        MedicalRecordResponse.CurrentVisitInfo visitInfo = null;
        if (luotKham != null) {
            visitInfo = MedicalRecordResponse.CurrentVisitInfo.builder()
                    .idLuotKham(luotKham.getIdLuotKham())
                    .trangThai(luotKham.getTrangThai())
                    .lyDoKham(luotKham.getLyDoKham())
                    .trieuChung(luotKham.getTrieuChung())
                    .chanDoan(luotKham.getChanDoan())
                    .ketQuaKham(luotKham.getKetQuaKham())
                    .build();
        }

        // Allergies
        List<BenhNhanDiUng> diUngEntities = benhNhanDiUngRepository.findByBenhNhan_IdBenhNhan(benhNhan.getIdBenhNhan());
        List<MedicalRecordResponse.AllergyInfo> allergyInfos = diUngEntities.stream()
                .map(d -> MedicalRecordResponse.AllergyInfo.builder()
                        .thanhPhan(d.getId().getThanhPhan())
                        .ghiChu(d.getGhiChu())
                        .build())
                .collect(Collectors.toList());

        // Current Vitals
        MedicalRecordResponse.VitalsInfo currentVitalsInfo = null;
        if (luotKham != null) {
            Optional<SinhHieu> sinhHieuOpt = sinhHieuRepository.findByLuotKham_IdLuotKham(luotKham.getIdLuotKham());
            if (sinhHieuOpt.isPresent()) {
                SinhHieu sh = sinhHieuOpt.get();
                currentVitalsInfo = MedicalRecordResponse.VitalsInfo.builder()
                        .huyetApTamThu(sh.getHuyetApTamThu())
                        .huyetApTamTruong(sh.getHuyetApTamTruong())
                        .canNang(sh.getCanNang())
                        .nhietDo(sh.getNhietDo())
                        .thoiDiemDo(sh.getThoiDiemDo())
                        .build();
            }
        }

        // Latest Vitals
        MedicalRecordResponse.LatestVitalsInfo latestVitalsInfo = null;
        List<SinhHieu> latestVitalsList = sinhHieuRepository.findLatestByBenhNhanId(benhNhan.getIdBenhNhan(), PageRequest.of(0, 1));
        if (!latestVitalsList.isEmpty()) {
            SinhHieu sh = latestVitalsList.get(0);
            latestVitalsInfo = MedicalRecordResponse.LatestVitalsInfo.builder()
                    .idLuotKhamNguon(sh.getLuotKham().getIdLuotKham())
                    .huyetApTamThu(sh.getHuyetApTamThu())
                    .huyetApTamTruong(sh.getHuyetApTamTruong())
                    .canNang(sh.getCanNang())
                    .nhietDo(sh.getNhietDo())
                    .thoiDiemDo(sh.getThoiDiemDo())
                    .build();
        }

        // History Vitals
        List<SinhHieu> allVitals = sinhHieuRepository.findLatestByBenhNhanId(benhNhan.getIdBenhNhan(), org.springframework.data.domain.Pageable.unpaged());
        List<MedicalRecordResponse.VitalsInfo> lichSuSinhHieu = allVitals.stream().map(sh -> MedicalRecordResponse.VitalsInfo.builder()
                .huyetApTamThu(sh.getHuyetApTamThu())
                .huyetApTamTruong(sh.getHuyetApTamTruong())
                .canNang(sh.getCanNang())
                .nhietDo(sh.getNhietDo())
                .thoiDiemDo(sh.getThoiDiemDo())
                .build()).collect(Collectors.toList());

        // History
        List<LuotKham> historyEntities = luotKhamRepository.findHistoryByBenhNhanId(benhNhan.getIdBenhNhan(), lichKham.getIdLichKham());
        
        List<MedicalRecordResponse.VisitHistoryInfo> historyInfos = Collections.emptyList();
        if (!historyEntities.isEmpty()) {
            List<String> historyLuotKhamIds = historyEntities.stream().map(LuotKham::getIdLuotKham).collect(Collectors.toList());
            List<DonThuoc> donThuocs = donThuocRepository.findByLuotKham_IdLuotKhamIn(historyLuotKhamIds);
            Map<String, DonThuoc> donThuocMap = donThuocs.stream().collect(Collectors.toMap(d -> d.getLuotKham().getIdLuotKham(), d -> d));

            historyInfos = historyEntities.stream().map(h -> {
                DonThuoc dt = donThuocMap.get(h.getIdLuotKham());
                return MedicalRecordResponse.VisitHistoryInfo.builder()
                        .idLuotKham(h.getIdLuotKham())
                        .ngayKham(h.getLichKham().getNgayKham())
                        .tenBacSi(h.getLichKham().getBacSi().getNhanVien().getHoTen())
                        .lyDoKham(h.getLyDoKham())
                        .trangThai(h.getTrangThai())
                        .chanDoan(h.getChanDoan())
                        .ketQuaKham(h.getKetQuaKham())
                        .coDonThuoc(dt != null)
                        .idDonThuoc(dt != null ? dt.getId() : null)
                        .build();
            }).collect(Collectors.toList());
        }

        return MedicalRecordResponse.builder()
                .benhNhan(patientInfo)
                .lichKhamHienTai(scheduleInfo)
                .luotKhamHienTai(visitInfo)
                .sinhHieuHienTai(currentVitalsInfo)
                .sinhHieuMoiNhat(latestVitalsInfo)
                .lichSuSinhHieu(lichSuSinhHieu)
                .diUng(allergyInfos)
                .lichSuKham(historyInfos)
                .build();
    }
}

