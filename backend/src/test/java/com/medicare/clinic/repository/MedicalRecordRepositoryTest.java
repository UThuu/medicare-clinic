package com.medicare.clinic.repository;

import com.medicare.clinic.entity.*;
import com.medicare.clinic.entity.enums.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
public class MedicalRecordRepositoryTest {

    @Autowired private TestEntityManager entityManager;
    @Autowired private LichKhamRepository lichKhamRepository;
    @Autowired private LuotKhamRepository luotKhamRepository;
    @Autowired private SinhHieuRepository sinhHieuRepository;
    @Autowired private BenhNhanDiUngRepository benhNhanDiUngRepository;
    @Autowired private DonThuocRepository donThuocRepository;

    private String idLichKhamTest;
    private String idBenhNhanTest;
    private String maNvTest;

    @BeforeEach
    public void setup() {
        NhanVien nv = new NhanVien();
        nv.setMaNv("NV_TEST");
        nv.setHoTen("Bac Si Test");
        nv.setSdt("0123456789");
        nv = entityManager.persist(nv);
        maNvTest = nv.getMaNv();

        BacSi bs = new BacSi();
        bs.setMaNv(nv.getMaNv());
        bs.setNhanVien(nv);
        bs.setChuyenKhoa("Noi khoa");
        bs.setBangCap("ThS");
        bs = entityManager.persist(bs);

        NhanVien nvDD = new NhanVien();
        nvDD.setMaNv("DD_TEST");
        nvDD.setHoTen("Dieu Duong Test");
        nvDD.setSdt("0999999999");
        nvDD = entityManager.persist(nvDD);

        DieuDuong dd = new DieuDuong();
        dd.setMaNv(nvDD.getMaNv());
        dd.setNhanVien(nvDD);
        dd.setKhoaLamViec("Noi Khoa");
        
        dd = entityManager.persist(dd);

        BenhNhan bn = new BenhNhan();
        bn.setIdBenhNhan("BN_TEST");
        bn.setHoTen("Benh Nhan Test");
        bn.setNgaySinh(LocalDate.of(1990, 1, 1));
        bn.setGioiTinh(GioiTinh.NAM);
        bn.setSoDienThoai("0987654321");
        bn = entityManager.persist(bn);
        idBenhNhanTest = bn.getIdBenhNhan();

        BenhNhanDiUng diUng = new BenhNhanDiUng();
        BenhNhanDiUngId diUngId = new BenhNhanDiUngId();
        diUngId.setIdBenhNhan(bn.getIdBenhNhan());
        diUngId.setThanhPhan("Penicillin");
        diUng.setId(diUngId);
        diUng.setBenhNhan(bn);
        diUng.setGhiChu("Di ung nhe");
        entityManager.persist(diUng);

        // Lich su cu
        LichKham lkOld = new LichKham();
        lkOld.setIdLichKham("LK_OLD");
        lkOld.setBenhNhan(bn);
        lkOld.setBacSi(bs);
        lkOld.setNgayKham(LocalDate.now().minusDays(10));
        lkOld.setGioKham(LocalTime.of(8, 0));
        lkOld.setTrangThai(TrangThaiLichKham.DA_TIEP_NHAN);
        lkOld.setPhuongThucDatLich(PhuongThucDatLich.TRUC_TIEP);
        lkOld = entityManager.persist(lkOld);

        LuotKham luotOld = new LuotKham();
        luotOld.setIdLuotKham("LUOT_OLD");
        luotOld.setLichKham(lkOld);
        luotOld.setTrangThai(TrangThaiLuotKham.HOAN_TAT);
        luotOld.setChanDoan("Cam cum");
        luotOld = entityManager.persist(luotOld);

        SinhHieu shOld = new SinhHieu();
        shOld.setIdSinhHieu("SH_OLD");
        shOld.setLuotKham(luotOld);
        shOld.setDieuDuong(dd);
        shOld.setHuyetApTamThu(120);
        shOld.setHuyetApTamTruong(80);
        shOld.setCanNang(new BigDecimal("60.5"));
        shOld.setNhietDo(new BigDecimal("37.0"));
        shOld.setThoiDiemDo(LocalDateTime.now().minusDays(10));
        entityManager.persist(shOld);

        DonThuoc dtOld = new DonThuoc();
        dtOld.setId("DT_OLD");
        dtOld.setLuotKham(luotOld);
        dtOld.setNgayKe(LocalDate.now().minusDays(10));
        dtOld.setGhiChu("Uong nhieu nuoc");
        entityManager.persist(dtOld);

        // Lich kham hien tai
        LichKham lkCurr = new LichKham();
        lkCurr.setIdLichKham("LK_CURR");
        lkCurr.setBenhNhan(bn);
        lkCurr.setBacSi(bs);
        lkCurr.setNgayKham(LocalDate.now());
        lkCurr.setGioKham(LocalTime.of(9, 0));
        lkCurr.setTrangThai(TrangThaiLichKham.DA_TIEP_NHAN);
        lkCurr.setPhuongThucDatLich(PhuongThucDatLich.TRUC_TIEP);
        lkCurr = entityManager.persist(lkCurr);
        idLichKhamTest = lkCurr.getIdLichKham();

        LuotKham luotCurr = new LuotKham();
        luotCurr.setIdLuotKham("LUOT_CURR");
        luotCurr.setLichKham(lkCurr);
        luotCurr.setTrangThai(TrangThaiLuotKham.DANG_KHAM);
        luotCurr.setTrieuChung("Dau dau");
        luotCurr = entityManager.persist(luotCurr);

        SinhHieu shCurr = new SinhHieu();
        shCurr.setIdSinhHieu("SH_CURR");
        shCurr.setLuotKham(luotCurr);
        shCurr.setDieuDuong(dd);
        shCurr.setHuyetApTamThu(130);
        shCurr.setHuyetApTamTruong(85);
        shCurr.setCanNang(new BigDecimal("61.0"));
        shCurr.setNhietDo(new BigDecimal("38.5"));
        shCurr.setThoiDiemDo(LocalDateTime.now());
        entityManager.persist(shCurr);

        // Benh nhan khac
        BenhNhan bnOther = new BenhNhan();
        bnOther.setIdBenhNhan("BN_OTHER");
        bnOther.setHoTen("Other");
        bnOther.setNgaySinh(LocalDate.of(1995, 1, 1));
        bnOther.setGioiTinh(GioiTinh.NU);
        bnOther.setSoDienThoai("0123123123");
        bnOther = entityManager.persist(bnOther);

        LichKham lkOther = new LichKham();
        lkOther.setIdLichKham("LK_OTHER");
        lkOther.setBenhNhan(bnOther);
        lkOther.setBacSi(bs);
        lkOther.setNgayKham(LocalDate.now());
        lkOther.setGioKham(LocalTime.of(10, 0));
        lkOther.setTrangThai(TrangThaiLichKham.DA_DAT);
        lkOther.setPhuongThucDatLich(PhuongThucDatLich.TRUC_TIEP);
        entityManager.persist(lkOther);

        entityManager.flush();
        entityManager.clear();
    }

