package com.medicare.clinic.service.impl;

import com.medicare.clinic.dto.request.ChiTietDonThuocRequest;
import com.medicare.clinic.dto.request.DonThuocRequest;
import com.medicare.clinic.dto.response.CanhBaoDiUngResponse;
import com.medicare.clinic.dto.response.DonThuocResponse;
import com.medicare.clinic.dto.response.ThuocResponse;
import com.medicare.clinic.entity.*;
import com.medicare.clinic.repository.*;
import com.medicare.clinic.service.interfaces.IDonThuocService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Period;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class DonThuocService implements IDonThuocService {

    private final DonThuocRepository donThuocRepository;
    private final ChiTietDonThuocRepository chiTietDonThuocRepository;
    private final ThuocRepository thuocRepository;
    private final LuotKhamRepository luotKhamRepository;
    private final BenhNhanDiUngRepository benhNhanDiUngRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ThuocResponse> layDanhSachThuoc() {
        return thuocRepository.findAll().stream().map(thuoc -> {
            List<String> thanhPhans = thuoc.getThanhPhans() != null
                    ? thuoc.getThanhPhans().stream()
                        .map(tp -> tp.getId() != null ? tp.getId().getThanhPhan() : null)
                        .filter(Objects::nonNull)
                        .collect(Collectors.toList())
                    : Collections.emptyList();

            return ThuocResponse.builder()
                    .idThuoc(thuoc.getIdThuoc())
                    .tenThuoc(thuoc.getTenThuoc())
                    .donViTinh(thuoc.getDonViTinh())
                    .donGia(thuoc.getDonGia())
                    .thanhPhans(thanhPhans)
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CanhBaoDiUngResponse> kiemTraCanhBaoDiUng(String idLuotKham, List<String> danhSachIdThuoc) {
        if (idLuotKham == null || danhSachIdThuoc == null || danhSachIdThuoc.isEmpty()) {
            return Collections.emptyList();
        }

        LuotKham luotKham = timLuotKhamTheoIdHoacIdLichKham(idLuotKham);

        BenhNhan benhNhan = luotKham.getLichKham() != null ? luotKham.getLichKham().getBenhNhan() : null;
        if (benhNhan == null) {
            return Collections.emptyList();
        }

        List<BenhNhanDiUng> dsDiUng = benhNhanDiUngRepository.findByBenhNhan_IdBenhNhan(benhNhan.getIdBenhNhan());
        if (dsDiUng.isEmpty()) {
            return Collections.emptyList();
        }

        List<CanhBaoDiUngResponse> ketQua = new ArrayList<>();

        for (String idThuoc : danhSachIdThuoc) {
            Optional<Thuoc> thuocOpt = thuocRepository.findById(idThuoc);
            if (thuocOpt.isEmpty()) {
                continue;
            }
            Thuoc thuoc = thuocOpt.get();
            List<String> thanhPhanThuoc = thuoc.getThanhPhans() != null
                    ? thuoc.getThanhPhans().stream()
                        .map(tp -> tp.getId() != null ? tp.getId().getThanhPhan() : "")
                        .collect(Collectors.toList())
                    : Collections.emptyList();

            // So khớp từng thành phần dị ứng của bệnh nhân
            for (BenhNhanDiUng du : dsDiUng) {
                String tpDiUng = du.getId() != null ? du.getId().getThanhPhan() : "";
                if (tpDiUng == null || tpDiUng.trim().isEmpty()) continue;

                boolean biDiUng = thanhPhanThuoc.stream()
                        .anyMatch(tp -> tp.equalsIgnoreCase(tpDiUng.trim()) ||
                                tp.toLowerCase().contains(tpDiUng.toLowerCase()) ||
                                tpDiUng.toLowerCase().contains(tp.toLowerCase()));

                // Cũng kiểm tra nếu tên thuốc chứa trực tiếp tên thành phần dị ứng
                if (!biDiUng && thuoc.getTenThuoc().toLowerCase().contains(tpDiUng.toLowerCase())) {
                    biDiUng = true;
                }

                if (biDiUng) {
                    ketQua.add(CanhBaoDiUngResponse.builder()
                            .idThuoc(thuoc.getIdThuoc())
                            .tenThuoc(thuoc.getTenThuoc())
                            .thanhPhanTrung(tpDiUng)
                            .ghiChuDiUng(du.getGhiChu())
                            .coCanhBao(true)
                            .build());
                    break;
                }
            }
        }

        return ketQua;
    }

    @Override
    @Transactional(readOnly = true)
    public DonThuocResponse layThongTinKeDon(String idLuotKham) {
        LuotKham luotKham = timLuotKhamTheoIdHoacIdLichKham(idLuotKham);

        BenhNhan benhNhan = luotKham.getLichKham() != null ? luotKham.getLichKham().getBenhNhan() : null;
        BacSi bacSi = luotKham.getLichKham() != null ? luotKham.getLichKham().getBacSi() : null;

        DonThuocResponse response = new DonThuocResponse();
        response.setIdLuotKham(luotKham.getIdLuotKham());
        response.setLyDoKham(luotKham.getLyDoKham());
        response.setTrieuChung(luotKham.getTrieuChung());
        response.setChanDoan(luotKham.getChanDoan());
        response.setKetQuaKham(luotKham.getKetQuaKham());
        response.setTrangThaiLuotKham(luotKham.getTrangThai() != null ? luotKham.getTrangThai().name() : null);

        if (benhNhan != null) {
            response.setIdBenhNhan(benhNhan.getIdBenhNhan());
            response.setHoTenBenhNhan(benhNhan.getHoTen());
            response.setNgaySinhBenhNhan(benhNhan.getNgaySinh() != null ? benhNhan.getNgaySinh().toString() : null);
            if (benhNhan.getNgaySinh() != null) {
                response.setTuoiBenhNhan(Period.between(benhNhan.getNgaySinh(), LocalDate.now()).getYears());
            }
            response.setGioiTinhBenhNhan(benhNhan.getGioiTinh() != null ? benhNhan.getGioiTinh().name() : null);
            response.setSoDienThoaiBenhNhan(benhNhan.getSoDienThoai());
            response.setDiaChiBenhNhan(benhNhan.getDiaChi());

            List<BenhNhanDiUng> diUngs = benhNhanDiUngRepository.findByBenhNhan_IdBenhNhan(benhNhan.getIdBenhNhan());
            response.setDiUngs(diUngs.stream().map(du -> DonThuocResponse.DiUngItemResponse.builder()
                    .thanhPhan(du.getId() != null ? du.getId().getThanhPhan() : "")
                    .ghiChu(du.getGhiChu())
                    .build()).collect(Collectors.toList()));
        } else {
            response.setDiUngs(Collections.emptyList());
        }

        if (bacSi != null) {
            response.setMaBacSi(bacSi.getMaNv());
            response.setTenBacSi(bacSi.getNhanVien() != null ? bacSi.getNhanVien().getHoTen() : null);
        }

        // Kiểm tra xem đã có đơn thuốc trước đó chưa (dùng chính xác idLuotKham của lượt khám tìm được)
        Optional<DonThuoc> donThuocOpt = donThuocRepository.findByLuotKham_IdLuotKham(luotKham.getIdLuotKham());
        if (donThuocOpt.isPresent()) {
            DonThuoc donThuoc = donThuocOpt.get();
            response.setIdDonThuoc(donThuoc.getId());
            response.setNgayKe(donThuoc.getNgayKe());
            response.setGhiChu(donThuoc.getGhiChu());

            List<ChiTietDonThuoc> chiTiets = chiTietDonThuocRepository.findByDonThuoc_Id(donThuoc.getId());
            response.setChiTietDonThuoc(chiTiets.stream().map(ct -> {
                Thuoc thuoc = ct.getThuoc();
                return DonThuocResponse.ChiTietDonThuocItemResponse.builder()
                        .id(ct.getId())
                        .idThuoc(thuoc != null ? thuoc.getIdThuoc() : null)
                        .tenThuoc(thuoc != null ? thuoc.getTenThuoc() : null)
                        .donViTinh(thuoc != null ? thuoc.getDonViTinh() : null)
                        .soLuong(ct.getSoLuong())
                        .lieuLuong(ct.getLieuLuong())
                        .huongDanSuDung(ct.getHuongDanSuDung())
                        .donGia(ct.getDonGia())
                        .thanhTien(ct.tinhThanhTien())
                        .lyDoBoQuaCanhBao(ct.getLyDoBoQuaCanhBao())
                        .build();
            }).collect(Collectors.toList()));
        } else {
            response.setChiTietDonThuoc(new ArrayList<>());
        }

        return response;
    }

    @Override
    public DonThuocResponse taoDonThuoc(DonThuocRequest request) {
        if (request.getIdLuotKham() == null || request.getIdLuotKham().trim().isEmpty()) {
            throw new IllegalArgumentException("Mã lượt khám không được để trống.");
        }
        if (request.getChiTietDonThuoc() == null || request.getChiTietDonThuoc().isEmpty()) {
            throw new IllegalArgumentException("Đơn thuốc phải có ít nhất một loại thuốc.");
        }

        LuotKham luotKham = timLuotKhamTheoIdHoacIdLichKham(request.getIdLuotKham());

        Optional<DonThuoc> existing = donThuocRepository.findByLuotKham_IdLuotKham(luotKham.getIdLuotKham());
        if (existing.isPresent()) {
            throw new IllegalStateException("Lượt khám này đã có đơn thuốc (Mã: " + existing.get().getId() + "). Vui lòng sử dụng chức năng cập nhật.");
        }

        // Kiểm tra dị ứng thuốc theo quy tắc UC-13
        kiemTraVaValidateDiUng(luotKham, request.getChiTietDonThuoc());

        // Cập nhật trạng thái lượt khám sang HOAN_TAT (hoàn tất ca khám)
        luotKham.setTrangThai(com.medicare.clinic.entity.enums.TrangThaiLuotKham.HOAN_TAT);
        luotKhamRepository.save(luotKham);

        DonThuoc donThuoc = new DonThuoc();
        donThuoc.setId("DT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        donThuoc.setLuotKham(luotKham);
        donThuoc.setNgayKe(LocalDate.now());
        donThuoc.setGhiChu(request.getGhiChu() != null ? request.getGhiChu().trim() : null);

        DonThuoc savedDonThuoc = donThuocRepository.save(donThuoc);

        List<ChiTietDonThuoc> savedChiTiets = new ArrayList<>();
        int index = 1;
        for (ChiTietDonThuocRequest itemReq : request.getChiTietDonThuoc()) {
            ChiTietDonThuoc ct = taoChiTietDonThuoc(savedDonThuoc, itemReq, index++);
            savedChiTiets.add(chiTietDonThuocRepository.save(ct));
        }

        savedDonThuoc.setChiTietDonThuocs(savedChiTiets);
        return layThongTinKeDon(request.getIdLuotKham());
    }

    @Override
    public DonThuocResponse capNhatDonThuoc(String idDonThuoc, DonThuocRequest request) {
        if (idDonThuoc == null || idDonThuoc.trim().isEmpty()) {
            throw new IllegalArgumentException("Mã đơn thuốc không được để trống.");
        }
        if (request.getChiTietDonThuoc() == null || request.getChiTietDonThuoc().isEmpty()) {
            throw new IllegalArgumentException("Đơn thuốc phải có ít nhất một loại thuốc.");
        }

        DonThuoc donThuoc = donThuocRepository.findById(idDonThuoc)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy đơn thuốc: " + idDonThuoc));

        LuotKham luotKham = donThuoc.getLuotKham();

        // Kiểm tra dị ứng thuốc theo quy tắc UC-13
        kiemTraVaValidateDiUng(luotKham, request.getChiTietDonThuoc());

        donThuoc.setGhiChu(request.getGhiChu() != null ? request.getGhiChu().trim() : null);
        donThuocRepository.save(donThuoc);

        // Xóa chi tiết cũ và tạo mới danh sách chi tiết
        chiTietDonThuocRepository.deleteByDonThuoc_Id(idDonThuoc);

        List<ChiTietDonThuoc> updatedChiTiets = new ArrayList<>();
        int index = 1;
        for (ChiTietDonThuocRequest itemReq : request.getChiTietDonThuoc()) {
            ChiTietDonThuoc ct = taoChiTietDonThuoc(donThuoc, itemReq, index++);
            updatedChiTiets.add(chiTietDonThuocRepository.save(ct));
        }

        donThuoc.setChiTietDonThuocs(updatedChiTiets);
        return layThongTinKeDon(luotKham.getIdLuotKham());
    }

    @Override
    @Transactional(readOnly = true)
    public DonThuocResponse layDonThuocDeIn(String idDonThuoc) {
        DonThuoc donThuoc = donThuocRepository.findById(idDonThuoc)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy đơn thuốc: " + idDonThuoc));
        return layThongTinKeDon(donThuoc.getLuotKham().getIdLuotKham());
    }

    private ChiTietDonThuoc taoChiTietDonThuoc(DonThuoc donThuoc, ChiTietDonThuocRequest itemReq, int index) {
        if (itemReq.getIdThuoc() == null || itemReq.getIdThuoc().trim().isEmpty()) {
            throw new IllegalArgumentException("Thuốc thứ " + index + " không có mã thuốc hợp lệ.");
        }
        if (itemReq.getSoLuong() == null || itemReq.getSoLuong() <= 0) {
            throw new IllegalArgumentException("Số lượng thuốc thứ " + index + " phải lớn hơn 0.");
        }
        if (itemReq.getLieuLuong() == null || itemReq.getLieuLuong().trim().isEmpty()) {
            throw new IllegalArgumentException("Liều lượng của thuốc thứ " + index + " không được để trống.");
        }

        Thuoc thuoc = thuocRepository.findById(itemReq.getIdThuoc())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy thuốc: " + itemReq.getIdThuoc()));

        ChiTietDonThuoc ct = new ChiTietDonThuoc();
        ct.setId("CTDT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        ct.setDonThuoc(donThuoc);
        ct.setThuoc(thuoc);
        ct.setSoLuong(itemReq.getSoLuong());
        ct.setLieuLuong(itemReq.getLieuLuong().trim());
        ct.setHuongDanSuDung(itemReq.getHuongDanSuDung() != null ? itemReq.getHuongDanSuDung().trim() : "");
        ct.setDonGia(thuoc.getDonGia() != null ? thuoc.getDonGia() : (itemReq.getDonGia() != null ? itemReq.getDonGia() : BigDecimal.ZERO));
        ct.setLyDoBoQuaCanhBao(itemReq.getLyDoBoQuaCanhBao() != null ? itemReq.getLyDoBoQuaCanhBao().trim() : null);

        return ct;
    }

    private void kiemTraVaValidateDiUng(LuotKham luotKham, List<ChiTietDonThuocRequest> chiTiets) {
        if (luotKham == null || luotKham.getLichKham() == null || luotKham.getLichKham().getBenhNhan() == null) {
            return;
        }

        List<String> listIdThuoc = chiTiets.stream()
                .map(ChiTietDonThuocRequest::getIdThuoc)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        List<CanhBaoDiUngResponse> canhBaos = kiemTraCanhBaoDiUng(luotKham.getIdLuotKham(), listIdThuoc);
        if (canhBaos.isEmpty()) {
            return;
        }

        Map<String, CanhBaoDiUngResponse> warningMap = canhBaos.stream()
                .collect(Collectors.toMap(CanhBaoDiUngResponse::getIdThuoc, cb -> cb, (cb1, cb2) -> cb1));

        for (ChiTietDonThuocRequest item : chiTiets) {
            if (warningMap.containsKey(item.getIdThuoc())) {
                CanhBaoDiUngResponse warning = warningMap.get(item.getIdThuoc());
                // Quy tắc UC13: Bắt buộc lý do nếu tiếp tục kê thuốc có cảnh báo dị ứng
                if (item.getLyDoBoQuaCanhBao() == null || item.getLyDoBoQuaCanhBao().trim().isEmpty()) {
                    throw new IllegalArgumentException(
                            "Thuốc '" + warning.getTenThuoc() + "' gây cảnh báo dị ứng (" + warning.getThanhPhanTrung() +
                            "). Bác sĩ bắt buộc phải nhập lý do tiếp tục kê hoặc đổi sang thuốc khác.");
                }
            }
        }
    }

    private LuotKham timLuotKhamTheoIdHoacIdLichKham(String id) {
        if (id == null || id.trim().isEmpty()) {
            throw new IllegalArgumentException("Mã lượt khám hoặc lịch khám không được để trống.");
        }
        return luotKhamRepository.findById(id)
                .or(() -> luotKhamRepository.findByLichKham_IdLichKham(id))
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy lượt khám với mã: " + id));
    }
}
