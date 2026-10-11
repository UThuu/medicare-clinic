package com.medicare.clinic.integration;

import com.medicare.clinic.dto.auth.LoginResponse;
import com.medicare.clinic.entity.*;
import com.medicare.clinic.entity.enums.*;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.*;
import java.util.List;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
 "spring.datasource.url=jdbc:h2:mem:uc22-workflow;DB_CLOSE_DELAY=-1;MODE=MySQL",
 "spring.datasource.driver-class-name=org.h2.Driver", "spring.datasource.username=sa", "spring.datasource.password=",
 "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect", "spring.jpa.hibernate.ddl-auto=create-drop",
 "spring.sql.init.mode=never", "spring.jpa.show-sql=false", "spring.jpa.open-in-view=false"
})
@AutoConfigureMockMvc @ActiveProfiles("test") @Transactional
class InvoiceSearchWorkflowTest {
 @Autowired MockMvc mvc;
 @Autowired EntityManager em;
 private static final String PATH="/api/hoadon/tra-cuu";
 @BeforeEach void fixtures() {
  NhanVien dn=new NhanVien();dn.setMaNv("UC22-DR");dn.setHoTen("Synthetic doctor");dn.setSdt("0000000000");em.persist(dn);
  BacSi doctor=new BacSi();doctor.setMaNv(dn.getMaNv());doctor.setNhanVien(dn);doctor.setBangCap("Synthetic degree");doctor.setChuyenKhoa("Synthetic specialty");em.persist(doctor);
  NhanVien cn=new NhanVien();cn.setMaNv("UC22-CASH");cn.setHoTen("Synthetic cashier");cn.setSdt("0000000000");em.persist(cn);
  ThuNgan cashier=new ThuNgan();cashier.setMaNv(cn.getMaNv());cashier.setNhanVien(cn);cashier.setCaLamViec("Synthetic shift");em.persist(cashier);
  BenhNhan a=patient("UC22-A"), b=patient("UC22-B");
  for(int i=0;i<21;i++) {
   String suffix=String.format("%02d",i);
   LichKham schedule=new LichKham();schedule.setIdLichKham("S-"+suffix);schedule.setBenhNhan(i==0?a:b);
   schedule.setBacSi(doctor);schedule.setNgayKham(LocalDate.of(2026,10,11));schedule.setGioKham(LocalTime.of(7,0).plusMinutes(i*10));
   schedule.setTrangThai(TrangThaiLichKham.DA_DAT);schedule.setPhuongThucDatLich(PhuongThucDatLich.TRUC_TIEP);em.persist(schedule);
   LuotKham visit=new LuotKham();visit.setIdLuotKham("V-"+suffix);visit.setLichKham(schedule);visit.setTrangThai(TrangThaiLuotKham.HOAN_TAT);em.persist(visit);
   HoaDon h=new HoaDon();h.setId("H-"+suffix);h.setLuotKham(visit);h.setThuNgan(cashier);
   h.setNgayTao(i==20?LocalDateTime.of(2026,10,12,0,0):LocalDateTime.of(2026,10,11,23,59,59));
   h.setTongTien(new BigDecimal("150000.00"));h.setTrangThai(i%2==0?TrangThaiHoaDon.DA_THANH_TOAN:TrangThaiHoaDon.CHUA_THANH_TOAN);
   ChiTietHoaDon d=new ChiTietHoaDon();d.setId("D-"+suffix);d.setHoaDon(h);d.setLoaiChiPhi("TIEN_KHAM");d.setMoTa("Stored exam fee");d.setSoLuong(1);d.setDonGia(h.getTongTien());d.setThanhTien(h.getTongTien());
   h.setChiTietHoaDons(List.of(d));em.persist(h);
  }
  em.flush();em.clear();
 }
 private BenhNhan patient(String id) {
  BenhNhan p=new BenhNhan();p.setIdBenhNhan(id);p.setHoTen("Synthetic patient "+id);p.setNgaySinh(LocalDate.of(1990,1,1));p.setGioiTinh(GioiTinh.NU);p.setSoDienThoai("0000000022");em.persist(p);return p;
 }
 private MockHttpSession session(String role) {var s=new MockHttpSession();s.setAttribute("AUTH_USER",new LoginResponse("UC22-AUTH","synthetic","Synthetic user",role,"UC22-CASH",null));return s;}
 @Test void requiresSessionAndCashierRole() throws Exception {
  mvc.perform(get(PATH)).andExpect(status().isUnauthorized());
  for(String role:List.of("BENH_NHAN","BAC_SI","LE_TAN"))mvc.perform(get(PATH).session(session(role))).andExpect(status().isForbidden());
 }
 @Test void emptyFiltersPageStoredInvoicesWithStableOrderAndDetails() throws Exception {
  mvc.perform(get(PATH).session(session("THU_NGAN"))).andExpect(status().isOk())
   .andExpect(header().string("Cache-Control","no-store")).andExpect(jsonPath("$.tongSoKetQua").value(21))
   .andExpect(jsonPath("$.totalPages").value(2)).andExpect(jsonPath("$.danhSachHoaDon.length()").value(20))
   .andExpect(jsonPath("$.danhSachHoaDon[0].idHoaDon").value("H-20"))
   .andExpect(jsonPath("$.danhSachHoaDon[0].chiTietHoaDon[0].moTa").value("Stored exam fee"));
  mvc.perform(get(PATH).param("page","1").session(session("THU_NGAN"))).andExpect(status().isOk())
   .andExpect(jsonPath("$.danhSachHoaDon.length()").value(1)).andExpect(jsonPath("$.danhSachHoaDon[0].idHoaDon").value("H-00"));
 }
 @Test void phoneSearchIncludesDifferentPatientsSharingPhone() throws Exception {
  mvc.perform(get(PATH).param("soDienThoaiBenhNhan","000 000 0022").param("size","100").session(session("THU_NGAN")))
   .andExpect(status().isOk()).andExpect(jsonPath("$.tongSoKetQua").value(21))
   .andExpect(jsonPath("$.danhSachHoaDon[0].idBenhNhan").value("UC22-B"))
   .andExpect(jsonPath("$.danhSachHoaDon[20].idBenhNhan").value("UC22-A"));
 }
 @Test void dateFiltersIncludeWholeEndDateAndCombineWithStatus() throws Exception {
  mvc.perform(get(PATH).param("tuNgay","2026-10-11").param("denNgay","2026-10-11").param("trangThai","DA_THANH_TOAN").session(session("THU_NGAN")))
   .andExpect(status().isOk()).andExpect(jsonPath("$.tongSoKetQua").value(10));
 }
 @Test void invoiceCodeSearchAndNoMatches() throws Exception {
  mvc.perform(get(PATH).param("idHoaDon","h-00").session(session("THU_NGAN"))).andExpect(status().isOk()).andExpect(jsonPath("$.tongSoKetQua").value(1));
  mvc.perform(get(PATH).param("idHoaDon","NOT-FOUND").session(session("THU_NGAN"))).andExpect(status().isOk()).andExpect(jsonPath("$.tongSoKetQua").value(0)).andExpect(jsonPath("$.danhSachHoaDon.length()").value(0));
 }
 @Test void invalidFiltersReturn400() throws Exception {
  for(String[] pair:new String[][]{{"soDienThoaiBenhNhan","abc123"},{"tuNgay","bad-date"},{"trangThai","UNKNOWN"},{"page","-1"},{"size","101"},{"page","oops"},{"idHoaDon","%"}})
   mvc.perform(get(PATH).param(pair[0],pair[1]).session(session("THU_NGAN"))).andExpect(status().isBadRequest());
  mvc.perform(get(PATH).param("tuNgay","2026-10-12").param("denNgay","2026-10-11").session(session("THU_NGAN"))).andExpect(status().isBadRequest());
 }
 @Test void searchRouteHasSpaFallback() throws Exception {
  mvc.perform(get("/staff/hoadon/tra-cuu")).andExpect(status().isOk()).andExpect(forwardedUrl("/index.html"));
 }
}
