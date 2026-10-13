package com.medicare.clinic.service.impl;
import com.medicare.clinic.dto.request.TaoHoaDonRequest;
import com.medicare.clinic.dto.request.HoaDonTraCuuRequest;
import com.medicare.clinic.dto.response.*;
import com.medicare.clinic.entity.*;
import com.medicare.clinic.entity.enums.*;
import com.medicare.clinic.repository.*;
import com.medicare.clinic.service.interfaces.IHoaDonService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;
@Service
@RequiredArgsConstructor
public class HoaDonService implements IHoaDonService {
    private final jakarta.persistence.EntityManager entityManager;
    private final HoaDonRepository hoaDonRepository;
    private final LuotKhamRepository luotKhamRepository;
    private final DonThuocRepository donThuocRepository;
    private final ThuNganRepository thuNganRepository;
    private final GiaoDichThanhToanRepository giaoDichThanhToanRepository;
    @Value("${billing.exam-fee:${BILLING_EXAM_FEE:150000}}")
    private BigDecimal examFee;
    @Value("${clinic.name:${CLINIC_NAME:PHÒNG KHÁM ĐA KHOA QUỐC TẾ MEDICARE}}")
    private String clinicName;
    @Value("${clinic.address:${CLINIC_ADDRESS:123 Nguyễn Văn Cừ, Phường 4, Quận 5, TP. Hồ Chí Minh}}")
    private String clinicAddress;
    @Value("${clinic.hotline:${CLINIC_HOTLINE:1900 6868 - (028) 3835 1024}}")
    private String clinicHotline;
    @Value("${clinic.email:${CLINIC_EMAIL:contact@medicare-clinic.vn}}")
    private String clinicEmail;
    @Value("${clinic.website:${CLINIC_WEBSITE:https://medicare-clinic.vn}}")
    private String clinicWebsite;
    private static final BigDecimal MAX_AMOUNT = new BigDecimal("9999999999.99");
    private String id(String value) {
        if (value == null || value.isBlank() || value.trim().length() > 36)
            throw new IllegalArgumentException("Mã lượt khám không hợp lệ");
        return value.trim();
    }
    private BigDecimal money(BigDecimal value) {
        if (value == null || value.signum() < 0 || value.compareTo(MAX_AMOUNT) > 0 || value.stripTrailingZeros().scale() > 2)
            throw new IllegalArgumentException("Số tiền không hợp lệ");
        return value.setScale(2);
    }
    private LuotKham visit(String visitId) {
        return luotKhamRepository.findById(id(visitId)).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy lượt khám"));
    }
    private DonThuoc ready(LuotKham visit) {
        if (visit.getTrangThai() != TrangThaiLuotKham.HOAN_TAT)
            throw new IllegalStateException("Lượt khám chưa hoàn tất, chưa thể lập hóa đơn");
        return donThuocRepository.findByLuotKham_IdLuotKham(visit.getIdLuotKham()).orElse(null);
    }
    private List<ChiTietHoaDon> charges(DonThuoc prescription, BigDecimal fee) {
        List<ChiTietHoaDon> details = new ArrayList<>();
        details.add(line("TIEN_KHAM", "Phí khám", 1, money(fee)));
        if (prescription != null && prescription.getChiTietDonThuocs() != null) for (ChiTietDonThuoc drug : prescription.getChiTietDonThuocs()) {
            if (drug.getThuoc() == null || drug.getSoLuong() == null || drug.getSoLuong() <= 0)
                throw new IllegalArgumentException("Chi tiết đơn thuốc không hợp lệ");
            details.add(line("TIEN_THUOC", drug.getThuoc().getTenThuoc(), drug.getSoLuong(), money(drug.getDonGia())));
        }
        money(details.stream().map(ChiTietHoaDon::getThanhTien).reduce(BigDecimal.ZERO, BigDecimal::add));
        return details;
    }
    private ChiTietHoaDon line(String kind, String description, int quantity, BigDecimal price) {
        if (description == null || description.isBlank() || description.length() > 255)
            throw new IllegalArgumentException("Mô tả khoản thu không hợp lệ");
        ChiTietHoaDon detail = new ChiTietHoaDon();
        detail.setId(UUID.randomUUID().toString()); detail.setLoaiChiPhi(kind); detail.setMoTa(description);
        detail.setSoLuong(quantity); detail.setDonGia(price);
        detail.setThanhTien(money(price.multiply(BigDecimal.valueOf(quantity))));
        return detail;
    }
    private List<ChiTietKhoanThuResponse> lines(List<ChiTietHoaDon> details) {
        return details.stream().map(d -> ChiTietKhoanThuResponse.builder().loaiKhoanThu(d.getLoaiChiPhi())
            .tenKhoanThu(d.getMoTa()).soLuong(d.getSoLuong()).donGia(d.getDonGia()).thanhTien(d.getThanhTien()).build()).toList();
    }
    private BigDecimal sum(List<ChiTietHoaDon> details, String kind) {
        return details.stream().filter(d -> kind.equals(d.getLoaiChiPhi())).map(ChiTietHoaDon::getThanhTien)
            .reduce(new BigDecimal("0.00"), BigDecimal::add);
    }
    @Override @Transactional(readOnly = true)
    public List<LuotKhamChoHoaDonResponse> layDanhSachLuotKhamChoLapHoaDon() {
        return luotKhamRepository.findReadyForBilling(TrangThaiLuotKham.HOAN_TAT).stream().map(v -> {
            LichKham a = v.getLichKham(); BenhNhan p = a.getBenhNhan(); BacSi d = a.getBacSi();
            return LuotKhamChoHoaDonResponse.builder().idLuotKham(v.getIdLuotKham()).idLichKham(a.getIdLichKham())
                .maBenhNhan(p.getIdBenhNhan()).tenBenhNhan(p.getHoTen()).soDienThoai(p.getSoDienThoai())
                .bacSiKham(d.getNhanVien().getHoTen()).chuyenKhoa(d.getChuyenKhoa()).ngayKham(a.getNgayKham())
                .gioKham(a.getGioKham()).lyDoKham(v.getLyDoKham()).chanDoan(v.getChanDoan())
                .trangThaiLuotKham(v.getTrangThai().name()).daCoDonThuoc(donThuocRepository.findByLuotKham_IdLuotKham(v.getIdLuotKham()).isPresent()).build();
        }).toList();
    }
    @Override @Transactional(readOnly = true)
    public ChiPhiKhamPreviewResponse layChiPhiDuKien(String visitId) {
        LuotKham v = visit(visitId);
        Optional<HoaDon> stored = hoaDonRepository.findByLuotKham_IdLuotKham(v.getIdLuotKham());
        List<ChiTietHoaDon> details = stored.isPresent() ? stored.get().getChiTietHoaDons() : charges(ready(v), examFee);
        LichKham a = v.getLichKham(); BenhNhan p = a.getBenhNhan(); BacSi d = a.getBacSi();
        return ChiPhiKhamPreviewResponse.builder().idLuotKham(v.getIdLuotKham()).maBenhNhan(p.getIdBenhNhan())
            .tenBenhNhan(p.getHoTen()).soDienThoai(p.getSoDienThoai()).ngaySinh(p.getNgaySinh())
            .gioiTinh(p.getGioiTinh() == null ? null : p.getGioiTinh().name()).bacSiKham(d.getNhanVien().getHoTen())
            .chuyenKhoa(d.getChuyenKhoa()).lyDoKham(v.getLyDoKham()).chanDoan(v.getChanDoan()).ngayKham(a.getNgayKham())
            .phiKham(sum(details,"TIEN_KHAM")).tienThuoc(sum(details,"TIEN_THUOC"))
            .tongTien(stored.isPresent() ? stored.get().getTongTien() : sum(details,"TIEN_KHAM").add(sum(details,"TIEN_THUOC")))
            .danhSachKhoanThu(lines(details)).daCoHoaDon(stored.isPresent()).idHoaDonHienTai(stored.map(HoaDon::getId).orElse(null)).build();
    }
    @Override @Transactional(isolation = org.springframework.transaction.annotation.Isolation.READ_COMMITTED)
    public HoaDonResponse taoHoaDon(TaoHoaDonRequest request, String cashierId) {
        if (request == null) throw new IllegalArgumentException("Yêu cầu không hợp lệ");
        ThuNgan cashier = thuNganRepository.findById(id(cashierId)).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.FORBIDDEN,"Tài khoản không liên kết thu ngân hợp lệ"));
        // Lock the visit before checking its invoice; all creators acquire the same lock.
        LuotKham v = luotKhamRepository.findForBilling(id(request.getIdLuotKham())).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.NOT_FOUND,"Không tìm thấy lượt khám"));
        if (hoaDonRepository.existsByLuotKham_IdLuotKham(v.getIdLuotKham()))
            throw new IllegalStateException("Lượt khám đã có hóa đơn");
        List<ChiTietHoaDon> details = charges(ready(v), request.getPhiKhamTuyChinh() == null ? examFee : request.getPhiKhamTuyChinh());
        HoaDon invoice = new HoaDon(); invoice.setId(UUID.randomUUID().toString());
        invoice.setLuotKham(v); invoice.setThuNgan(cashier);
        invoice.setNgayTao(LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh")));
        invoice.setTrangThai(TrangThaiHoaDon.CHUA_THANH_TOAN);
        details.forEach(d -> d.setHoaDon(invoice)); invoice.setChiTietHoaDons(details); invoice.tinhTongChiPhi();
        // Persist totals and immutable charge snapshots atomically; preserve HOAN_TAT.
        entityManager.persist(invoice);
        entityManager.flush();
        return response(invoice);
    }
    private HoaDonResponse response(HoaDon h) {
        LichKham a = h.getLuotKham().getLichKham(); BenhNhan p = a.getBenhNhan();
        return HoaDonResponse.builder().idHoaDon(h.getId()).idLuotKham(h.getLuotKham().getIdLuotKham())
            .maBenhNhan(p.getIdBenhNhan()).tenBenhNhan(p.getHoTen()).soDienThoai(p.getSoDienThoai()).diaChi(p.getDiaChi())
            .bacSiKham(a.getBacSi().getNhanVien().getHoTen()).thuNganLap(h.getThuNgan().getNhanVien().getHoTen())
            .ngayTao(h.getNgayTao()).phiKham(sum(h.getChiTietHoaDons(),"TIEN_KHAM"))
            .tienThuoc(sum(h.getChiTietHoaDons(),"TIEN_THUOC")).tongTien(h.getTongTien())
            .trangThai(h.getTrangThai().name()).danhSachChiTiet(lines(h.getChiTietHoaDons())).build();
    }
    @Override @Transactional(readOnly = true)
    public HoaDonResponse layHoaDonTheoId(String invoiceId) {
        return response(hoaDonRepository.findById(id(invoiceId)).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.NOT_FOUND,"Không tìm thấy hóa đơn")));
    }
    @Override @Transactional(readOnly = true)
    public HoaDonResponse layHoaDonTheoLuotKham(String visitId) {
        return response(hoaDonRepository.findByLuotKham_IdLuotKham(id(visitId)).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.NOT_FOUND,"Không tìm thấy hóa đơn")));
    }
    @Override @Transactional(readOnly = true)
    public List<HoaDonResponse> layDanhSachTatCaHoaDon() {
        return hoaDonRepository.findAllByOrderByNgayTaoDesc().stream().map(this::response).toList();
    }

    @Override @Transactional(readOnly = true)
    public InHoaDonResponse layThongTinInHoaDon(String invoiceId) {
        HoaDon h = hoaDonRepository.findById(id(invoiceId)).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Không tìm thấy hóa đơn"));
        if(h.getTrangThai()!=TrangThaiHoaDon.DA_THANH_TOAN) throw new IllegalStateException("Vui lòng hoàn tất thanh toán trước khi in");
        HoaDonResponse dto=response(h); BenhNhan p=h.getLuotKham().getLichKham().getBenhNhan();
        GiaoDichThanhToan payment=giaoDichThanhToanRepository.findByThanhToan_HoaDon_IdOrderByThoiGianDesc(h.getId()).stream().filter(GiaoDichThanhToan::isThanhCong).findFirst().orElse(null);
        return InHoaDonResponse.builder().tenPhongKham(clinicName)
            .diaChiPhongKham(clinicAddress).hotline(clinicHotline).email(clinicEmail).website(clinicWebsite)
            .idHoaDon(h.getId()).idLuotKham(dto.getIdLuotKham()).ngayLap(h.getNgayTao()).trangThai(h.getTrangThai().name())
            .ngayThanhToan(payment==null?null:payment.getThoiGian()).maBenhNhan(p.getIdBenhNhan()).tenBenhNhan(p.getHoTen()).ngaySinh(p.getNgaySinh()).gioiTinh(p.getGioiTinh()==null?null:p.getGioiTinh().name()).soDienThoai(p.getSoDienThoai()).diaChi(p.getDiaChi())
            .bacSiKham(dto.getBacSiKham()).chuyenKhoa(h.getLuotKham().getLichKham().getBacSi().getChuyenKhoa()).chanDoan(h.getLuotKham().getChanDoan()).lyDoKham(h.getLuotKham().getLyDoKham())
            .danhSachKhoanThu(dto.getDanhSachChiTiet()).phiKham(dto.getPhiKham()).tienThuoc(dto.getTienThuoc()).tongTien(h.getTongTien()).tongTienBangChu(com.medicare.clinic.util.MoneyToWordsUtil.docSoTien(h.getTongTien()))
            .phuongThucThanhToan(payment==null?null:payment.getPhuongThuc().name()).tenPhuongThuc(payment==null?null:payment.getPhuongThuc().name()).maGiaoDich(payment==null?null:payment.getMaGiaoDich()).thuNganThu(dto.getThuNganLap()).build();
    }

    @Override
    @Transactional(readOnly = true)
    public HoaDonTraCuuResponse traCuuHoaDon(HoaDonTraCuuRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Thong tin tra cuu hoa don khong duoc de trong.");
        }

        LocalDate tuNgay = request.getTuNgay();
        LocalDate denNgay = request.getDenNgay();

        if (tuNgay != null && denNgay != null && tuNgay.isAfter(denNgay)) {
            throw new IllegalArgumentException("Tu ngay khong duoc sau den ngay.");
        }

        if (request.getPage() < 0 || request.getSize() < 1 || request.getSize() > 100) {
            throw new IllegalArgumentException("Trang hoặc số lượng kết quả không hợp lệ.");
        }
        String idHoaDon = chuanHoa(request.getIdHoaDon());
        if (idHoaDon != null && !idHoaDon.matches("[A-Za-z0-9_-]{1,36}")) {
            throw new IllegalArgumentException("Mã hóa đơn không hợp lệ.");
        }
        String soDienThoai = chuanHoaSoDienThoai(request.getSoDienThoaiBenhNhan());
        TrangThaiHoaDon trangThai = request.getTrangThai();

        // Dung moc den ngay theo kieu exclusive de lay du toan bo ngay ket thuc.
        LocalDateTime tuNgayDateTime = tuNgay == null ? null : tuNgay.atStartOfDay();
        LocalDateTime denNgayExclusive = denNgay == null ? null : denNgay.plusDays(1).atStartOfDay();

        org.springframework.data.domain.Page<HoaDon> hoaDons = hoaDonRepository.traCuuHoaDon(
                idHoaDon,
                soDienThoai,
                tuNgayDateTime,
                denNgayExclusive,
                trangThai,
                org.springframework.data.domain.PageRequest.of(request.getPage(), request.getSize())
        );

        List<HoaDonTraCuuResponse.HoaDonItem> danhSach = new ArrayList<>();
        for (HoaDon hoaDon : hoaDons) {
            danhSach.add(chuyenSangDTO(hoaDon));
        }

        HoaDonTraCuuResponse response = new HoaDonTraCuuResponse();
        response.setDanhSachHoaDon(danhSach);
        response.setTongSoKetQua(hoaDons.getTotalElements());
        response.setPage(hoaDons.getNumber());
        response.setSize(hoaDons.getSize());
        response.setTotalPages(hoaDons.getTotalPages());
        response.setThongBao(danhSach.isEmpty()
                ? "Không tìm thấy hóa đơn phù hợp với điều kiện tra cứu."
                : "Tìm thấy " + hoaDons.getTotalElements() + " hóa đơn.");
        return response;
    }

    private HoaDonTraCuuResponse.HoaDonItem chuyenSangDTO(HoaDon hoaDon) {
        HoaDonTraCuuResponse.HoaDonItem item = new HoaDonTraCuuResponse.HoaDonItem();
        item.setIdHoaDon(hoaDon.getId());
        item.setNgayTao(hoaDon.getNgayTao());
        item.setTongTien(hoaDon.getTongTien());
        item.setTrangThai(hoaDon.getTrangThai());

        LuotKham luotKham = hoaDon.getLuotKham();
        if (luotKham != null) {
            item.setIdLuotKham(luotKham.getIdLuotKham());
        }

        LichKham lichKham = luotKham == null ? null : luotKham.getLichKham();
        if (lichKham != null) {
            BenhNhan benhNhan = lichKham.getBenhNhan();
            if (benhNhan != null) {
                item.setIdBenhNhan(benhNhan.getIdBenhNhan());
                item.setHoTenBenhNhan(benhNhan.getHoTen());
                item.setSoDienThoaiBenhNhan(benhNhan.getSoDienThoai());
            }

            BacSi bacSi = lichKham.getBacSi();
            if (bacSi != null) {
                item.setMaBacSi(bacSi.getMaNv());
                NhanVien nhanVienBacSi = bacSi.getNhanVien();
                if (nhanVienBacSi != null) {
                    item.setTenBacSi(nhanVienBacSi.getHoTen());
                }
            }
        }

        ThuNgan thuNgan = hoaDon.getThuNgan();
        if (thuNgan != null) {
            NhanVien nhanVienThuNgan = thuNgan.getNhanVien();
            if (nhanVienThuNgan != null) {
                item.setHoTenThuNgan(nhanVienThuNgan.getHoTen());
            }
        }

        List<HoaDonTraCuuResponse.ChiTietHoaDonItem> chiTietItems = new ArrayList<>();
        if (hoaDon.getChiTietHoaDons() != null) {
            for (ChiTietHoaDon chiTiet : hoaDon.getChiTietHoaDons()) {
                if (chiTiet == null) {
                    continue;
                }
                HoaDonTraCuuResponse.ChiTietHoaDonItem chiTietItem =
                        new HoaDonTraCuuResponse.ChiTietHoaDonItem();
                chiTietItem.setLoaiChiPhi(chiTiet.getLoaiChiPhi());
                chiTietItem.setMoTa(chiTiet.getMoTa());
                chiTietItem.setSoLuong(chiTiet.getSoLuong());
                chiTietItem.setDonGia(chiTiet.getDonGia());
                chiTietItem.setThanhTien(chiTiet.getThanhTien());
                chiTietItems.add(chiTietItem);
            }
        }
        item.setChiTietHoaDon(chiTietItems);
        return item;
    }

    private String chuanHoa(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return value.trim();
    }

    private String chuanHoaSoDienThoai(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }

        if (!value.trim().matches("[0-9+(). -]+")) {
            throw new IllegalArgumentException("Số điện thoại chỉ được chứa chữ số và ký tự định dạng điện thoại.");
        }
        String digits = value.replaceAll("\\D", "");
        if (digits.isEmpty() || digits.length() > 15) {
            throw new IllegalArgumentException("Số điện thoại phải có từ 1 đến 15 chữ số.");
        }
        return digits;
    }


    @Override
    @Transactional(readOnly = true)
    public HoaDonTongDoanhThuResponse xemTongDoanhThu(
            com.medicare.clinic.dto.request.HoaDonTongDoanhThuRequest request) {
        if (request == null || request.getTuNgay() == null || request.getDenNgay() == null)
            throw new IllegalArgumentException("Vui lòng chọn cả ngày bắt đầu và ngày kết thúc");
        if (request.getTuNgay().isAfter(request.getDenNgay()))
            throw new IllegalArgumentException("Ngày bắt đầu không được sau ngày kết thúc");
        if (request.getDenNgay().equals(LocalDate.MAX))
            throw new IllegalArgumentException("Ngày kết thúc vượt giới hạn cho phép");
        HoaDonRepository.RevenueSummary totals = hoaDonRepository.tongDoanhThu(
            request.getTuNgay().atStartOfDay(), request.getDenNgay().plusDays(1).atStartOfDay());
        HoaDonTongDoanhThuResponse response = new HoaDonTongDoanhThuResponse();
        response.setTuNgay(request.getTuNgay());
        response.setDenNgay(request.getDenNgay());
        response.setTongDoanhThu(totals.getTongDoanhThu());
        response.setSoHoaDonDaThanhToan(totals.getSoHoaDonDaThanhToan());
        response.setThongBao(totals.getSoHoaDonDaThanhToan() == 0
            ? "Không có hóa đơn thanh toán thành công trong khoảng thời gian này."
            : "Thống kê doanh thu thành công.");
        return response;
    }
}
