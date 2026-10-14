package com.medicare.clinic.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medicare.clinic.dto.response.LoginResponse;
import com.medicare.clinic.entity.*;
import com.medicare.clinic.entity.enums.*;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.*;
import java.util.Map;

@SpringBootTest(properties={"spring.datasource.url=jdbc:h2:mem:clinical-fixes;DB_CLOSE_DELAY=-1;MODE=MySQL",
        "spring.jpa.hibernate.ddl-auto=create-drop", "spring.sql.init.mode=never", "debug=false"})
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
abstract class ClinicalWorkflowFixture {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired EntityManager em;

    @BeforeEach void clinicalData() {
        for (int i=1;i<=2;i++) {
            NhanVien employee=employee("DR"+i);
            BacSi doctor=new BacSi(); doctor.setMaNv(employee.getMaNv()); doctor.setNhanVien(employee);
            doctor.setBangCap("Demo"); doctor.setChuyenKhoa("Demo"); em.persist(doctor);
            BenhNhan patient=new BenhNhan(); patient.setIdBenhNhan("P"+i); patient.setHoTen("Synthetic patient "+i);
            patient.setNgaySinh(LocalDate.of(1990,1,1)); patient.setGioiTinh(GioiTinh.NAM); patient.setSoDienThoai("090000000"+i); em.persist(patient);
            LichKham schedule=new LichKham(); schedule.setIdLichKham("S"+i); schedule.setBenhNhan(patient); schedule.setBacSi(doctor);
            schedule.setNgayKham(LocalDate.of(2026,10,14)); schedule.setGioKham(LocalTime.of(10,i*10));
            schedule.setTrangThai(TrangThaiLichKham.DA_TIEP_NHAN); schedule.setPhuongThucDatLich(PhuongThucDatLich.TRUC_TIEP); em.persist(schedule);
            LuotKham visit=new LuotKham(); visit.setIdLuotKham("V"+i); visit.setLichKham(schedule);
            visit.setTrangThai(TrangThaiLuotKham.DANG_KHAM); visit.setChanDoan("Synthetic diagnosis"); em.persist(visit);
            NhanVien nurseEmployee=employee("N"+i); DieuDuong nurse=new DieuDuong(); nurse.setMaNv(nurseEmployee.getMaNv());
            nurse.setNhanVien(nurseEmployee); nurse.setKhoaLamViec("Demo"); em.persist(nurse);
        }
        NhanVien cashierEmployee=employee("C1"); ThuNgan cashier=new ThuNgan(); cashier.setMaNv("C1");
        cashier.setNhanVien(cashierEmployee); cashier.setCaLamViec("Demo"); em.persist(cashier);
        Thuoc medicine=new Thuoc(); medicine.setIdThuoc("M1"); medicine.setTenThuoc("Synthetic medicine");
        medicine.setDonViTinh("Demo"); medicine.setDonGia(new BigDecimal("1000")); em.persist(medicine);
        DonThuoc prescription=new DonThuoc(); prescription.setId("RX1"); prescription.setLuotKham(em.find(LuotKham.class,"V1"));
        prescription.setNgayKe(LocalDate.of(2026,10,14)); em.persist(prescription);
        ChiTietDonThuoc item=new ChiTietDonThuoc(); item.setId("ITEM1"); item.setDonThuoc(prescription); item.setThuoc(medicine);
        item.setSoLuong(1); item.setLieuLuong("Demo"); item.setDonGia(new BigDecimal("1000")); em.persist(item);
        SinhHieu vitals=new SinhHieu(); vitals.setIdSinhHieu("SH1"); vitals.setLuotKham(em.find(LuotKham.class,"V1"));
        vitals.setDieuDuong(em.find(DieuDuong.class,"N1")); vitals.setHuyetApTamThu(120); vitals.setHuyetApTamTruong(80);
        vitals.setCanNang(new BigDecimal("60")); vitals.setNhietDo(new BigDecimal("36.5")); vitals.setThoiDiemDo(LocalDateTime.of(2026,10,14,9,0)); em.persist(vitals);
        em.flush(); em.clear();
    }
    private NhanVien employee(String id) {
        NhanVien employee=new NhanVien(); employee.setMaNv(id); employee.setHoTen("Synthetic "+id); employee.setSdt("0900000000"); em.persist(employee); return employee;
    }
    MockHttpSession session(String role, String employee) {
        LoginResponse user=new LoginResponse(); user.setVaiTro(role); user.setMaNv(employee); user.setIdBenhNhan("P1");
        MockHttpSession session=new MockHttpSession(); session.setAttribute("AUTH_USER",user); return session;
    }
    String prescriptionBody(int quantity, String dose) throws Exception {
        return json.writeValueAsString(Map.of("idLuotKham","V2","chiTietDonThuoc",java.util.List.of(
                Map.of("idThuoc","M1","soLuong",quantity,"lieuLuong",dose))));
    }
    HoaDon invoice(String id,String visit,TrangThaiHoaDon status) {
        HoaDon invoice=new HoaDon(); invoice.setId(id); invoice.setLuotKham(em.find(LuotKham.class,visit));
        invoice.setThuNgan(em.find(ThuNgan.class,"C1")); invoice.setNgayTao(LocalDateTime.now());
        invoice.setTongTien(new BigDecimal("151000")); invoice.setTrangThai(status); em.persist(invoice); em.flush(); return invoice;
    }
}
