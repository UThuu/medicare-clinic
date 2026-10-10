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

@SpringBootTest(properties={"spring.datasource.url=jdbc:h2:mem:uc30-workflow;DB_CLOSE_DELAY=-1;MODE=MySQL", "spring.datasource.driver-class-name=org.h2.Driver", "spring.datasource.username=sa", "spring.datasource.password=", "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect", "spring.jpa.hibernate.ddl-auto=create-drop", "spring.jpa.show-sql=false", "spring.sql.init.mode=never"})
@AutoConfigureMockMvc @ActiveProfiles("test") @Transactional
class DeskBookingWorkflowTest {
    @Autowired MockMvc mvc; @Autowired ObjectMapper json; @Autowired EntityManager em;
    @Autowired PlatformTransactionManager transactions;
    String doctor,patient; LocalDate date=LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh")).plusDays(1);
    @BeforeEach void fixtures() {
        doctor=UUID.randomUUID().toString(); patient=UUID.randomUUID().toString();
        new TransactionTemplate(transactions).execute(status -> {
            NhanVien nv=new NhanVien(); nv.setMaNv(doctor); nv.setHoTen("Booking doctor"); nv.setSdt("0000000000");em.persist(nv);
            BacSi bs=new BacSi(); bs.setMaNv(doctor);bs.setNhanVien(nv);bs.setChuyenKhoa("Test");bs.setBangCap("Test");em.persist(bs);
            BenhNhan bn=new BenhNhan();bn.setIdBenhNhan(patient);bn.setHoTen("Booking patient");bn.setNgaySinh(LocalDate.of(1990,1,1));bn.setGioiTinh(GioiTinh.NU);bn.setSoDienThoai("0901234567");em.persist(bn);
            em.flush();return null;
        });
    }
    MockHttpSession session(String role) { MockHttpSession s=new MockHttpSession();LoginResponse u=new LoginResponse();u.setVaiTro(role);s.setAttribute("AUTH_USER",u);return s; }
    Map<String,Object> booking(String time) { return new HashMap<>(Map.of("idBenhNhan",patient,"maBacSi",doctor,"ngayKham",date.toString(),"gioKham",time)); }
    org.springframework.test.web.servlet.ResultActions book(Map<String,Object> data) throws Exception {
        return mvc.perform(post("/api/lichkham/dat-tai-quay").session(session("LE_TAN")).contentType("application/json").content(json.writeValueAsString(data)));
    }
    @Test void doctorsComeFromPersistenceAndSharedHoursGenerate54Slots() throws Exception {
        mvc.perform(get("/api/lichkham/bac-si").session(session("LE_TAN"))).andExpect(status().isOk());
        mvc.perform(get("/api/lichkham/khung-gio").session(session("LE_TAN")).param("maBacSi",doctor).param("ngayKham",date.toString()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.gioTrong.length()").value(54)).andExpect(jsonPath("$.gioTrong[0]").value("07:00:00"))
                .andExpect(jsonPath("$.gioTrong[53]").value("15:50:00"));
    }
    @Test void dateBoundaryDoesNotSuggestDatesOutsideDatabaseRange() throws Exception {
        mvc.perform(get("/api/lichkham/khung-gio").session(session("LE_TAN")).param("maBacSi",doctor).param("ngayKham","9999-12-31"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.gioTrong.length()").value(54)).andExpect(jsonPath("$.ngayGoiY").isEmpty());
        mvc.perform(get("/api/lichkham/khung-gio").session(session("LE_TAN")).param("maBacSi",doctor).param("ngayKham","+10000-01-01"))
                .andExpect(status().isBadRequest());
    }
    @Test void bookingCreatesDaDatAndNeverReceivesOrStartsVisit() throws Exception {
        String value=book(booking("09:00")).andExpect(status().isOk()).andExpect(jsonPath("$.trangThai").value("DA_DAT"))
                .andExpect(jsonPath("$.phuongThucDatLich").value("TRUC_TIEP")).andReturn().getResponse().getContentAsString();
        String id=json.readTree(value).get("idLichKham").asText();em.clear(); assertNull(em.find(LichKham.class,id).getLuotKham());
        book(booking("09:00")).andExpect(status().isConflict());
        mvc.perform(get("/api/lichkham/khung-gio").session(session("LE_TAN")).param("maBacSi",doctor).param("ngayKham",date.toString()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.gioTrong.length()").value(53));
    }
    @Test void fullDaySuggestsAnotherDayAndCancellationReleasesSlot() throws Exception {
        String result=book(booking("09:00")).andReturn().getResponse().getContentAsString();
        for (LocalTime time=LocalTime.of(7,0);time.isBefore(LocalTime.of(16,0));time=time.plusMinutes(10)) {
            if (!time.equals(LocalTime.of(9,0))) book(booking(time.toString())).andExpect(status().isOk());
        }
        mvc.perform(get("/api/lichkham/khung-gio").session(session("LE_TAN")).param("maBacSi",doctor).param("ngayKham",date.toString()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.gioTrong").isEmpty()).andExpect(jsonPath("$.ngayGoiY[0]").value(date.plusDays(1).toString()));
        LichKham old=em.find(LichKham.class,json.readTree(result).get("idLichKham").asText());old.setTrangThai(TrangThaiLichKham.DA_HUY);em.flush();
        book(booking("09:00")).andExpect(status().isOk());
    }
    @Test void openingAndFinalSlotAreBookable() throws Exception {
        book(booking("07:00")).andExpect(status().isOk());
        book(booking("15:50")).andExpect(status().isOk());
        book(booking("07:00")).andExpect(status().isConflict());
    }
    @Test void invalidTimeAndMissingPatientNeverSave() throws Exception {
        for (Map<String,Object> changes:List.<Map<String,Object>>of(Map.of("idBenhNhan","missing"),Map.of("idBenhNhan",""),Map.of("maBacSi","missing"),Map.of("ngayKham",date.minusDays(3).toString()),Map.of("gioKham","06:50"),Map.of("gioKham","16:00"),Map.of("gioKham","09:05"),Map.of("gioKham","23:00"),Map.of("gioKham","09:00:01"),Map.of("gioKham","25:00"))) {
            Map<String,Object> value=booking("09:00");value.putAll(changes);book(value).andExpect(status().isBadRequest());
        }
        assertEquals(0L,em.createQuery("select count(l) from LichKham l where l.bacSi.maNv=:doctor",Long.class).setParameter("doctor",doctor).getSingleResult());
    }
    @Test void anonymousAndWrongRolesCannotBookOrReadSchedulingData() throws Exception {
        mvc.perform(post("/api/lichkham/dat-tai-quay").contentType("application/json").content(json.writeValueAsString(booking("09:00")))).andExpect(status().isUnauthorized());
        for (String role:List.of("BAC_SI","BENH_NHAN","DIEU_DUONG","THU_NGAN")) {
            mvc.perform(post("/api/lichkham/dat-tai-quay").session(session(role)).contentType("application/json").content(json.writeValueAsString(booking("09:00")))).andExpect(status().isForbidden());
            mvc.perform(get("/api/lichkham/bac-si").session(session(role))).andExpect(status().isForbidden());
            mvc.perform(get("/api/lichkham/khung-gio").session(session(role)).param("maBacSi",doctor).param("ngayKham",date.toString())).andExpect(status().isForbidden());
        }
    }
    @Test @Transactional(propagation=Propagation.NOT_SUPPORTED)
    void concurrentRequestsCompeteForOneSlotWithoutScheduleTable() throws Exception {
        ExecutorService pool=Executors.newFixedThreadPool(2); CountDownLatch gate=new CountDownLatch(1);
        Callable<Integer> call=()->{gate.await();return book(booking("09:00")).andReturn().getResponse().getStatus();};
        try {
            Future<Integer> first=pool.submit(call),second=pool.submit(call);gate.countDown();
            List<Integer> statuses=new ArrayList<>(List.of(first.get(15,TimeUnit.SECONDS),second.get(15,TimeUnit.SECONDS)));Collections.sort(statuses);
            assertEquals(List.of(200,409),statuses);
            Long count=new TransactionTemplate(transactions).execute(tx->em.createQuery("select count(l) from LichKham l where l.bacSi.maNv=:doctor",Long.class).setParameter("doctor",doctor).getSingleResult());
            assertEquals(1L,count);
        } finally { pool.shutdownNow(); }
    }
}
