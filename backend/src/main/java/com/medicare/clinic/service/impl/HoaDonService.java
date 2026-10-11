package com.medicare.clinic.service.impl;
import com.medicare.clinic.dto.request.TaoHoaDonRequest;
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
    private List<ChiTietKhoanThuDTO> lines(List<ChiTietHoaDon> details) {
        return details.stream().map(d -> ChiTietKhoanThuDTO.builder().loaiKhoanThu(d.getLoaiChiPhi())
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
        return InHoaDonResponse.builder().tenPhongKham("MediCare Clinic").idHoaDon(h.getId()).idLuotKham(dto.getIdLuotKham()).ngayLap(h.getNgayTao()).trangThai(h.getTrangThai().name())
            .ngayThanhToan(payment==null?null:payment.getThoiGian()).maBenhNhan(p.getIdBenhNhan()).tenBenhNhan(p.getHoTen()).ngaySinh(p.getNgaySinh()).gioiTinh(p.getGioiTinh()==null?null:p.getGioiTinh().name()).soDienThoai(p.getSoDienThoai()).diaChi(p.getDiaChi())
            .bacSiKham(dto.getBacSiKham()).chuyenKhoa(h.getLuotKham().getLichKham().getBacSi().getChuyenKhoa()).chanDoan(h.getLuotKham().getChanDoan()).lyDoKham(h.getLuotKham().getLyDoKham())
            .danhSachKhoanThu(dto.getDanhSachChiTiet()).phiKham(dto.getPhiKham()).tienThuoc(dto.getTienThuoc()).tongTien(h.getTongTien()).tongTienBangChu(com.medicare.clinic.util.MoneyToWordsUtil.docSoTien(h.getTongTien()))
            .phuongThucThanhToan(payment==null?null:payment.getPhuongThuc().name()).tenPhuongThuc(payment==null?null:payment.getPhuongThuc().name()).maGiaoDich(payment==null?null:payment.getMaGiaoDich()).thuNganThu(dto.getThuNganLap()).build();
    }
}
