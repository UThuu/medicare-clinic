package com.medicare.clinic.service.impl;
import com.medicare.clinic.entity.*;
import com.medicare.clinic.entity.enums.TrangThaiLichKham;
import com.medicare.clinic.repository.*;
import org.junit.jupiter.api.Test;
import java.time.*;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
class AppointmentNotificationsTest {
 private final BenhNhanRepository patients = mock(BenhNhanRepository.class);
 private final BenhNhanService service = new BenhNhanService(patients, mock(LichKhamRepository.class));
 private final LocalDateTime at = LocalDateTime.of(2026,12,15,9,0);
 private LichKham appointment(String id, TrangThaiLichKham status) {
  LichKham a=new LichKham(); a.setIdLichKham(id);a.setNgayKham(at.toLocalDate());a.setGioKham(at.toLocalTime());a.setTrangThai(status);
  BacSi b=new BacSi(); b.setMaNv("doctor");NhanVien n=new NhanVien();n.setHoTen("Doctor");b.setNhanVien(n);a.setBacSi(b);return a;
 }
 private List<String> types(LocalDateTime now) {
  return service.buildNotifications(List.of(appointment("visit",TrangThaiLichKham.DA_DAT)),now).getDanhSachThongBao().stream().map(x->x.getLoaiThongBao()).toList();
 }
 @Test void beforeOneDayOnlyConfirmation() {assertEquals(List.of("XAC_NHAN_DAT_LICH"),types(at.minusDays(1).minusNanos(1)));}
 @Test void atOneDayAddsFirstReminder() {assertEquals(List.of("XAC_NHAN_DAT_LICH","NHAC_LICH_1_NGAY"),types(at.minusDays(1)));}
 @Test void beforeTwoHoursKeepsFirstReminder() {assertEquals(2,types(at.minusHours(2).minusNanos(1)).size());}
 @Test void atTwoHoursKeepsBothReminders() {assertEquals(List.of("XAC_NHAN_DAT_LICH","NHAC_LICH_1_NGAY","NHAC_LICH_2_GIO"),types(at.minusHours(2)));}
 @Test void justBeforeAppointmentKeepsBoth() {assertEquals(3,types(at.minusNanos(1)).size());}
 @Test void atAppointmentHidesEverything() {assertTrue(types(at).isEmpty());}
 @Test void pastAppointmentHidden() {assertTrue(types(at.plusMinutes(1)).isEmpty());}
 @Test void cancelledAppointmentShowsCancellationOnly() {
  var entries=service.buildNotifications(List.of(appointment("cancelled",TrangThaiLichKham.DA_HUY)),at.minusHours(1)).getDanhSachThongBao();
  assertEquals(1,entries.size());assertEquals("HUY_LICH",entries.get(0).getLoaiThongBao());
 }
 @Test void pastCancellationHiddenWithoutNotificationHistory() {assertTrue(service.buildNotifications(List.of(appointment("cancelled",TrangThaiLichKham.DA_HUY)),at).getDanhSachThongBao().isEmpty());}
 @Test void receivedAppointmentStillUpcoming() {assertEquals(3,service.buildNotifications(List.of(appointment("received",TrangThaiLichKham.DA_TIEP_NHAN)),at.minusHours(1)).getTongSoThongBao());}
 @Test void repeatedCalculationDoesNotDuplicate() {assertEquals(types(at.minusHours(1)),types(at.minusHours(1)));}
 @Test void patientWithoutProfileRejected() {assertThrows(IllegalArgumentException.class,()->service.thongBaoLichKham(null,null));}
 @Test void missingProfileRejected() {when(patients.existsById("missing")).thenReturn(false);assertThrows(IllegalArgumentException.class,()->service.thongBaoLichKham("missing",null));}
}
