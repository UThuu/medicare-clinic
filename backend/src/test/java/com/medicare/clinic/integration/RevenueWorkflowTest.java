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
 "spring.datasource.url=jdbc:h2:mem:uc23-workflow;DB_CLOSE_DELAY=-1;MODE=MySQL",
 "spring.datasource.driver-class-name=org.h2.Driver", "spring.datasource.username=sa", "spring.datasource.password=",
 "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect", "spring.jpa.hibernate.ddl-auto=create-drop",
 "spring.sql.init.mode=never", "spring.jpa.show-sql=false", "spring.jpa.open-in-view=false"
})
@AutoConfigureMockMvc @ActiveProfiles("test") @Transactional
class RevenueWorkflowTest {
 @Autowired MockMvc mvc;
 @Autowired EntityManager em;
 private static final String PATH="/api/hoadon/tong-doanh-thu";
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
  for (int i : new int[]{0,2,4}) {
   HoaDon h=em.find(HoaDon.class,String.format("H-%02d",i));
   ThanhToan t=new ThanhToan();t.setIdThanhToan("T-"+i);t.setHoaDon(h);t.setSoTien(h.getTongTien());t.setTrangThai(TrangThaiXuLyThanhToan.THANH_CONG);t.setNgayTao(h.getNgayTao());em.persist(t);
   transaction(t,"G-"+i,i==4?LocalDateTime.of(2026,10,13,0,0):i==2?LocalDateTime.of(2026,10,12,23,59,59):LocalDateTime.of(2026,10,12,0,0),TrangThaiXuLyThanhToan.THANH_CONG);
   transaction(t,"FAIL-"+i,LocalDateTime.of(2026,10,11,12,0),TrangThaiXuLyThanhToan.THAT_BAI);
   if(i==0) transaction(t,"DUPLICATE",LocalDateTime.of(2026,10,13,12,0),TrangThaiXuLyThanhToan.THANH_CONG);
  }
  em.flush();em.clear();
 }
 private BenhNhan patient(String id) {
  BenhNhan p=new BenhNhan();p.setIdBenhNhan(id);p.setHoTen("Synthetic patient "+id);p.setNgaySinh(LocalDate.of(1990,1,1));p.setGioiTinh(GioiTinh.NU);p.setSoDienThoai("0000000022");em.persist(p);return p;
 }
 private MockHttpSession session(String role) {var s=new MockHttpSession();s.setAttribute("AUTH_USER",new LoginResponse("UC22-AUTH","synthetic","Synthetic user",role,"UC22-CASH",null));return s;}

 private void transaction(ThanhToan t,String id,LocalDateTime time,TrangThaiXuLyThanhToan status) {
  var g=new GiaoDichThanhToan();g.setIdGiaoDich(id);g.setThanhToan(t);g.setPhuongThuc(PhuongThucThanhToan.TIEN_MAT);g.setSoTien(t.getSoTien());g.setTrangThai(status);g.setThoiGian(time);em.persist(g);
 }
 private org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder request(String body) {
  return post(PATH).contentType("application/json").content(body);
 }
 private String range(String day) {return "{\"tuNgay\":\""+day+"\",\"denNgay\":\""+day+"\"}";}
 @Test void usesSuccessfulPaymentDateAndCountsEachInvoiceOnce() throws Exception {
  mvc.perform(request(range("2026-10-12")).session(session("THU_NGAN"))).andExpect(status().isOk())
   .andExpect(header().string("Cache-Control","no-store")).andExpect(jsonPath("$.tongDoanhThu").value(300000))
   .andExpect(jsonPath("$.soHoaDonDaThanhToan").value(2));
  mvc.perform(request(range("2026-10-13")).session(session("THU_NGAN"))).andExpect(status().isOk())
   .andExpect(jsonPath("$.tongDoanhThu").value(150000)).andExpect(jsonPath("$.soHoaDonDaThanhToan").value(1));
 }
 @Test void emptyPeriodAndFailedTransactionsDoNotBecomeRevenue() throws Exception {
  mvc.perform(request(range("2026-10-11")).session(session("THU_NGAN"))).andExpect(status().isOk())
   .andExpect(jsonPath("$.tongDoanhThu").value(0)).andExpect(jsonPath("$.soHoaDonDaThanhToan").value(0));
 }
 @Test void validatesDatesAndBody() throws Exception {
  for(String body:List.of("{}","{\"tuNgay\":\"2026-10-12\"}","{\"tuNgay\":\"2026-10-13\",\"denNgay\":\"2026-10-12\"}","{\"tuNgay\":\"bad-date\",\"denNgay\":\"2026-10-12\"}","null"))
   mvc.perform(request(body).session(session("THU_NGAN"))).andExpect(status().isBadRequest());
 }
 @Test void enforcesCashierAccess() throws Exception {
  mvc.perform(request(range("2026-10-12"))).andExpect(status().isUnauthorized());
  for(String role:List.of("BENH_NHAN","BAC_SI","LE_TAN"))mvc.perform(request(range("2026-10-12")).session(session(role))).andExpect(status().isForbidden());
  var unlinked=session("THU_NGAN");unlinked.setAttribute("AUTH_USER",new LoginResponse("ID","synthetic","Synthetic","THU_NGAN",null,null));
  mvc.perform(request(range("2026-10-12")).session(unlinked)).andExpect(status().isForbidden());
 }
 @Test void hasProductionSpaFallback() throws Exception {
  mvc.perform(get("/staff/hoadon/tong-doanh-thu")).andExpect(status().isOk()).andExpect(forwardedUrl("/index.html"));
 }
}
