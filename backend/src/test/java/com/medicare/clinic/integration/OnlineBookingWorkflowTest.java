package com.medicare.clinic.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medicare.clinic.dto.auth.LoginResponse;
import com.medicare.clinic.entity.*;
import com.medicare.clinic.entity.enums.*;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.*;
import org.springframework.transaction.support.TransactionTemplate;
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(properties={"spring.datasource.url=jdbc:h2:mem:uc24-workflow;DB_CLOSE_DELAY=-1;MODE=MySQL", "spring.datasource.driver-class-name=org.h2.Driver", "spring.datasource.username=sa", "spring.datasource.password=", "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect", "spring.jpa.hibernate.ddl-auto=create-drop", "spring.jpa.show-sql=false", "spring.sql.init.mode=never"})
@AutoConfigureMockMvc @ActiveProfiles("test") @Transactional
class OnlineBookingWorkflowTest {
    @Autowired MockMvc mvc; @Autowired ObjectMapper json; @Autowired EntityManager em;
    @Autowired PlatformTransactionManager transactions;
    String doctor, patient; LocalDate date=LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh")).plusDays(1);
    @BeforeEach void fixtures() {
        doctor=UUID.randomUUID().toString(); patient=UUID.randomUUID().toString();
        new TransactionTemplate(transactions).execute(status -> {
            NhanVien nv=new NhanVien();nv.setMaNv(doctor);nv.setHoTen("Online doctor");nv.setSdt("0000000000");em.persist(nv);
            BacSi bs=new BacSi();bs.setMaNv(doctor);bs.setNhanVien(nv);bs.setChuyenKhoa("Test");bs.setBangCap("Test");em.persist(bs);
            BenhNhan bn=new BenhNhan();bn.setIdBenhNhan(patient);bn.setHoTen("Online patient");bn.setNgaySinh(LocalDate.of(1990,1,1));bn.setGioiTinh(GioiTinh.NU);bn.setSoDienThoai("0901234567");em.persist(bn);
            em.flush();return null;
        });
    }
    MockHttpSession session(String role) {MockHttpSession s=new MockHttpSession();LoginResponse u=new LoginResponse();u.setVaiTro(role);u.setIdBenhNhan(patient);s.setAttribute("AUTH_USER",u);return s;}
    Map<String,Object> booking(String time) {return new HashMap<>(Map.of("maBacSi",doctor,"ngayKham",date.toString(),"gioKham",time));}
    org.springframework.test.web.servlet.ResultActions book(Map<String,Object> data) throws Exception {return mvc.perform(post("/api/lichkham/dat-truc-tuyen").session(session("BENH_NHAN")).contentType("application/json").content(json.writeValueAsString(data)));}
    @Test void newPatientsCanChooseRealDoctorsAnd54SlotsWithoutHistory() throws Exception {
        String result=mvc.perform(get("/api/lichkham/bac-si-truc-tuyen").session(session("BENH_NHAN"))).andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        boolean found=false;for(var d:json.readTree(result).get("danhSachBacSi"))if(d.get("maBacSi").asText().equals(doctor)){found=true;assertEquals(0,d.get("soLanKhamTruoc").asInt());assertEquals("Test",d.get("chuyenKhoa").asText());}assertTrue(found);
        mvc.perform(get("/api/lichkham/khung-gio").session(session("BENH_NHAN")).param("maBacSi",doctor).param("ngayKham",date.toString())).andExpect(status().isOk()).andExpect(jsonPath("$.gioTrong.length()").value(54)).andExpect(jsonPath("$.gioTrong[0]").value("07:00:00")).andExpect(jsonPath("$.gioTrong[53]").value("15:50:00"));
    }
    @Test void bookingUsesSessionPatientAndCreatesOnlyDaDatOnlineAppointment() throws Exception {
        var data=booking("09:00");data.put("idBenhNhan","forged-patient");
        String result=book(data).andExpect(status().isOk()).andExpect(jsonPath("$.idBenhNhan").value(patient)).andExpect(jsonPath("$.trangThai").value("DA_DAT")).andExpect(jsonPath("$.phuongThucDatLich").value("TRUC_TUYEN")).andReturn().getResponse().getContentAsString();
        em.flush();em.clear();assertNull(em.find(LichKham.class,json.readTree(result).get("idLichKham").asText()).getLuotKham());
        book(data).andExpect(status().isConflict());
    }
    @Test void invalidTimesDatesDoctorsAndMalformedInputDoNotSave() throws Exception {
        for(var change:List.of(Map.of("maBacSi","missing"),Map.of("ngayKham",date.minusDays(3).toString()),Map.of("ngayKham","+10000-01-01"),Map.of("gioKham","06:50"),Map.of("gioKham","16:00"),Map.of("gioKham","09:05"),Map.of("gioKham","23:05"),Map.of("gioKham","09:00:01"),Map.of("gioKham","09:00:00.001"),Map.of("gioKham","25:00"))) {var data=booking("09:00");data.putAll(change);book(data).andExpect(status().isBadRequest());}
        mvc.perform(post("/api/lichkham/dat-truc-tuyen").session(session("BENH_NHAN")).contentType("application/json").content("{}")).andExpect(status().isBadRequest());
        assertEquals(0L,em.createQuery("select count(l) from LichKham l where l.bacSi.maNv=:doctor",Long.class).setParameter("doctor",doctor).getSingleResult());
    }
    @Test void incompleteProfileAndUnlinkedAccountAreRejected() throws Exception {
        BenhNhan p=em.find(BenhNhan.class,patient);p.setSoDienThoai("");em.flush();book(booking("09:00")).andExpect(status().isBadRequest());
        MockHttpSession s=session("BENH_NHAN");((LoginResponse)s.getAttribute("AUTH_USER")).setIdBenhNhan(null);
        mvc.perform(post("/api/lichkham/dat-truc-tuyen").session(s).contentType("application/json").content(json.writeValueAsString(booking("09:00")))).andExpect(status().isBadRequest());
    }
    @Test void familiarDoctorHistoryIsMappedAndPrioritized() throws Exception {
        var result=book(booking("09:00")).andReturn().getResponse().getContentAsString();
        LichKham lk=em.find(LichKham.class,json.readTree(result).get("idLichKham").asText());
        LuotKham visit=new LuotKham();visit.setIdLuotKham(UUID.randomUUID().toString());visit.setLichKham(lk);visit.setTrangThai(TrangThaiLuotKham.HOAN_TAT);em.persist(visit);em.flush();
        mvc.perform(post("/api/lichkham/bac-si-da-kham").session(session("BENH_NHAN"))).andExpect(status().isOk()).andExpect(jsonPath("$.danhSachBacSi[0].maBacSi").value(doctor)).andExpect(jsonPath("$.danhSachBacSi[0].soLanKhamTruoc").value(1));
        mvc.perform(get("/api/lichkham/bac-si-truc-tuyen").session(session("BENH_NHAN"))).andExpect(status().isOk()).andExpect(jsonPath("$.danhSachBacSi[0].maBacSi").value(doctor));
    }
    @Test void fullDaySuggestsExactlyThreeNearestFollowingDaySlots() throws Exception {
        for(LocalTime t=LocalTime.of(7,0);t.isBefore(LocalTime.of(16,0));t=t.plusMinutes(10)) {LichKham l=new LichKham();l.setIdLichKham(UUID.randomUUID().toString());l.setBenhNhan(em.find(BenhNhan.class,patient));l.setBacSi(em.find(BacSi.class,doctor));l.setNgayKham(date);l.setGioKham(t);l.setTrangThai(TrangThaiLichKham.DA_DAT);l.setPhuongThucDatLich(PhuongThucDatLich.TRUC_TUYEN);em.persist(l);}em.flush();
        mvc.perform(get("/api/lichkham/khung-gio").session(session("BENH_NHAN")).param("maBacSi",doctor).param("ngayKham",date.toString())).andExpect(status().isOk()).andExpect(jsonPath("$.gioTrong").isEmpty());
        var request=booking("09:00");request.remove("gioKham");request.put("gioKhamMongMuon","09:00");
        mvc.perform(post("/api/lichkham/goi-y-khung-gio-thay-the").session(session("BENH_NHAN")).contentType("application/json").content(json.writeValueAsString(request))).andExpect(status().isOk()).andExpect(jsonPath("$.danhSachKhungGio.length()").value(3)).andExpect(jsonPath("$.danhSachKhungGio[0].ngayKham").value(date.plusDays(1).toString())).andExpect(jsonPath("$.danhSachKhungGio[0].gioKham").value("07:00:00")).andExpect(jsonPath("$.danhSachKhungGio[2].gioKham").value("07:20:00"));
    }
    @Test void cancellationReleasesSlotAndBoundaryDatesDoNotOverflow() throws Exception {
        var result=book(booking("07:00")).andReturn().getResponse().getContentAsString();LichKham l=em.find(LichKham.class,json.readTree(result).get("idLichKham").asText());l.setTrangThai(TrangThaiLichKham.DA_HUY);em.flush();book(booking("07:00")).andExpect(status().isOk());book(booking("15:50")).andExpect(status().isOk());
        var request=Map.of("maBacSi",doctor,"ngayKham","9999-12-31","gioKhamMongMuon","09:00");
        mvc.perform(post("/api/lichkham/goi-y-khung-gio-thay-the").session(session("BENH_NHAN")).contentType("application/json").content(json.writeValueAsString(request))).andExpect(status().isOk()).andExpect(jsonPath("$.danhSachKhungGio").isEmpty());
    }
    @Test void anonymousAndWrongRolesCannotUsePatientBooking() throws Exception {
        mvc.perform(post("/api/lichkham/dat-truc-tuyen").contentType("application/json").content(json.writeValueAsString(booking("09:00")))).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/lichkham/bac-si-truc-tuyen")).andExpect(status().isUnauthorized());
        for(String role:List.of("BAC_SI","LE_TAN","DIEU_DUONG","THU_NGAN")) mvc.perform(post("/api/lichkham/dat-truc-tuyen").session(session(role)).contentType("application/json").content(json.writeValueAsString(booking("09:00")))).andExpect(status().isForbidden());
        mvc.perform(get("/api/lichkham/bac-si-truc-tuyen").session(session("BAC_SI"))).andExpect(status().isForbidden());
    }
    @Test @Transactional(propagation=Propagation.NOT_SUPPORTED) void concurrentOnlineAndDeskRequestsCannotDoubleBook() throws Exception {
        ExecutorService pool=Executors.newFixedThreadPool(2);CountDownLatch gate=new CountDownLatch(1);
        Callable<Integer> online=()->{gate.await();return book(booking("09:00")).andReturn().getResponse().getStatus();};
        Callable<Integer> desk=()->{gate.await();var b=booking("09:00");b.put("idBenhNhan",patient);return mvc.perform(post("/api/lichkham/dat-tai-quay").session(session("LE_TAN")).contentType("application/json").content(json.writeValueAsString(b))).andReturn().getResponse().getStatus();};
        try {var first=pool.submit(online);var second=pool.submit(desk);gate.countDown();var codes=new ArrayList<>(List.of(first.get(15,TimeUnit.SECONDS),second.get(15,TimeUnit.SECONDS)));Collections.sort(codes);assertEquals(List.of(200,409),codes);
            new TransactionTemplate(transactions).execute(s->{assertEquals(1L,em.createQuery("select count(l) from LichKham l where l.bacSi.maNv=:doctor",Long.class).setParameter("doctor",doctor).getSingleResult());return null;});
        } finally {pool.shutdownNow();new TransactionTemplate(transactions).execute(s->{em.createQuery("delete from LichKham l where l.bacSi.maNv=:doctor").setParameter("doctor",doctor).executeUpdate();em.remove(em.find(BacSi.class,doctor));em.remove(em.find(NhanVien.class,doctor));em.remove(em.find(BenhNhan.class,patient));return null;});}
    }
}