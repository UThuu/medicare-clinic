package com.medicare.clinic.service.impl;

import com.medicare.clinic.dto.response.DoctorScheduleResponse;
import com.medicare.clinic.entity.LichKham;
import com.medicare.clinic.entity.LuotKham;
import com.medicare.clinic.entity.SinhHieu;
import com.medicare.clinic.repository.LichKhamRepository;
import com.medicare.clinic.service.interfaces.IScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScheduleServiceImpl implements IScheduleService {

    private final LichKhamRepository lichKhamRepository;

    @Override
    @Transactional(readOnly = true)
    public List<DoctorScheduleResponse> getDoctorSchedule(String maNv, LocalDate ngayKham) {
        if (maNv == null || maNv.trim().isEmpty()) {
            throw new IllegalArgumentException("MA nhAn viAn (bAc s) khA'ng `c ` tr`ng");
        }
        if (ngayKham == null) {
            throw new IllegalArgumentException("NgAy khAm khA'ng `c ` tr`ng");
        }

        List<LichKham> lichKhams = lichKhamRepository.findScheduleByDoctorAndDate(maNv, ngayKham);

        return lichKhams.stream().map(lk -> {
            LuotKham luotKham = lk.getLuotKham();
            SinhHieu sinhHieu = luotKham != null ? luotKham.getSinhHieu() : null;

            return DoctorScheduleResponse.builder()
                    .idLichKham(lk.getIdLichKham())
                    .ngayKham(lk.getNgayKham())
                    .gioKham(lk.getGioKham())
                    .trangThaiLichKham(lk.getTrangThai())
                    .phuongThucDatLich(lk.getPhuongThucDatLich())
                    .idBenhNhan(lk.getBenhNhan() != null ? lk.getBenhNhan().getIdBenhNhan() : null)
                    .tenBenhNhan(lk.getBenhNhan() != null ? lk.getBenhNhan().getHoTen() : null)
                    .gioiTinh(lk.getBenhNhan() != null ? lk.getBenhNhan().getGioiTinh() : null)
                    .ngaySinh(lk.getBenhNhan() != null ? lk.getBenhNhan().getNgaySinh() : null)
                    .soDienThoai(lk.getBenhNhan() != null ? lk.getBenhNhan().getSoDienThoai() : null)
                    .idLuotKham(luotKham != null ? luotKham.getIdLuotKham() : null)
                    .trangThaiLuotKham(luotKham != null ? luotKham.getTrangThai() : null)
                    .lyDoKham(luotKham != null ? luotKham.getLyDoKham() : null)
                    .huyetApTamThu(sinhHieu != null ? sinhHieu.getHuyetApTamThu() : null)
                    .huyetApTamTruong(sinhHieu != null ? sinhHieu.getHuyetApTamTruong() : null)
                    .nhietDo(sinhHieu != null ? sinhHieu.getNhietDo() : null)
                    .canNang(sinhHieu != null ? sinhHieu.getCanNang() : null)
                    .thoiDiemDoSinhHieu(sinhHieu != null ? sinhHieu.getThoiDiemDo() : null)
                    .build();
        }).collect(Collectors.toList());
    }
}
