package com.medicare.clinic.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medicare.clinic.entity.*;
import com.medicare.clinic.entity.enums.*;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** Full HTTP/session/service/repository smoke test; fixtures exist only in H2. */
@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:uc10-workflow;DB_CLOSE_DELAY=-1;MODE=MySQL",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa", "spring.datasource.password=",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.jpa.hibernate.ddl-auto=create-drop", "spring.jpa.show-sql=false",
        "spring.sql.init.mode=never"
})
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ExaminationWorkflowTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired EntityManager em;
    private static final LocalDate DAY = LocalDate.of(2026, 10, 10);
    private static final String PASSWORD = "synthetic-test-only";

    @BeforeEach
    void fixtures() {
        NhanVien doctor = employee("SMOKE-DR");
        BacSi bs = new BacSi(); bs.setMaNv(doctor.getMaNv()); bs.setNhanVien(doctor);
        bs.setChuyenKhoa("Test"); bs.setBangCap("Test"); em.persist(bs);
        account("SMOKE-AUTH", "smoke-doctor", doctor, null);
        NhanVien nurse = employee("SMOKE-NURSE");
        DieuDuong dd = new DieuDuong(); dd.setMaNv(nurse.getMaNv()); dd.setNhanVien(nurse);
        dd.setKhoaLamViec("Test"); em.persist(dd);
        BenhNhan patient = new BenhNhan(); patient.setIdBenhNhan("SMOKE-PATIENT");
        patient.setHoTen("Synthetic Patient"); patient.setNgaySinh(LocalDate.of(1990, 1, 1));
        patient.setGioiTinh(GioiTinh.NAM); patient.setSoDienThoai("0000000000"); em.persist(patient);
        account("SMOKE-PATIENT-AUTH", "smoke-patient", null, patient);
        schedule("SMOKE-SCHEDULE", "SMOKE-VISIT", DAY, patient, bs, TrangThaiLuotKham.CHO_KHAM);
        em.flush(); em.clear();
    }

    @Test
    void loginScheduleRecordStartAndSaveKeepInProgress() throws Exception {
        vitals("SMOKE-VISIT");
        mvc.perform(get("/api/doctor/schedules")).andExpect(status().isUnauthorized());
        MockHttpSession session = login("smoke-doctor");
        mvc.perform(get("/api/auth/me").session(session)).andExpect(status().isOk())
                .andExpect(jsonPath("$.vaiTro").value("BAC_SI"));
        mvc.perform(get("/api/doctor/schedules").param("date", DAY.toString()).session(session))
                .andExpect(status().isOk()).andExpect(jsonPath("$[0].idLichKham").value("SMOKE-SCHEDULE"))
                .andExpect(jsonPath("$[0].trangThaiLuotKham").value("CHO_KHAM"));
        record(session).andExpect(jsonPath("$.luotKhamHienTai.trangThai").value("CHO_KHAM"))
                .andExpect(jsonPath("$.sinhHieuHienTai.idLuotKhamNguon").value("SMOKE-VISIT"));
        save(session, "Before start").andExpect(status().isBadRequest());
        start(session).andExpect(status().isOk());
        start(session).andExpect(status().isOk());
        save(session, " First saved ").andExpect(status().isOk());
        record(session).andExpect(jsonPath("$.luotKhamHienTai.trangThai").value("DANG_KHAM"))
                .andExpect(jsonPath("$.luotKhamHienTai.chanDoan").value("First saved"));
        save(session, "Latest saved").andExpect(status().isOk());
        em.flush(); em.clear();
        LuotKham saved = em.find(LuotKham.class, "SMOKE-VISIT");
        assertEquals(TrangThaiLuotKham.DANG_KHAM, saved.getTrangThai());
        assertEquals("Latest saved", saved.getChanDoan());
        record(session).andExpect(jsonPath("$.luotKhamHienTai.chanDoan").value("Latest saved"));
        mvc.perform(post("/api/auth/logout").session(session)).andExpect(status().isNoContent());
        assertTrue(session.isInvalid());
        mvc.perform(get("/api/doctor/schedules")).andExpect(status().isUnauthorized());
    }

    @Test
    void historicalVitalsDoNotAllowStartingCurrentVisit() throws Exception {
        schedule("OLD-SCHEDULE", "OLD-VISIT", DAY.minusDays(1), em.find(BenhNhan.class, "SMOKE-PATIENT"),
                em.find(BacSi.class, "SMOKE-DR"), TrangThaiLuotKham.HOAN_TAT);
        em.flush(); vitals("OLD-VISIT");
        MockHttpSession session = login("smoke-doctor");
        record(session).andExpect(jsonPath("$.sinhHieuHienTai").isEmpty())
                .andExpect(jsonPath("$.sinhHieuMoiNhat.idLuotKhamNguon").value("OLD-VISIT"));
        start(session).andExpect(status().isBadRequest());
        save(session, "Blocked").andExpect(status().isBadRequest());
        assertEquals(TrangThaiLuotKham.CHO_KHAM, em.find(LuotKham.class, "SMOKE-VISIT").getTrangThai());
    }

    @ParameterizedTest
    @ValueSource(strings = {"systolic", "diastolic", "weight", "temperature"})
    void eachMissingCurrentVitalBlocksStart(String field) throws Exception {
        vitals("SMOKE-VISIT");
        SinhHieu sh = em.find(SinhHieu.class, "VITAL-SMOKE-VISIT");
        switch (field) {
            case "systolic" -> sh.setHuyetApTamThu(null);
            case "diastolic" -> sh.setHuyetApTamTruong(null);
            case "weight" -> sh.setCanNang(null);
            case "temperature" -> sh.setNhietDo(null);
        }
        em.flush(); em.clear();
        start(login("smoke-doctor")).andExpect(status().isBadRequest());
        assertEquals(TrangThaiLuotKham.CHO_KHAM, em.find(LuotKham.class, "SMOKE-VISIT").getTrangThai());
    }

    @Test
    void patientAndUnassignedDoctorCannotExamine() throws Exception {
        vitals("SMOKE-VISIT");
        MockHttpSession patient = login("smoke-patient");
        mvc.perform(get("/api/doctor/schedules").session(patient)).andExpect(status().isForbidden());
        mvc.perform(get("/api/doctor/medical-record/SMOKE-SCHEDULE").session(patient)).andExpect(status().isForbidden());
        start(patient).andExpect(status().isForbidden());
        save(patient, "Blocked").andExpect(status().isForbidden());
        NhanVien other = employee("OTHER-DR");
        BacSi bs = new BacSi(); bs.setMaNv(other.getMaNv()); bs.setNhanVien(other);
        bs.setChuyenKhoa("Test"); bs.setBangCap("Test"); em.persist(bs);
        account("OTHER-AUTH", "other-doctor", other, null); em.flush(); em.clear();
        MockHttpSession otherSession = login("other-doctor");
        mvc.perform(get("/api/doctor/medical-record/SMOKE-SCHEDULE").session(otherSession)).andExpect(status().isForbidden());
        // The existing examination API maps ownership validation to HTTP 400.
        start(otherSession).andExpect(status().isBadRequest());
        save(otherSession, "Blocked").andExpect(status().isBadRequest());
        LuotKham unchanged = em.find(LuotKham.class, "SMOKE-VISIT");
        assertEquals(TrangThaiLuotKham.CHO_KHAM, unchanged.getTrangThai());
        assertNull(unchanged.getChanDoan());
    }

    @Test
    void completedVisitRejectsStartAndSave() throws Exception {
        vitals("SMOKE-VISIT");
        em.find(LuotKham.class, "SMOKE-VISIT").setTrangThai(TrangThaiLuotKham.HOAN_TAT);
        em.flush(); em.clear();
        MockHttpSession session = login("smoke-doctor");
        start(session).andExpect(status().isBadRequest());
        save(session, "Blocked").andExpect(status().isBadRequest());
        assertEquals(TrangThaiLuotKham.HOAN_TAT, em.find(LuotKham.class, "SMOKE-VISIT").getTrangThai());
    }

    private NhanVien employee(String id) {
        NhanVien nv = new NhanVien(); nv.setMaNv(id); nv.setHoTen("Synthetic Staff");
        nv.setSdt("0000000000"); em.persist(nv); return nv;
    }
    private void account(String id, String login, NhanVien nv, BenhNhan patient) {
        TaiKhoan account = new TaiKhoan(); account.setIdTaiKhoan(id); account.setTenDangNhap(login);
        account.setMatKhauHash(new BCryptPasswordEncoder(4).encode(PASSWORD));
        account.setTrangThai(TrangThaiTaiKhoan.HOAT_DONG); account.setNhanVien(nv); account.setBenhNhan(patient);
        em.persist(account);
    }
    private void schedule(String id, String visitId, LocalDate day, BenhNhan patient, BacSi doctor, TrangThaiLuotKham state) {
        LichKham lk = new LichKham(); lk.setIdLichKham(id); lk.setBenhNhan(patient); lk.setBacSi(doctor);
        lk.setNgayKham(day); lk.setGioKham(LocalTime.of(9, 0)); lk.setTrangThai(TrangThaiLichKham.DA_TIEP_NHAN);
        lk.setPhuongThucDatLich(PhuongThucDatLich.TRUC_TIEP); em.persist(lk);
        LuotKham visit = new LuotKham(); visit.setIdLuotKham(visitId); visit.setLichKham(lk);
        visit.setTrangThai(state); visit.setLyDoKham("Synthetic fixture"); em.persist(visit);
    }
    private void vitals(String visitId) {
        SinhHieu sh = new SinhHieu(); sh.setIdSinhHieu("VITAL-" + visitId);
        sh.setLuotKham(em.find(LuotKham.class, visitId)); sh.setDieuDuong(em.find(DieuDuong.class, "SMOKE-NURSE"));
        sh.setHuyetApTamThu(120); sh.setHuyetApTamTruong(80); sh.setCanNang(new BigDecimal("60"));
        sh.setNhietDo(new BigDecimal("36.5")); sh.setThoiDiemDo(LocalDateTime.of(DAY, LocalTime.of(8, 50)));
        em.persist(sh); em.flush(); em.clear();
    }
    private MockHttpSession login(String user) throws Exception {
        return (MockHttpSession) mvc.perform(post("/api/auth/login").contentType("application/json")
                .content(json.writeValueAsString(Map.of("tenDangNhap", user, "matKhau", PASSWORD))))
                .andExpect(status().isOk()).andReturn().getRequest().getSession(false);
    }
    private org.springframework.test.web.servlet.ResultActions record(MockHttpSession session) throws Exception {
        return mvc.perform(get("/api/doctor/medical-record/SMOKE-SCHEDULE").session(session)).andExpect(status().isOk());
    }
    private org.springframework.test.web.servlet.ResultActions start(MockHttpSession session) throws Exception {
        return mvc.perform(post("/api/khambenh/SMOKE-SCHEDULE/bat-dau").session(session));
    }
    private org.springframework.test.web.servlet.ResultActions save(MockHttpSession session, String diagnosis) throws Exception {
        return mvc.perform(post("/api/khambenh/ket-qua").session(session).contentType("application/json")
                .content(json.writeValueAsString(Map.of("idLichKham", "SMOKE-SCHEDULE", "trieuChung", " Symptoms ",
                        "ketQuaKham", " Results ", "chanDoan", diagnosis))));
    }
}
