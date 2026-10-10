package com.medicare.clinic.service.impl;

import com.medicare.clinic.dto.request.TaoHoaDonRequest;
import com.medicare.clinic.dto.response.ChiPhiKhamPreviewResponse;
import com.medicare.clinic.dto.response.ChiTietKhoanThuDTO;
import com.medicare.clinic.dto.response.HoaDonResponse;
import com.medicare.clinic.dto.response.LuotKhamChoHoaDonResponse;
import com.medicare.clinic.dto.response.InHoaDonResponse;
import com.medicare.clinic.entity.*;
import com.medicare.clinic.repository.DonThuocRepository;
import com.medicare.clinic.repository.GiaoDichThanhToanRepository;
import com.medicare.clinic.repository.HoaDonRepository;
import com.medicare.clinic.repository.LuotKhamRepository;
import com.medicare.clinic.repository.ThanhToanRepository;
import com.medicare.clinic.repository.ThuNganRepository;
import com.medicare.clinic.service.interfaces.IHoaDonService;
import com.medicare.clinic.util.MoneyToWordsUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class HoaDonService implements IHoaDonService {

    private final HoaDonRepository hoaDonRepository;
    private final LuotKhamRepository luotKhamRepository;
    private final DonThuocRepository donThuocRepository;
    private final ThuNganRepository thuNganRepository;
    private final ThanhToanRepository thanhToanRepository;
    private final GiaoDichThanhToanRepository giaoDichThanhToanRepository;

    private static final BigDecimal PHI_KHAM_MAC_DINH = BigDecimal.valueOf(150000);

    @Override
    @Transactional(readOnly = true)
    public List<LuotKhamChoHoaDonResponse> layDanhSachLuotKhamChoLapHoaDon() {
        List<LuotKham> ds = luotKhamRepository.findLuotKhamChoLapHoaDon();
        return ds.stream().map(this::mapToLuotKhamChoHoaDonResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ChiPhiKhamPreviewResponse layChiPhiDuKien(String idLuotKham) {
        LuotKham luotKham = luotKhamRepository.findById(idLuotKham)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy lượt khám với ID: " + idLuotKham));

        Optional<HoaDon> hoaDonDaCo = hoaDonRepository.findByLuotKham_IdLuotKham(idLuotKham);

        BigDecimal phiKham = PHI_KHAM_MAC_DINH;
        BigDecimal tienThuoc = BigDecimal.ZERO;
        List<ChiTietKhoanThuDTO> danhSachKhoanThu = new ArrayList<>();

        // Thêm dòng Phí khám bệnh
        String chuyenKhoa = (luotKham.getLichKham() != null && luotKham.getLichKham().getBacSi() != null)
                ? luotKham.getLichKham().getBacSi().getChuyenKhoa() : "Đa khoa";

        danhSachKhoanThu.add(ChiTietKhoanThuDTO.builder()
                .loaiKhoanThu("TIEN_KHAM")
                .tenKhoanThu("Phí khám lâm sàng (" + chuyenKhoa + ")")
                .donViTinh("Lần")
                .soLuong(1)
                .donGia(phiKham)
                .thanhTien(phiKham)
                .huongDan("Khám chuyên khoa & tư vấn chẩn đoán y tế")
                .build());

        // Lấy thông tin đơn thuốc nếu có
        Optional<DonThuoc> donThuocOpt = donThuocRepository.findByLuotKham_IdLuotKham(idLuotKham);
        if (donThuocOpt.isPresent() && donThuocOpt.get().getChiTietDonThuocs() != null) {
            for (ChiTietDonThuoc ct : donThuocOpt.get().getChiTietDonThuocs()) {
                BigDecimal thanhTien = ct.getDonGia().multiply(BigDecimal.valueOf(ct.getSoLuong()));
                tienThuoc = tienThuoc.add(thanhTien);

                danhSachKhoanThu.add(ChiTietKhoanThuDTO.builder()
                        .loaiKhoanThu("TIEN_THUOC")
                        .tenKhoanThu(ct.getThuoc() != null ? ct.getThuoc().getTenThuoc() : "Thuốc điều trị")
                        .donViTinh(ct.getThuoc() != null ? ct.getThuoc().getDonViTinh() : "Đơn vị")
                        .soLuong(ct.getSoLuong())
                        .donGia(ct.getDonGia())
                        .thanhTien(thanhTien)
                        .huongDan(ct.getLieuLuong() + (ct.getHuongDanSuDung() != null ? " - " + ct.getHuongDanSuDung() : ""))
                        .build());
            }
        }

        // UC-16: Tính tổng chi phí = Tiền khám + Tiền thuốc
        BigDecimal tongTien = phiKham.add(tienThuoc);

        BenhNhan bn = luotKham.getLichKham() != null ? luotKham.getLichKham().getBenhNhan() : null;
        BacSi bs = luotKham.getLichKham() != null ? luotKham.getLichKham().getBacSi() : null;

        return ChiPhiKhamPreviewResponse.builder()
                .idLuotKham(luotKham.getIdLuotKham())
                .maBenhNhan(bn != null ? bn.getIdBenhNhan() : "")
                .tenBenhNhan(bn != null ? bn.getHoTen() : "Chưa rõ")
                .soDienThoai(bn != null ? bn.getSoDienThoai() : "")
                .ngaySinh(bn != null ? bn.getNgaySinh() : null)
                .gioiTinh(bn != null ? bn.getGioiTinh() : "")
                .bacSiKham(bs != null ? bs.getHoTen() : "Bác sĩ phụ trách")
                .chuyenKhoa(bs != null ? bs.getChuyenKhoa() : "")
                .lyDoKham(luotKham.getLyDoKham())
                .chanDoan(luotKham.getChanDoan())
                .ngayKham(luotKham.getLichKham() != null ? luotKham.getLichKham().getNgayKham() : null)
                .phiKham(phiKham)
                .tienThuoc(tienThuoc)
                .tongTien(tongTien)
                .danhSachKhoanThu(danhSachKhoanThu)
                .daCoHoaDon(hoaDonDaCo.isPresent())
                .idHoaDonHienTai(hoaDonDaCo.map(HoaDon::getId).orElse(null))
                .build();
    }

    @Override
    @Transactional
    public HoaDonResponse taoHoaDon(TaoHoaDonRequest request) {
        log.info("Bắt đầu xử lý tạo hóa đơn cho lượt khám: {}", request.getIdLuotKham());

        if (request.getIdLuotKham() == null || request.getIdLuotKham().trim().isEmpty()) {
            throw new IllegalArgumentException("Mã lượt khám không được để trống!");
        }

        LuotKham luotKham = luotKhamRepository.findById(request.getIdLuotKham())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy lượt khám với ID: " + request.getIdLuotKham()));

        // Kiểm tra xem lượt khám này đã có hóa đơn hợp lệ chưa
        if (hoaDonRepository.existsByLuotKham_IdLuotKham(luotKham.getIdLuotKham())) {
            throw new IllegalStateException("Lượt khám này đã được lập hóa đơn trước đó! Không thể tạo trùng lặp.");
        }

        // Lấy thu ngân xử lý
        ThuNgan thuNgan = null;
        if (request.getMaThuNgan() != null && !request.getMaThuNgan().trim().isEmpty()) {
            thuNgan = thuNganRepository.findById(request.getMaThuNgan()).orElse(null);
        }
        if (thuNgan == null) {
            List<ThuNgan> dsThuNgan = thuNganRepository.findAll();
            if (!dsThuNgan.isEmpty()) {
                thuNgan = dsThuNgan.get(0);
            } else {
                // Khởi tạo thu ngân mặc định nếu chưa có
                thuNgan = new ThuNgan();
                thuNgan.setMaNv("TN-001");
                thuNgan.setHoTen("Nguyễn Thị Thu Ngân");
                thuNgan.setSdt("0908111222");
                thuNgan.setDiaChi("Quầy thu ngân số 1");
                thuNgan.setCaLamViec("Ca sáng");
                thuNgan.setQuayLamViec("Quầy 1");
                thuNgan = thuNganRepository.save(thuNgan);
            }
        }

        // Tính tiền khám và tiền thuốc
        BigDecimal phiKham = request.getPhiKhamTuyChinh() != null ? request.getPhiKhamTuyChinh() : PHI_KHAM_MAC_DINH;
        BigDecimal tienThuoc = BigDecimal.ZERO;

        Optional<DonThuoc> donThuocOpt = donThuocRepository.findByLuotKham_IdLuotKham(luotKham.getIdLuotKham());
        if (donThuocOpt.isPresent() && donThuocOpt.get().getChiTietDonThuocs() != null) {
            for (ChiTietDonThuoc ct : donThuocOpt.get().getChiTietDonThuocs()) {
                BigDecimal tt = ct.getDonGia().multiply(BigDecimal.valueOf(ct.getSoLuong()));
                tienThuoc = tienThuoc.add(tt);
            }
        }

        // UC-16: Tính tổng tiền
        BigDecimal tongTien = phiKham.add(tienThuoc);

        // Sinh mã hóa đơn chuẩn y tế (Ví dụ: HD-YYYYMMDD-XXXX)
        String maHoaDon = "HD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        HoaDon hoaDon = new HoaDon();
        hoaDon.setId(maHoaDon);
        hoaDon.setLuotKham(luotKham);
        hoaDon.setThuNgan(thuNgan);
        hoaDon.setNgayTao(LocalDateTime.now());
        hoaDon.setPhiKham(phiKham);
        hoaDon.setTienThuoc(tienThuoc);
        hoaDon.setTongTien(tongTien);
        hoaDon.setTrangThai("CHUA_THANH_TOAN");

        HoaDon saved = hoaDonRepository.save(hoaDon);

        // Cập nhật trạng thái lượt khám sang chờ thanh toán
        luotKham.setTrangThai("CHO_THANH_TOAN");
        luotKhamRepository.save(luotKham);

        log.info("Lập hóa đơn thành công! Mã hóa đơn: {}, Tổng tiền: {}", saved.getId(), saved.getTongTien());
        return mapToHoaDonResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public HoaDonResponse layHoaDonTheoId(String idHoaDon) {
        HoaDon hd = hoaDonRepository.findById(idHoaDon)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hóa đơn với ID: " + idHoaDon));
        return mapToHoaDonResponse(hd);
    }

    @Override
    @Transactional(readOnly = true)
    public HoaDonResponse layHoaDonTheoLuotKham(String idLuotKham) {
        HoaDon hd = hoaDonRepository.findByLuotKham_IdLuotKham(idLuotKham)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hóa đơn cho lượt khám: " + idLuotKham));
        return mapToHoaDonResponse(hd);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HoaDonResponse> layDanhSachTatCaHoaDon() {
        return hoaDonRepository.findAllByOrderByNgayTaoDesc().stream()
                .map(this::mapToHoaDonResponse)
                .collect(Collectors.toList());
    }

    private LuotKhamChoHoaDonResponse mapToLuotKhamChoHoaDonResponse(LuotKham lk) {
        BenhNhan bn = lk.getLichKham() != null ? lk.getLichKham().getBenhNhan() : null;
        BacSi bs = lk.getLichKham() != null ? lk.getLichKham().getBacSi() : null;
        boolean coDon = donThuocRepository.findByLuotKham_IdLuotKham(lk.getIdLuotKham()).isPresent();

        return LuotKhamChoHoaDonResponse.builder()
                .idLuotKham(lk.getIdLuotKham())
                .idLichKham(lk.getLichKham() != null ? lk.getLichKham().getIdLichKham() : null)
                .maBenhNhan(bn != null ? bn.getIdBenhNhan() : "")
                .tenBenhNhan(bn != null ? bn.getHoTen() : "Không rõ")
                .soDienThoai(bn != null ? bn.getSoDienThoai() : "")
                .bacSiKham(bs != null ? bs.getHoTen() : "Bác sĩ phụ trách")
                .chuyenKhoa(bs != null ? bs.getChuyenKhoa() : "")
                .ngayKham(lk.getLichKham() != null ? lk.getLichKham().getNgayKham() : null)
                .gioKham(lk.getLichKham() != null ? lk.getLichKham().getGioKham() : null)
                .lyDoKham(lk.getLyDoKham())
                .chanDoan(lk.getChanDoan())
                .trangThaiLuotKham(lk.getTrangThai())
                .daCoDonThuoc(coDon)
                .build();
    }

    private HoaDonResponse mapToHoaDonResponse(HoaDon hd) {
        LuotKham lk = hd.getLuotKham();
        BenhNhan bn = lk != null && lk.getLichKham() != null ? lk.getLichKham().getBenhNhan() : null;
        BacSi bs = lk != null && lk.getLichKham() != null ? lk.getLichKham().getBacSi() : null;

        List<ChiTietKhoanThuDTO> danhSachKhoanThu = new ArrayList<>();
        danhSachKhoanThu.add(ChiTietKhoanThuDTO.builder()
                .loaiKhoanThu("TIEN_KHAM")
                .tenKhoanThu("Phí khám lâm sàng (" + (bs != null ? bs.getChuyenKhoa() : "Đa khoa") + ")")
                .donViTinh("Lần")
                .soLuong(1)
                .donGia(hd.getPhiKham())
                .thanhTien(hd.getPhiKham())
                .huongDan("Khám chuyên khoa")
                .build());

        if (lk != null) {
            Optional<DonThuoc> dtOpt = donThuocRepository.findByLuotKham_IdLuotKham(lk.getIdLuotKham());
            if (dtOpt.isPresent() && dtOpt.get().getChiTietDonThuocs() != null) {
                for (ChiTietDonThuoc ct : dtOpt.get().getChiTietDonThuocs()) {
                    BigDecimal tt = ct.getDonGia().multiply(BigDecimal.valueOf(ct.getSoLuong()));
                    danhSachKhoanThu.add(ChiTietKhoanThuDTO.builder()
                            .loaiKhoanThu("TIEN_THUOC")
                            .tenKhoanThu(ct.getThuoc() != null ? ct.getThuoc().getTenThuoc() : "Thuốc điều trị")
                            .donViTinh(ct.getThuoc() != null ? ct.getThuoc().getDonViTinh() : "Đơn vị")
                            .soLuong(ct.getSoLuong())
                            .donGia(ct.getDonGia())
                            .thanhTien(tt)
                            .huongDan(ct.getLieuLuong() + (ct.getHuongDanSuDung() != null ? " - " + ct.getHuongDanSuDung() : ""))
                            .build());
                }
            }
        }

        return HoaDonResponse.builder()
                .idHoaDon(hd.getId())
                .idLuotKham(lk != null ? lk.getIdLuotKham() : "")
                .maBenhNhan(bn != null ? bn.getIdBenhNhan() : "")
                .tenBenhNhan(bn != null ? bn.getHoTen() : "Không rõ")
                .soDienThoai(bn != null ? bn.getSoDienThoai() : "")
                .diaChi(bn != null ? bn.getDiaChi() : "")
                .bacSiKham(bs != null ? bs.getHoTen() : "Bác sĩ phụ trách")
                .thuNganLap(hd.getThuNgan() != null ? hd.getThuNgan().getHoTen() : "Thu ngân")
                .ngayTao(hd.getNgayTao())
                .phiKham(hd.getPhiKham())
                .tienThuoc(hd.getTienThuoc())
                .tongTien(hd.getTongTien())
                .trangThai(hd.getTrangThai())
                .danhSachChiTiet(danhSachKhoanThu)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public InHoaDonResponse layThongTinInHoaDon(String idHoaDon) {
        log.info("Xử lý yêu cầu in hóa đơn cho ID: {}", idHoaDon);

        if (idHoaDon == null || idHoaDon.trim().isEmpty()) {
            throw new IllegalArgumentException("Mã hóa đơn không được để trống!");
        }

        HoaDon hd = hoaDonRepository.findById(idHoaDon)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hóa đơn với ID: " + idHoaDon));

        // AC-2: Given hóa đơn chưa thanh toán, When thu ngân chọn “In hóa đơn”,
        // Then hệ thống thông báo “Vui lòng hoàn tất thanh toán trước khi in” và không tạo bản hóa đơn hoàn tất.
        if (!"DA_THANH_TOAN".equalsIgnoreCase(hd.getTrangThai())) {
            throw new IllegalStateException("Vui lòng hoàn tất thanh toán trước khi in");
        }

        LuotKham lk = hd.getLuotKham();
        BenhNhan bn = (lk != null && lk.getLichKham() != null) ? lk.getLichKham().getBenhNhan() : null;
        BacSi bs = (lk != null && lk.getLichKham() != null) ? lk.getLichKham().getBacSi() : null;

        // Tính tuổi nếu có ngày sinh
        Integer tuoi = null;
        if (bn != null && bn.getNgaySinh() != null) {
            tuoi = Period.between(bn.getNgaySinh(), LocalDate.now()).getYears();
        }

        // Lấy danh sách khoản thu chi tiết (Phí khám + Tiền thuốc)
        List<ChiTietKhoanThuDTO> danhSachKhoanThu = new ArrayList<>();
        danhSachKhoanThu.add(ChiTietKhoanThuDTO.builder()
                .loaiKhoanThu("TIEN_KHAM")
                .tenKhoanThu("Phí khám lâm sàng (" + (bs != null && bs.getChuyenKhoa() != null ? bs.getChuyenKhoa() : "Đa khoa") + ")")
                .donViTinh("Lần")
                .soLuong(1)
                .donGia(hd.getPhiKham())
                .thanhTien(hd.getPhiKham())
                .huongDan("Khám chuyên khoa & tư vấn sức khỏe")
                .build());

        if (lk != null) {
            Optional<DonThuoc> dtOpt = donThuocRepository.findByLuotKham_IdLuotKham(lk.getIdLuotKham());
            if (dtOpt.isPresent() && dtOpt.get().getChiTietDonThuocs() != null) {
                for (ChiTietDonThuoc ct : dtOpt.get().getChiTietDonThuocs()) {
                    BigDecimal tt = ct.getDonGia().multiply(BigDecimal.valueOf(ct.getSoLuong()));
                    danhSachKhoanThu.add(ChiTietKhoanThuDTO.builder()
                            .loaiKhoanThu("TIEN_THUOC")
                            .tenKhoanThu(ct.getThuoc() != null ? ct.getThuoc().getTenThuoc() : "Thuốc kê đơn")
                            .donViTinh(ct.getThuoc() != null ? ct.getThuoc().getDonViTinh() : "Đơn vị")
                            .soLuong(ct.getSoLuong())
                            .donGia(ct.getDonGia())
                            .thanhTien(tt)
                            .huongDan(ct.getLieuLuong() + (ct.getHuongDanSuDung() != null ? " - " + ct.getHuongDanSuDung() : ""))
                            .build());
                }
            }
        }

        // Lấy thông tin thanh toán & giao dịch
        String phuongThuc = "TIEN_MAT";
        String tenPhuongThuc = "Tiền mặt tại quầy";
        String maGiaoDich = "TM-" + hd.getId();
        LocalDateTime ngayThanhToan = hd.getNgayTao();

        List<GiaoDichThanhToan> dsGiaoDich = giaoDichThanhToanRepository.findByThanhToan_HoaDon_IdOrderByThoiGianDesc(hd.getId());
        if (!dsGiaoDich.isEmpty()) {
            GiaoDichThanhToan gdThanhCong = dsGiaoDich.stream()
                    .filter(g -> "THANH_CONG".equalsIgnoreCase(g.getTrangThai()))
                    .findFirst()
                    .orElse(dsGiaoDich.get(0));

            phuongThuc = gdThanhCong.getPhuongThuc();
            maGiaoDich = gdThanhCong.getMaGiaoDich() != null ? gdThanhCong.getMaGiaoDich() : gdThanhCong.getIdGiaoDich();
            ngayThanhToan = gdThanhCong.getThoiGian();

            if ("TIEN_MAT".equalsIgnoreCase(phuongThuc)) {
                tenPhuongThuc = "Tiền mặt tại quầy";
            } else if ("CHUYEN_KHOAN_QR".equalsIgnoreCase(phuongThuc) || "CHUYEN_KHOAN".equalsIgnoreCase(phuongThuc) || "VNPAY_QR".equalsIgnoreCase(phuongThuc)) {
                tenPhuongThuc = "Chuyển khoản VietQR";
            } else if ("TRUC_TUYEN".equalsIgnoreCase(phuongThuc) || "VNPAY".equalsIgnoreCase(phuongThuc)) {
                tenPhuongThuc = "Thanh toán trực tuyến VNPay";
            }
        } else {
            Optional<ThanhToan> ttOpt = thanhToanRepository.findByHoaDon_Id(hd.getId());
            if (ttOpt.isPresent() && ttOpt.get().getNgayTao() != null) {
                ngayThanhToan = ttOpt.get().getNgayTao();
            }
        }

        // Đọc số tiền ra chữ tiếng Việt
        String tongTienBangChu = MoneyToWordsUtil.docSoTien(hd.getTongTien());

        return InHoaDonResponse.builder()
                .tenPhongKham("PHÒNG KHÁM ĐA KHOA QUỐC TẾ MEDICARE")
                .diaChiPhongKham("123 Nguyễn Văn Cừ, Phường 4, Quận 5, TP. Hồ Chí Minh")
                .hotline("1900 6868 - (028) 3835 1024")
                .email("contact@medicare-clinic.vn")
                .website("https://medicare-clinic.vn")
                .idHoaDon(hd.getId())
                .idLuotKham(lk != null ? lk.getIdLuotKham() : "")
                .ngayLap(hd.getNgayTao())
                .ngayThanhToan(ngayThanhToan)
                .trangThai(hd.getTrangThai())
                .maBenhNhan(bn != null ? bn.getIdBenhNhan() : "")
                .tenBenhNhan(bn != null ? bn.getHoTen() : "Không rõ")
                .ngaySinh(bn != null ? bn.getNgaySinh() : null)
                .tuoi(tuoi)
                .gioiTinh(bn != null ? bn.getGioiTinh() : "")
                .soDienThoai(bn != null ? bn.getSoDienThoai() : "")
                .diaChi(bn != null ? bn.getDiaChi() : "")
                .bacSiKham(bs != null ? bs.getHoTen() : "Bác sĩ phụ trách")
                .chuyenKhoa(bs != null ? bs.getChuyenKhoa() : "Đa khoa")
                .lyDoKham(lk != null ? lk.getLyDoKham() : "")
                .chanDoan(lk != null ? lk.getChanDoan() : "")
                .danhSachKhoanThu(danhSachKhoanThu)
                .phiKham(hd.getPhiKham())
                .tienThuoc(hd.getTienThuoc())
                .tongTien(hd.getTongTien())
                .tongTienBangChu(tongTienBangChu)
                .phuongThucThanhToan(phuongThuc)
                .tenPhuongThuc(tenPhuongThuc)
                .maGiaoDich(maGiaoDich)
                .thuNganThu(hd.getThuNgan() != null ? hd.getThuNgan().getHoTen() : "Nguyễn Thị Thu Ngân")
                .ghiChu("Hóa đơn đã được thanh toán đầy đủ và có giá trị thanh quyết toán viện phí.")
                .build();
    }
}
