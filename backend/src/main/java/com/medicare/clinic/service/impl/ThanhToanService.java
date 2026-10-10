package com.medicare.clinic.service.impl;

import com.medicare.clinic.dto.request.ThanhToanQrRequest;
import com.medicare.clinic.dto.request.ThanhToanTienMatRequest;
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
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import com.medicare.clinic.dto.response.VNPayCallbackResponse;
import com.medicare.clinic.dto.response.VNPayPaymentResponse;
import com.medicare.clinic.payment.PaymentGateway;
import com.medicare.clinic.payment.dto.PaymentRequest;
import com.medicare.clinic.payment.dto.PaymentResponse;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
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
    private final PaymentGateway paymentGateway;

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
    @Transactional
    public ThanhToanTienMatResponse thanhToanTienMat(ThanhToanTienMatRequest request) {
        log.info("Bắt đầu xử lý thanh toán tiền mặt cho hóa đơn: {}", request.getIdHoaDon());

        if (request.getIdHoaDon() == null || request.getIdHoaDon().trim().isEmpty()) {
            throw new IllegalArgumentException("Mã hóa đơn không được để trống!");
        }

        HoaDon hoaDon = hoaDonRepository.findById(request.getIdHoaDon())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hóa đơn với mã: " + request.getIdHoaDon()));

        // Chặn thanh toán lại nếu hóa đơn đã thanh toán hoàn tất (E3)
        if ("DA_THANH_TOAN".equalsIgnoreCase(hoaDon.getTrangThai())) {
            throw new IllegalStateException("Hóa đơn này đã được thanh toán hoàn tất trước đó! Không thể thanh toán lại.");
        }

        BigDecimal tongTien = hoaDon.getTongTien();
        BigDecimal tienKhachDua = request.getTienKhachDua();

        if (tienKhachDua == null) {
            throw new IllegalArgumentException("Vui lòng nhập số tiền khách đưa!");
        }

        // Kiểm tra số tiền khách đưa không được nhỏ hơn tổng tiền (E2)
        if (tienKhachDua.compareTo(tongTien) < 0) {
            BigDecimal conThieu = tongTien.subtract(tienKhachDua);
            throw new IllegalArgumentException("Số tiền khách đưa không đủ để thanh toán hóa đơn! Còn thiếu: "
                    + conThieu.stripTrailingZeros().toPlainString() + " đ");
        }

        BigDecimal tienThoiLai = tienKhachDua.subtract(tongTien);

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

        // Tạo bản ghi GiaoDichThanhToan tiền mặt
        String maGiaoDich = "CASH-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        GiaoDichThanhToan giaoDich = new GiaoDichThanhToan();
        giaoDich.setIdGiaoDich("GD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        giaoDich.setThanhToan(thanhToan);
        giaoDich.setMaGiaoDich(maGiaoDich);
        giaoDich.setPhuongThuc("TIEN_MAT");
        giaoDich.setSoTien(tongTien);
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

        log.info("Thanh toán tiền mặt thành công cho hóa đơn: {}, tiền khách đưa: {}, tiền thối lại: {}",
                hoaDon.getId(), tienKhachDua, tienThoiLai);

        return ThanhToanTienMatResponse.builder()
                .idThanhToan(thanhToan.getId())
                .idGiaoDich(giaoDich.getIdGiaoDich())
                .maGiaoDich(giaoDich.getMaGiaoDich())
                .idHoaDon(hoaDon.getId())
                .tongTien(tongTien)
                .tienKhachDua(tienKhachDua)
                .tienThoiLai(tienThoiLai)
                .phuongThuc("TIEN_MAT")
                .trangThai("THANH_CONG")
                .thoiGian(giaoDich.getThoiGian())
                .thongBao("Thanh toán tiền mặt thành công! Tiền thối lại cho khách: " + tienThoiLai.stripTrailingZeros().toPlainString() + " đ")
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ThongTinQrResponse layThongTinQrThanhToan(String idHoaDon) {
        log.info("Lấy thông tin mã VietQR cho hóa đơn: {}", idHoaDon);

        if (idHoaDon == null || idHoaDon.trim().isEmpty()) {
            throw new IllegalArgumentException("Mã hóa đơn không được để trống!");
        }

        HoaDon hoaDon = hoaDonRepository.findById(idHoaDon)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hóa đơn với mã: " + idHoaDon));

        if ("DA_THANH_TOAN".equalsIgnoreCase(hoaDon.getTrangThai())) {
            throw new IllegalStateException("Hóa đơn này đã được thanh toán hoàn tất trước đó!");
        }

        String nganHang = "Vietcombank";
        String maNganHang = "vietcombank";
        String soTaiKhoan = "1038034475";
        String tenChuTaiKhoan = "NGUYEN MAI NHUT TAN";
        String noiDung = "MEDICARE " + hoaDon.getId();

        String qrImageUrl;
        try {
            String noiDungEncoded = URLEncoder.encode(noiDung, StandardCharsets.UTF_8.toString());
            String tenEncoded = URLEncoder.encode(tenChuTaiKhoan, StandardCharsets.UTF_8.toString());
            long amount = hoaDon.getTongTien() != null ? hoaDon.getTongTien().longValue() : 0L;
            qrImageUrl = String.format(
                    "https://img.vietqr.io/image/%s-%s-compact2.png?amount=%d&addInfo=%s&accountName=%s",
                    maNganHang, soTaiKhoan, amount, noiDungEncoded, tenEncoded
            );
        } catch (Exception e) {
            log.error("Lỗi khi sinh URL VietQR: ", e);
            qrImageUrl = "";
        }

        return ThongTinQrResponse.builder()
                .idHoaDon(hoaDon.getId())
                .soTien(hoaDon.getTongTien())
                .nganHang(nganHang)
                .maNganHang(maNganHang)
                .soTaiKhoan(soTaiKhoan)
                .tenChuTaiKhoan(tenChuTaiKhoan)
                .noiDung(noiDung)
                .qrImageUrl(qrImageUrl)
                .qrQuickLink(qrImageUrl)
                .build();
    }

    @Override
    @Transactional
    public KetQuaThanhToanResponse xacNhanThanhToanQr(ThanhToanQrRequest request) {
        log.info("Bắt đầu xử lý xác nhận thanh toán qua QR cho hóa đơn: {}", request.getIdHoaDon());

        if (request.getIdHoaDon() == null || request.getIdHoaDon().trim().isEmpty()) {
            throw new IllegalArgumentException("Mã hóa đơn không được để trống!");
        }

        HoaDon hoaDon = hoaDonRepository.findById(request.getIdHoaDon())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hóa đơn với mã: " + request.getIdHoaDon()));

        // Chặn thanh toán lại nếu hóa đơn đã thanh toán hoàn tất (E3)
        if ("DA_THANH_TOAN".equalsIgnoreCase(hoaDon.getTrangThai())) {
            throw new IllegalStateException("Hóa đơn này đã được thanh toán hoàn tất trước đó! Không thể thanh toán lại.");
        }

        BigDecimal tongTien = hoaDon.getTongTien();

        // Tìm hoặc tạo mới bản ghi ThanhToan (1-1 với HoaDon)
        ThanhToan thanhToan = thanhToanRepository.findByHoaDon_Id(hoaDon.getId())
                .orElseGet(() -> {
                    ThanhToan tt = new ThanhToan();
                    tt.setId("TT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
                    tt.setHoaDon(hoaDon);
                    tt.setSoTien(tongTien);
                    tt.setNgayTao(LocalDateTime.now());
                    tt.setTrangThai("DANG_XU_LY");
                    return thanhToanRepository.save(tt);
                });

        // Tạo bản ghi GiaoDichThanhToan qua QR/Ngân hàng
        String maGiaoDich = (request.getMaGiaoDichNgoai() != null && !request.getMaGiaoDichNgoai().trim().isEmpty())
                ? request.getMaGiaoDichNgoai()
                : "QR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        GiaoDichThanhToan giaoDich = new GiaoDichThanhToan();
        giaoDich.setIdGiaoDich("GD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        giaoDich.setThanhToan(thanhToan);
        giaoDich.setMaGiaoDich(maGiaoDich);
        giaoDich.setPhuongThuc("VNPAY_QR");
        giaoDich.setSoTien(tongTien);
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

        log.info("Xác nhận thanh toán QR thành công cho hóa đơn: {}, mã giao dịch: {}",
                hoaDon.getId(), maGiaoDich);

        return KetQuaThanhToanResponse.builder()
                .idThanhToan(thanhToan.getId())
                .idGiaoDich(giaoDich.getIdGiaoDich())
                .maGiaoDich(giaoDich.getMaGiaoDich())
                .idHoaDon(hoaDon.getId())
                .phuongThuc("VNPAY_QR")
                .soTien(tongTien)
                .trangThai("THANH_CONG")
                .thoiGian(giaoDich.getThoiGian())
                .thongBao("Xác nhận thanh toán qua QR/Ngân hàng thành công cho hóa đơn " + hoaDon.getId())
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

    @Override
    @Transactional
    public VNPayPaymentResponse taoGiaoDichVNPay(String idHoaDon) {
        log.info("Bắt đầu khởi tạo giao dịch VNPay cho hóa đơn: {}", idHoaDon);

        if (idHoaDon == null || idHoaDon.trim().isEmpty()) {
            throw new IllegalArgumentException("Mã hóa đơn không được để trống!");
        }

        HoaDon hoaDon = hoaDonRepository.findById(idHoaDon)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hóa đơn với mã: " + idHoaDon));

        // Chặn nếu hóa đơn đã thanh toán hoàn tất (E3)
        if ("DA_THANH_TOAN".equalsIgnoreCase(hoaDon.getTrangThai())) {
            throw new IllegalStateException("Hóa đơn này đã được thanh toán hoàn tất trước đó! Không thể thanh toán lại.");
        }

        BigDecimal tongTien = hoaDon.getTongTien();

        // 1. Tìm hoặc tạo mới bản ghi ThanhToan (1-1 với HoaDon)
        ThanhToan thanhToan = thanhToanRepository.findByHoaDon_Id(hoaDon.getId())
                .orElseGet(() -> {
                    ThanhToan tt = new ThanhToan();
                    tt.setId("TT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
                    tt.setHoaDon(hoaDon);
                    tt.setSoTien(tongTien);
                    tt.setNgayTao(LocalDateTime.now());
                    tt.setTrangThai("DANG_XU_LY");
                    return thanhToanRepository.save(tt);
                });

        // 2. Tạo 1 bản ghi GiaoDichThanhToan mới (1 attempt theo REQ-088)
        GiaoDichThanhToan giaoDich = new GiaoDichThanhToan();
        giaoDich.setIdGiaoDich("GD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        giaoDich.setThanhToan(thanhToan);
        giaoDich.setMaGiaoDich("VNP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        giaoDich.setPhuongThuc("TRUC_TUYEN");
        giaoDich.setSoTien(tongTien);
        giaoDich.setTrangThai("DANG_XU_LY");
        giaoDich.setThoiGian(LocalDateTime.now());
        giaoDichThanhToanRepository.save(giaoDich);

        // 3. Gọi PaymentGateway để sinh URL thanh toán VNPay
        PaymentRequest paymentRequest = PaymentRequest.builder()
                .orderId(hoaDon.getId())
                .amount(tongTien)
                .orderInfo("Thanh toan vien phi Medicare " + hoaDon.getId())
                .build();

        PaymentResponse paymentResponse = paymentGateway.createPaymentRequest(paymentRequest);

        if (!"SUCCESS".equalsIgnoreCase(paymentResponse.getStatus())) {
            giaoDich.setTrangThai("THAT_BAI");
            giaoDichThanhToanRepository.save(giaoDich);
            throw new IllegalStateException("Không thể tạo liên kết thanh toán VNPay: " + paymentResponse.getMessage());
        }

        return VNPayPaymentResponse.builder()
                .idHoaDon(hoaDon.getId())
                .tongTien(tongTien)
                .paymentUrl(paymentResponse.getPaymentUrl())
                .maGiaoDich(giaoDich.getMaGiaoDich())
                .thoiGianTao(giaoDich.getThoiGian())
                .thongBao("Khởi tạo liên kết thanh toán VNPay thành công")
                .build();
    }

    @Override
    @Transactional
    public VNPayCallbackResponse xuLyKetQuaVNPay(Map<String, String> vnpParams) {
        log.info("Bắt đầu xử lý kết quả callback từ VNPay: {}", vnpParams);

        if (vnpParams == null || vnpParams.isEmpty()) {
            throw new IllegalArgumentException("Tham số callback từ VNPay không hợp lệ!");
        }

        // 1. Kiểm tra chữ ký bảo mật checksum SHA512
        boolean isValid = paymentGateway.verifyPaymentResult(vnpParams);
        if (!isValid) {
            log.error("Xác thực chữ ký VNPay thất bại! Dữ liệu có thể bị can thiệp trái phép.");
            throw new IllegalArgumentException("Chữ ký dữ liệu VNPay không hợp lệ (Checksum verification failed)!");
        }

        // 2. Trích xuất thông tin giao dịch
        String vnp_TxnRef = vnpParams.get("vnp_TxnRef");
        String vnp_ResponseCode = vnpParams.get("vnp_ResponseCode");
        String vnp_TransactionNo = vnpParams.get("vnp_TransactionNo");
        String vnp_BankCode = vnpParams.get("vnp_BankCode");
        String vnp_PayDate = vnpParams.get("vnp_PayDate");
        String vnp_AmountStr = vnpParams.get("vnp_Amount");

        if (vnp_TxnRef == null || vnp_TxnRef.isEmpty()) {
            throw new IllegalArgumentException("Mã tham chiếu đơn hàng (vnp_TxnRef) không được để trống!");
        }

        // Parse idHoaDon từ vnp_TxnRef (ví dụ HD-xxx_17281928392)
        String idHoaDon = vnp_TxnRef.contains("_") ? vnp_TxnRef.substring(0, vnp_TxnRef.lastIndexOf("_")) : vnp_TxnRef;

        HoaDon hoaDon = hoaDonRepository.findById(idHoaDon)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hóa đơn với mã: " + idHoaDon));

        BigDecimal soTien = (vnp_AmountStr != null && !vnp_AmountStr.isEmpty())
                ? new BigDecimal(vnp_AmountStr).divide(new BigDecimal(100))
                : hoaDon.getTongTien();

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

        // Tìm giao dịch gần nhất đang xử lý của thanh toán này
        List<GiaoDichThanhToan> dsGiaoDich = giaoDichThanhToanRepository.findByThanhToan_HoaDon_IdOrderByThoiGianDesc(hoaDon.getId());
        GiaoDichThanhToan giaoDich;
        if (!dsGiaoDich.isEmpty()) {
            giaoDich = dsGiaoDich.get(0);
        } else {
            giaoDich = new GiaoDichThanhToan();
            giaoDich.setIdGiaoDich("GD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            giaoDich.setThanhToan(thanhToan);
            giaoDich.setPhuongThuc("TRUC_TUYEN");
            giaoDich.setSoTien(soTien);
            giaoDich.setThoiGian(LocalDateTime.now());
        }

        boolean isThanhCong = "00".equals(vnp_ResponseCode);

        if (isThanhCong) {
            // Thanh toán thành công!
            giaoDich.setTrangThai("THANH_CONG");
            if (vnp_TransactionNo != null && !vnp_TransactionNo.isEmpty()) {
                giaoDich.setMaGiaoDich("VNP-" + vnp_TransactionNo);
            }
            giaoDich.setThoiGian(LocalDateTime.now());
            giaoDichThanhToanRepository.save(giaoDich);

            thanhToan.setTrangThai("THANH_CONG");
            thanhToanRepository.save(thanhToan);

            hoaDon.setTrangThai("DA_THANH_TOAN");
            hoaDonRepository.save(hoaDon);

            LuotKham luotKham = hoaDon.getLuotKham();
            if (luotKham != null) {
                luotKham.setTrangThai("HOAN_TAT");
                luotKhamRepository.save(luotKham);
            }

            log.info("Xử lý thanh toán VNPay thành công cho hóa đơn: {}, Mã GD VNPay: {}", idHoaDon, vnp_TransactionNo);

            String thoiGianHienThi = LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss dd/MM/yyyy"));
            if (vnp_PayDate != null && vnp_PayDate.length() == 14) {
                try {
                    LocalDateTime dt = LocalDateTime.parse(vnp_PayDate, DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
                    thoiGianHienThi = dt.format(DateTimeFormatter.ofPattern("HH:mm:ss dd/MM/yyyy"));
                } catch (Exception ignored) {}
            }

            return VNPayCallbackResponse.builder()
                    .idHoaDon(hoaDon.getId())
                    .maGiaoDich(giaoDich.getMaGiaoDich())
                    .maGiaoDichVNPay(vnp_TransactionNo)
                    .soTien(soTien)
                    .nganHang(vnp_BankCode)
                    .thoiGianThanhToan(vnp_PayDate)
                    .thoiGian(thoiGianHienThi)
                    .trangThai("THANH_CONG")
                    .thanhCong(true)
                    .maPhanHoi(vnp_ResponseCode)
                    .thongBao("Giao dịch thanh toán trực tuyến qua VNPay thành công!")
                    .build();
        } else {
            // Thanh toán thất bại hoặc người dùng hủy
            giaoDich.setTrangThai("THAT_BAI");
            giaoDich.setThoiGian(LocalDateTime.now());
            giaoDichThanhToanRepository.save(giaoDich);

            // Giữ nguyên hóa đơn là CHUA_THANH_TOAN để khách có thể thanh toán lại theo SRS
            log.warn("Thanh toán VNPay không thành công cho hóa đơn: {}, Mã phản hồi: {}", idHoaDon, vnp_ResponseCode);

            String thoiGianHienThi = LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss dd/MM/yyyy"));
            if (vnp_PayDate != null && vnp_PayDate.length() == 14) {
                try {
                    LocalDateTime dt = LocalDateTime.parse(vnp_PayDate, DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
                    thoiGianHienThi = dt.format(DateTimeFormatter.ofPattern("HH:mm:ss dd/MM/yyyy"));
                } catch (Exception ignored) {}
            }

            String thongBaoLoi = "Giao dịch không thành công hoặc người dùng đã hủy (Mã lỗi: " + vnp_ResponseCode + ")";
            if ("24".equals(vnp_ResponseCode)) {
                thongBaoLoi = "Khách hàng đã hủy giao dịch thanh toán trên cổng VNPay.";
            } else if ("11".equals(vnp_ResponseCode)) {
                thongBaoLoi = "Giao dịch hết hạn thanh toán.";
            }

            return VNPayCallbackResponse.builder()
                    .idHoaDon(hoaDon.getId())
                    .maGiaoDich(giaoDich.getMaGiaoDich())
                    .maGiaoDichVNPay(vnp_TransactionNo)
                    .soTien(soTien)
                    .nganHang(vnp_BankCode)
                    .thoiGianThanhToan(vnp_PayDate)
                    .thoiGian(thoiGianHienThi)
                    .trangThai("THAT_BAI")
                    .thanhCong(false)
                    .maPhanHoi(vnp_ResponseCode)
                    .thongBao(thongBaoLoi)
                    .build();
        }
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

