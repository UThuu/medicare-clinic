package com.medicare.clinic.service.impl;

import com.medicare.clinic.dto.request.HoaDonTongDoanhThuRequest;
import com.medicare.clinic.dto.request.HoaDonTraCuuRequest;
import com.medicare.clinic.dto.response.HoaDonTongDoanhThuResponse;
import com.medicare.clinic.dto.response.HoaDonTraCuuResponse;
import com.medicare.clinic.entity.BacSi;
import com.medicare.clinic.entity.BenhNhan;
import com.medicare.clinic.entity.ChiTietHoaDon;
import com.medicare.clinic.entity.HoaDon;
import com.medicare.clinic.entity.LichKham;
import com.medicare.clinic.entity.LuotKham;
import com.medicare.clinic.entity.NhanVien;
import com.medicare.clinic.entity.ThuNgan;
import com.medicare.clinic.entity.enums.TrangThaiHoaDon;
import com.medicare.clinic.repository.HoaDonRepository;
import com.medicare.clinic.service.interfaces.IHoaDonService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;


@Service
public class HoaDonService implements IHoaDonService {
    // TODO: implement business logic

    private HoaDonRepository hoaDonRepository;

    @Override
    public HoaDonTraCuuResponse traCuuHoaDon(HoaDonTraCuuRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Thong tin tra cuu hoa don khong duoc de trong.");
        }

        LocalDate tuNgay = request.getTuNgay();
        LocalDate denNgay = request.getDenNgay();

        if (tuNgay != null && denNgay != null && tuNgay.isAfter(denNgay)) {
            throw new IllegalArgumentException("Tu ngay khong duoc sau den ngay.");
        }

        String idHoaDon = chuanHoa(request.getIdHoaDon());
        String soDienThoai = chuanHoaSoDienThoai(request.getSoDienThoaiBenhNhan());
        TrangThaiHoaDon trangThai = request.getTrangThai();

        // Dung moc den ngay theo kieu exclusive de lay du toan bo ngay ket thuc.
        LocalDateTime tuNgayDateTime = tuNgay == null ? null : tuNgay.atStartOfDay();
        LocalDateTime denNgayExclusive = denNgay == null ? null : denNgay.plusDays(1).atStartOfDay();

        List<HoaDon> hoaDons = hoaDonRepository.traCuuHoaDon(
                idHoaDon,
                soDienThoai,
                tuNgayDateTime,
                denNgayExclusive,
                trangThai
        );

        List<HoaDonTraCuuResponse.HoaDonItem> danhSach = new ArrayList<>();
        for (HoaDon hoaDon : hoaDons) {
            danhSach.add(chuyenSangDTO(hoaDon));
        }

        HoaDonTraCuuResponse response = new HoaDonTraCuuResponse();
        response.setDanhSachHoaDon(danhSach);
        response.setTongSoKetQua(danhSach.size());
        response.setThongBao(danhSach.isEmpty()
                ? "Khong tim thay hoa don phu hop voi tieu chi tra cuu."
                : "Tim thay " + danhSach.size() + " hoa don.");
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

        String digits = value.replaceAll("\\D", "");
        if (digits.isEmpty()) {
            throw new IllegalArgumentException("So dien thoai phai chua it nhat mot chu so.");
        }
        return digits;
    }

    @Override
    public HoaDonTongDoanhThuResponse xemTongDoanhThu(HoaDonTongDoanhThuRequest request) {
        throw new UnsupportedOperationException("UC23 chua duoc trien khai.");
    }
}
