package com.medicare.clinic.service.impl;

import com.medicare.clinic.dto.request.HoaDonTongDoanhThuRequest;
import com.medicare.clinic.dto.request.HoaDonTraCuuRequest;
import com.medicare.clinic.dto.response.HoaDonTongDoanhThuResponse;
import com.medicare.clinic.dto.response.HoaDonTraCuuResponse;
import com.medicare.clinic.entity.ChiTietHoaDon;
import com.medicare.clinic.entity.HoaDon;
import com.medicare.clinic.entity.LuotKham;
import com.medicare.clinic.entity.LichKham;
import com.medicare.clinic.entity.enums.TrangThaiHoaDon;
import com.medicare.clinic.repository.HoaDonRepository;
import com.medicare.clinic.service.interfaces.IHoaDonService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class HoaDonService implements IHoaDonService {

    private final HoaDonRepository hoaDonRepository;

    public HoaDonService(HoaDonRepository hoaDonRepository) {
        this.hoaDonRepository = hoaDonRepository;
    }

    /** UC22: Tra cứu hóa đơn theo các tiêu chí tùy chọn. */
    @Override
    public HoaDonTraCuuResponse traCuuHoaDon(HoaDonTraCuuRequest request) {
        Objects.requireNonNull(request, "Thông tin tra cứu hóa đơn không được để trống.");
        kiemTraKhoangNgay(request.getTuNgay(), request.getDenNgay());

        List<HoaDon> hoaDons = hoaDonRepository.findAll().stream()
                .filter(hd -> request.getIdHoaDon() == null
                        || request.getIdHoaDon().isBlank()
                        || hd.getId().toLowerCase().contains(request.getIdHoaDon().trim().toLowerCase()))
                .filter(hd -> request.getTrangThai() == null || hd.getTrangThai() == request.getTrangThai())
                .filter(hd -> request.getTuNgay() == null
                        || !hd.getNgayTao().toLocalDate().isBefore(request.getTuNgay()))
                .filter(hd -> request.getDenNgay() == null
                        || !hd.getNgayTao().toLocalDate().isAfter(request.getDenNgay()))
                .filter(hd -> {
                    String sdt = request.getSoDienThoaiBenhNhan();
                    if (sdt == null || sdt.isBlank()) return true;
                    LichKham lichKham = layLichKham(hd);
                    return lichKham != null
                            && lichKham.getBenhNhan() != null
                            && lichKham.getBenhNhan().getSoDienThoai() != null
                            && lichKham.getBenhNhan().getSoDienThoai().contains(sdt.trim());
                })
                .collect(Collectors.toList());

        HoaDonTraCuuResponse response = new HoaDonTraCuuResponse();
        response.setTongSoKetQua(hoaDons.size());
        response.setThongBao(hoaDons.isEmpty()
                ? "Không tìm thấy hóa đơn phù hợp."
                : "Tìm thấy " + hoaDons.size() + " hóa đơn.");
        response.setDanhSachHoaDon(hoaDons.stream()
                .map(this::chuyenHoaDonSangItem)
                .collect(Collectors.toList()));
        return response;
    }

    /** UC23: Tính tổng doanh thu từ hóa đơn đã thanh toán trong khoảng ngày, tính cả hai ngày. */
    @Override
    public HoaDonTongDoanhThuResponse xemTongDoanhThu(HoaDonTongDoanhThuRequest request) {
        Objects.requireNonNull(request, "Thông tin thống kê doanh thu không được để trống.");
        if (request.getTuNgay() == null || request.getDenNgay() == null) {
            throw new IllegalArgumentException("Vui lòng cung cấp cả từ ngày và đến ngày.");
        }
        kiemTraKhoangNgay(request.getTuNgay(), request.getDenNgay());

        LocalDateTime tuThoiDiem = request.getTuNgay().atStartOfDay();
        // Cận trên exclusive để lấy toàn bộ ngày denNgay, kể cả 23:59:59.999...
        LocalDateTime denThoiDiemExclusive = request.getDenNgay().plusDays(1).atStartOfDay();

        List<HoaDon> hoaDonDaThanhToan = hoaDonRepository
                .findByTrangThaiAndNgayTaoGreaterThanEqualAndNgayTaoLessThan(
                        TrangThaiHoaDon.DA_THANH_TOAN,
                        tuThoiDiem,
                        denThoiDiemExclusive
                );

        BigDecimal tongDoanhThu = hoaDonDaThanhToan.stream()
                .map(HoaDon::getTongTien)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        HoaDonTongDoanhThuResponse response = new HoaDonTongDoanhThuResponse();
        response.setTuNgay(request.getTuNgay());
        response.setDenNgay(request.getDenNgay());
        response.setTongDoanhThu(tongDoanhThu);
        response.setSoHoaDonDaThanhToan(hoaDonDaThanhToan.size());
        response.setThongBao(hoaDonDaThanhToan.isEmpty()
                ? "Không có hóa đơn đã thanh toán trong khoảng thời gian này."
                : "Thống kê doanh thu thành công.");
        return response;
    }

    private void kiemTraKhoangNgay(LocalDate tuNgay, LocalDate denNgay) {
        if (tuNgay != null && denNgay != null && tuNgay.isAfter(denNgay)) {
            throw new IllegalArgumentException("Từ ngày không được sau đến ngày.");
        }
    }

    private LichKham layLichKham(HoaDon hoaDon) {
        LuotKham luotKham = hoaDon.getLuotKham();
        return luotKham == null ? null : luotKham.getLichKham();
    }

    private HoaDonTraCuuResponse.HoaDonItem chuyenHoaDonSangItem(HoaDon hoaDon) {
        HoaDonTraCuuResponse.HoaDonItem item = new HoaDonTraCuuResponse.HoaDonItem();
        item.setIdHoaDon(hoaDon.getId());
        item.setNgayTao(hoaDon.getNgayTao());
        item.setTongTien(hoaDon.getTongTien());
        item.setTrangThai(hoaDon.getTrangThai());

        if (hoaDon.getLuotKham() != null) {
            item.setIdLuotKham(hoaDon.getLuotKham().getIdLuotKham());
            LichKham lichKham = hoaDon.getLuotKham().getLichKham();
            if (lichKham != null) {
                if (lichKham.getBenhNhan() != null) {
                    item.setIdBenhNhan(lichKham.getBenhNhan().getIdBenhNhan());
                    item.setHoTenBenhNhan(lichKham.getBenhNhan().getHoTen());
                    item.setSoDienThoaiBenhNhan(lichKham.getBenhNhan().getSoDienThoai());
                }
                if (lichKham.getBacSi() != null) {
                    item.setMaBacSi(lichKham.getBacSi().getMaNv());
                    if (lichKham.getBacSi().getNhanVien() != null) {
                        item.setTenBacSi(lichKham.getBacSi().getNhanVien().getHoTen());
                    }
                }
            }
        }

        if (hoaDon.getThuNgan() != null && hoaDon.getThuNgan().getNhanVien() != null) {
            item.setHoTenThuNgan(hoaDon.getThuNgan().getNhanVien().getHoTen());
        }

        List<HoaDonTraCuuResponse.ChiTietHoaDonItem> chiTietItems = hoaDon.getChiTietHoaDons() == null
                ? List.of()
                : hoaDon.getChiTietHoaDons().stream().map(this::chuyenChiTietSangItem)
                    .collect(Collectors.toList());
        item.setChiTietHoaDon(chiTietItems);
        return item;
    }

    private HoaDonTraCuuResponse.ChiTietHoaDonItem chuyenChiTietSangItem(ChiTietHoaDon chiTiet) {
        HoaDonTraCuuResponse.ChiTietHoaDonItem item = new HoaDonTraCuuResponse.ChiTietHoaDonItem();
        item.setLoaiChiPhi(chiTiet.getLoaiChiPhi());
        item.setMoTa(chiTiet.getMoTa());
        item.setSoLuong(chiTiet.getSoLuong());
        item.setDonGia(chiTiet.getDonGia());
        item.setThanhTien(chiTiet.getThanhTien());
        return item;
    }
}
