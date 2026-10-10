package com.medicare.clinic.service.impl;

import com.medicare.clinic.dto.request.XacNhanThanhToanRequest;
import com.medicare.clinic.dto.response.*;
import com.medicare.clinic.entity.*;
import com.medicare.clinic.repository.*;
import com.medicare.clinic.service.interfaces.IHoaDonService;
import com.medicare.clinic.service.interfaces.IThanhToanService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ThanhToanService implements IThanhToanService {

    private final HoaDonRepository hoaDonRepository;
    private final ThanhToanRepository thanhToanRepository;
    private final GiaoDichThanhToanRepository giaoDichThanhToanRepository;
    private final LuotKhamRepository luotKhamRepository;
    private final IHoaDonService hoaDonService;

    @Override
    @Transactional(readOnly = true)
    public List<HoaDonResponse> layDanhSachHoaDonChuaThanhToan() {
        return hoaDonRepository.findAll().stream()
                .filter(hd -> "CHUA_THANH_TOAN".equalsIgnoreCase(hd.getTrangThai()))
                .map(this::chuyenThanhHoaDonResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ThongTinThanhToanResponse layThongTinThanhToan(String idHoaDon) {
        if (idHoaDon == null || idHoaDon.trim().isEmpty()) {
            throw new IllegalArgumentException("Mã hóa đơn không được để trống!");
        }

        HoaDon hoaDon = hoaDonRepository.findById(idHoaDon)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hóa đơn với mã: " + idHoaDon));

        LuotKham luotKham = hoaDon.getLuotKham();
        LichKham lichKham = (luotKham != null) ? luotKham.getLichKham() : null;
        BenhNhan bn = (lichKham != null) ? lichKham.getBenhNhan() : null;
        BacSi bs = (lichKham != null) ? lichKham.getBacSi() : null;

        // Lấy thông tin thanh toán hiện tại nếu có
        ThanhToan thanhToan = thanhToanRepository.findByHoaDon_Id(idHoaDon).orElse(null);
        String trangThaiThanhToan = (thanhToan != null) ? thanhToan.getTrangThai() : "CHUA_THANH_TOAN";

        // Lấy lịch sử giao dịch
        List<GiaoDichResponse> lichSuGiaoDich = layLichSuGiaoDich(idHoaDon);

        // Lấy bảng chi tiết khoản thu
        List<ChiTietKhoanThuDTO> danhSachChiTiet = new ArrayList<>();
        if (luotKham != null) {
            try {
                ChiPhiKhamPreviewResponse preview = hoaDonService.layChiPhiDuKien(luotKham.getIdLuotKham());
                danhSachChiTiet = preview.getDanhSachKhoanThu();
            } catch (Exception e) {
                log.warn("Không thể tải chi tiết khoản thu từ lượt khám: {}", e.getMessage());
            }
        }

        return ThongTinThanhToanResponse.builder()
                .idHoaDon(hoaDon.getId())
                .idThanhToan(thanhToan != null ? thanhToan.getId() : null)
                .idLuotKham(luotKham != null ? luotKham.getIdLuotKham() : null)
                .maBenhNhan(bn != null ? bn.getIdBenhNhan() : "")
                .tenBenhNhan(bn != null ? bn.getHoTen() : "Chưa rõ")
                .soDienThoai(bn != null ? bn.getSoDienThoai() : "")
                .diaChi(bn != null ? bn.getDiaChi() : "")
                .bacSiKham(bs != null ? bs.getHoTen() : "Bác sĩ phụ trách")
                .chuyenKhoa(bs != null ? bs.getChuyenKhoa() : "")
                .chanDoan(luotKham != null ? luotKham.getChanDoan() : "")
                .ngayLapHoaDon(hoaDon.getNgayTao())
                .phiKham(hoaDon.getPhiKham())
                .tienThuoc(hoaDon.getTienThuoc())
                .tongTien(hoaDon.getTongTien())
                .trangThaiHoaDon(hoaDon.getTrangThai())
                .trangThaiThanhToan(trangThaiThanhToan)
                .danhSachChiTiet(danhSachChiTiet)
                .lichSuGiaoDich(lichSuGiaoDich)
                .build();
    }

    @Override
    @Transactional
    public KetQuaThanhToanResponse xacNhanThanhToan(XacNhanThanhToanRequest request) {
        log.info("Bắt đầu xử lý xác nhận thanh toán cho hóa đơn: {}", request.getIdHoaDon());

        if (request.getIdHoaDon() == null || request.getIdHoaDon().trim().isEmpty()) {
            throw new IllegalArgumentException("Mã hóa đơn không được để trống!");
        }

        HoaDon hoaDon = hoaDonRepository.findById(request.getIdHoaDon())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hóa đơn với mã: " + request.getIdHoaDon()));

        // Chặn thanh toán lại nếu hóa đơn đã thanh toán hoàn tất
        if ("DA_THANH_TOAN".equalsIgnoreCase(hoaDon.getTrangThai())) {
            throw new IllegalStateException("Hóa đơn này đã được thanh toán hoàn tất trước đó! Không thể thanh toán lại.");
        }

        BigDecimal soTienThanhToan = request.getSoTien() != null ? request.getSoTien() : hoaDon.getTongTien();

        if (soTienThanhToan.compareTo(hoaDon.getTongTien()) < 0) {
            throw new IllegalArgumentException("Số tiền thanh toán (" + soTienThanhToan
                    + " đ) không được nhỏ hơn tổng tiền hóa đơn (" + hoaDon.getTongTien() + " đ)!");
        }

        // Tìm hoặc tạo mới bản ghi ThanhToan (1-1 với HoaDon)
        ThanhToan thanhToan = thanhToanRepository.findByHoaDon_Id(hoaDon.getId())
                .orElseGet(() -> {
                    ThanhToan tt = new ThanhToan();
                    tt.setId("TT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
                    tt.setHoaDon(hoaDon);
                    tt.setSoTien(hoaDon.getTongTien());
                    tt.setNgayTao(LocalDateTime.now());
                    tt.setTrangThai("DANG_XU_LY");
                    return thanhToanRepository.save(tt);
                });

        // Tạo 1 bản ghi GiaoDichThanhToan mới (1 attempt theo đúng yêu cầu SRS)
        String phuongThuc = (request.getPhuongThuc() != null && !request.getPhuongThuc().trim().isEmpty())
                ? request.getPhuongThuc().toUpperCase()
                : "TIEN_MAT";

        String maGiaoDich = (request.getMaGiaoDichNgoai() != null && !request.getMaGiaoDichNgoai().trim().isEmpty())
                ? request.getMaGiaoDichNgoai()
                : "GD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        GiaoDichThanhToan giaoDich = new GiaoDichThanhToan();
        giaoDich.setIdGiaoDich("GD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        giaoDich.setThanhToan(thanhToan);
        giaoDich.setMaGiaoDich(maGiaoDich);
        giaoDich.setPhuongThuc(phuongThuc);
        giaoDich.setSoTien(soTienThanhToan);
        giaoDich.setTrangThai("THANH_CONG");
        giaoDich.setThoiGian(LocalDateTime.now());
        giaoDichThanhToanRepository.save(giaoDich);

        // Cập nhật trạng thái ThanhToan -> THANH_CONG
        thanhToan.setTrangThai("THANH_CONG");
        thanhToanRepository.save(thanhToan);

        // Cập nhật trạng thái HoaDon -> DA_THANH_TOAN
        hoaDon.setTrangThai("DA_THANH_TOAN");
        hoaDonRepository.save(hoaDon);

        // Cập nhật trạng thái LuotKham -> HOAN_TAT
        LuotKham luotKham = hoaDon.getLuotKham();
        if (luotKham != null) {
            luotKham.setTrangThai("HOAN_TAT");
            luotKhamRepository.save(luotKham);
        }

        log.info("Xác nhận thanh toán thành công cho hóa đơn: {}, phương thức: {}, số tiền: {}",
                hoaDon.getId(), phuongThuc, soTienThanhToan);

        return KetQuaThanhToanResponse.builder()
                .idThanhToan(thanhToan.getId())
                .idGiaoDich(giaoDich.getIdGiaoDich())
                .maGiaoDich(giaoDich.getMaGiaoDich())
                .idHoaDon(hoaDon.getId())
                .phuongThuc(phuongThuc)
                .soTien(soTienThanhToan)
                .trangThai("THANH_CONG")
                .thoiGian(giaoDich.getThoiGian())
                .thongBao("Xác nhận thanh toán thành công cho hóa đơn " + hoaDon.getId())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<GiaoDichResponse> layLichSuGiaoDich(String idHoaDon) {
        if (idHoaDon == null || idHoaDon.trim().isEmpty()) {
            return new ArrayList<>();
        }

        return giaoDichThanhToanRepository.findByThanhToan_HoaDon_IdOrderByThoiGianDesc(idHoaDon)
                .stream()
                .map(gd -> GiaoDichResponse.builder()
                        .idGiaoDich(gd.getIdGiaoDich())
                        .maGiaoDich(gd.getMaGiaoDich())
                        .phuongThuc(gd.getPhuongThuc())
                        .soTien(gd.getSoTien())
                        .trangThai(gd.getTrangThai())
                        .thoiGian(gd.getThoiGian())
                        .build())
                .collect(Collectors.toList());
    }

    private HoaDonResponse chuyenThanhHoaDonResponse(HoaDon hd) {
        LuotKham lk = hd.getLuotKham();
        LichKham lkham = (lk != null) ? lk.getLichKham() : null;
        BenhNhan bn = (lkham != null) ? lkham.getBenhNhan() : null;
        BacSi bs = (lkham != null) ? lkham.getBacSi() : null;
        ThuNgan tn = hd.getThuNgan();

        return HoaDonResponse.builder()
                .idHoaDon(hd.getId())
                .idLuotKham(lk != null ? lk.getIdLuotKham() : "")
                .maBenhNhan(bn != null ? bn.getIdBenhNhan() : "")
                .tenBenhNhan(bn != null ? bn.getHoTen() : "Chưa rõ")
                .soDienThoai(bn != null ? bn.getSoDienThoai() : "")
                .diaChi(bn != null ? bn.getDiaChi() : "")
                .bacSiKham(bs != null ? bs.getHoTen() : "Bác sĩ phụ trách")
                .thuNganLap(tn != null ? tn.getHoTen() : "Thu ngân")
                .ngayTao(hd.getNgayTao())
                .phiKham(hd.getPhiKham())
                .tienThuoc(hd.getTienThuoc())
                .tongTien(hd.getTongTien())
                .trangThai(hd.getTrangThai())
                .build();
    }
}
