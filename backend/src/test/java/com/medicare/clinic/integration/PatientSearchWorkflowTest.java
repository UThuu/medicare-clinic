package com.medicare.clinic.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medicare.clinic.entity.*;
import com.medicare.clinic.entity.enums.*;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Map;
import java.util.stream.Stream;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:uc28-workflow;DB_CLOSE_DELAY=-1;MODE=MySQL",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa", "spring.datasource.password=",
    "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
    "spring.jpa.hibernate.ddl-auto=create-drop", "spring.jpa.show-sql=false",
    "spring.sql.init.mode=never"
})
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class PatientSearchWorkflowTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired EntityManager em;
    private static final String PASSWORD = "synthetic-uc28-test-only";
    private static final String PATH = "/api/benhnhan/tim-kiem";

    @BeforeEach
    void fixtures() {
        NhanVien receptionist = employee("UC28-RECEPTION");
        LeTan lt = new LeTan(); lt.setMaNv(receptionist.getMaNv()); lt.setNhanVien(receptionist);
        lt.setCaLamViec("Test"); em.persist(lt); account("uc28-reception", receptionist, null);
        NhanVien doctor = employee("UC28-DOCTOR");
        BacSi bs = new BacSi(); bs.setMaNv(doctor.getMaNv()); bs.setNhanVien(doctor);
        bs.setChuyenKhoa("Test"); bs.setBangCap("Test"); em.persist(bs); account("uc28-doctor", doctor, null);
        BenhNhan first = patient("UC28-A", "Nguyễn Thị Ánh", "1990-01-01", "0901234567");
        patient("UC28-B", "Nguyễn Thị Ánh", "2000-02-02", "0901234599");
        account("uc28-patient", null, first);
        em.flush(); em.clear();
    }
    @Test void receptionistLoginPhoneSearchReturnsPersistedPatient() throws Exception {
        MockHttpSession session = login("uc28-reception");
        mvc.perform(get("/api/auth/me").session(session)).andExpect(status().isOk())
                .andExpect(jsonPath("$.vaiTro").value("LE_TAN"));
        search(session, Map.of("soDienThoai", " 0901234567 ")).andExpect(status().isOk())
                .andExpect(jsonPath("$.tongSoKetQua").value(1))
                .andExpect(jsonPath("$.danhSachBenhNhan[0].idBenhNhan").value("UC28-A"))
                .andExpect(jsonPath("$.danhSachBenhNhan[0].hoTen").value("Nguyễn Thị Ánh"))
                .andExpect(jsonPath("$.danhSachBenhNhan[0].ngaySinh").value("1990-01-01"))
                .andExpect(jsonPath("$.danhSachBenhNhan[0].soDienThoai").value("0901234567"))
                .andExpect(jsonPath("$.danhSachBenhNhan[0].matKhauHash").doesNotExist());
        assertEquals(2L, em.createQuery("select count(p) from BenhNhan p", Long.class).getSingleResult());
    }
    @Test void phoneSubstringCanMatchSeveralPersistedProfiles() throws Exception {
        search(login("uc28-reception"), Map.of("soDienThoai", "09012345"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.tongSoKetQua").value(2))
                .andExpect(jsonPath("$.danhSachBenhNhan.length()").value(2));
    }
    @Test void nameAndDobDistinguishPatientsWithEqualNames() throws Exception {
        search(login("uc28-reception"), Map.of("hoTen", "  nguyễn thị ánh  ", "ngaySinh", "1990-01-01"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.tongSoKetQua").value(1))
                .andExpect(jsonPath("$.danhSachBenhNhan[0].idBenhNhan").value("UC28-A"));
    }
    @Test void noMatchReturnsEmptyListNotErrorOrDemoData() throws Exception {
        search(login("uc28-reception"), Map.of("soDienThoai", "0700000000"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.tongSoKetQua").value(0))
                .andExpect(jsonPath("$.danhSachBenhNhan").isEmpty());
    }
    static Stream<Map<String, Object>> invalidRequests() {
        return Stream.of(Map.of(), Map.of("soDienThoai", " "),
                Map.of("soDienThoai", "abcdefgh"), Map.of("soDienThoai", "0901234"),
                Map.of("soDienThoai", "0".repeat(21)), Map.of("soDienThoai", "........"),
                Map.of("hoTen", "Test"), Map.of("ngaySinh", "1990-01-01"),
                Map.of("soDienThoai", "0901234567", "hoTen", "Test"),
                Map.of("soDienThoai", "0901234567", "ngaySinh", "1990-01-01"),
                Map.of("hoTen", "Test", "ngaySinh", "2999-01-01"),
                Map.of("hoTen", "x".repeat(101), "ngaySinh", "1990-01-01"));
    }
    @ParameterizedTest @MethodSource("invalidRequests")
    void invalidInputRejectedBeforeQuery(Map<String, Object> body) throws Exception {
        search(login("uc28-reception"), body).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").isNotEmpty());
    }
    @Test void malformedDateAndJsonRejected() throws Exception {
        MockHttpSession session = login("uc28-reception");
        search(session, Map.of("hoTen", "Test", "ngaySinh", "1990-13-01"))
                .andExpect(status().isBadRequest());
        mvc.perform(post(PATH).session(session).contentType("application/json").content("null"))
                .andExpect(status().isBadRequest());
        mvc.perform(post(PATH).session(session).contentType("application/json").content("{"))
                .andExpect(status().isBadRequest());
    }
    @ParameterizedTest @ValueSource(strings = {"uc28-doctor", "uc28-patient"})
    void wrongRoleCannotReadPatientSearch(String username) throws Exception {
        search(login(username), Map.of("soDienThoai", "0901234567"))
                .andExpect(status().isForbidden());
    }
    @Test void unauthenticatedAndLoggedOutRequestsDenied() throws Exception {
        mvc.perform(post(PATH).contentType("application/json").content("{}"))
                .andExpect(status().isUnauthorized());
        MockHttpSession session = login("uc28-reception");
        mvc.perform(post("/api/auth/logout").session(session)).andExpect(status().isNoContent());
        assertTrue(session.isInvalid());
        mvc.perform(post(PATH).contentType("application/json").content("{}"))
                .andExpect(status().isUnauthorized());
    }
    @Test void unfinishedCreationEndpointIsNotExposedOrWritingPatients() throws Exception {
        MockHttpSession session = login("uc28-reception");
        mvc.perform(post("/api/benhnhan/tao-moi").session(session).contentType("application/json")
                .content(json.writeValueAsString(Map.of("hoTen", "Inactive creation",
                        "ngaySinh", "1990-01-01", "gioiTinh", "NU", "soDienThoai", "0909999999"))))
                .andExpect(status().isNotFound());
        assertEquals(2L, em.createQuery("select count(p) from BenhNhan p", Long.class).getSingleResult());
    }
    @Test void unfinishedReminderEndpointIsNotExposed() throws Exception {
        mvc.perform(post("/api/benhnhan/thong-bao-lich-kham").session(login("uc28-patient"))
                .contentType("application/json").content("{}"))
                .andExpect(status().isNotFound());
    }
    private NhanVien employee(String id) {
        NhanVien nv = new NhanVien(); nv.setMaNv(id); nv.setHoTen("Synthetic staff");
        nv.setSdt("0000000000"); em.persist(nv); return nv;
    }
    private BenhNhan patient(String id, String name, String dob, String phone) {
        BenhNhan bn = new BenhNhan(); bn.setIdBenhNhan(id); bn.setHoTen(name);
        bn.setNgaySinh(LocalDate.parse(dob)); bn.setGioiTinh(GioiTinh.NU);
        bn.setSoDienThoai(phone); bn.setDiaChi("Synthetic address"); em.persist(bn); return bn;
    }
    private void account(String username, NhanVien employee, BenhNhan patient) {
        TaiKhoan tk = new TaiKhoan(); tk.setIdTaiKhoan(username); tk.setTenDangNhap(username);
        tk.setNhanVien(employee); tk.setBenhNhan(patient); tk.setTrangThai(TrangThaiTaiKhoan.HOAT_DONG);
        tk.setMatKhauHash(new BCryptPasswordEncoder().encode(PASSWORD)); em.persist(tk);
    }
    private MockHttpSession login(String username) throws Exception {
        return (MockHttpSession) mvc.perform(post("/api/auth/login").contentType("application/json")
                .content(json.writeValueAsString(Map.of("tenDangNhap", username, "matKhau", PASSWORD))))
                .andExpect(status().isOk()).andReturn().getRequest().getSession(false);
    }
    private org.springframework.test.web.servlet.ResultActions search(MockHttpSession session, Object body) throws Exception {
        return mvc.perform(post(PATH).session(session).contentType("application/json")
                .content(json.writeValueAsString(body)));
    }
}