    @Test
    public void testMedicalRecordQueries() {
        Optional<LichKham> lkOpt = lichKhamRepository.findByIdWithDetails(idLichKhamTest);
        assertThat(lkOpt).isPresent();
        assertThat(lkOpt.get().getBenhNhan().getIdBenhNhan()).isEqualTo(idBenhNhanTest);
        assertThat(lkOpt.get().getLuotKham().getIdLuotKham()).isEqualTo("LUOT_CURR");
        assertThat(lkOpt.get().getBacSi().getMaNv()).isEqualTo(maNvTest);

        List<LuotKham> history = luotKhamRepository.findHistoryByBenhNhanId(idBenhNhanTest, idLichKhamTest);
        assertThat(history).hasSize(1);
        assertThat(history.get(0).getIdLuotKham()).isEqualTo("LUOT_OLD");

        List<SinhHieu> latestVitals = sinhHieuRepository.findLatestByBenhNhanId(idBenhNhanTest, PageRequest.of(0, 1));
        assertThat(latestVitals).hasSize(1);
        assertThat(latestVitals.get(0).getIdSinhHieu()).isEqualTo("SH_CURR");

        List<BenhNhanDiUng> diUng = benhNhanDiUngRepository.findByBenhNhan_IdBenhNhan(idBenhNhanTest);
        assertThat(diUng).hasSize(1);
        assertThat(diUng.get(0).getId().getThanhPhan()).isEqualTo("Penicillin");

        List<BenhNhanDiUng> diUngOther = benhNhanDiUngRepository.findByBenhNhan_IdBenhNhan("BN_OTHER");
        assertThat(diUngOther).isEmpty();

        List<DonThuoc> donThuocs = donThuocRepository.findByLuotKham_IdLuotKhamIn(List.of("LUOT_OLD", "LUOT_CURR"));
        assertThat(donThuocs).hasSize(1);
        assertThat(donThuocs.get(0).getId()).isEqualTo("DT_OLD");
    }
}


