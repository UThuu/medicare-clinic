package com.medicare.clinic.service;
import com.medicare.clinic.dto.request.TaoHoaDonRequest;
import com.medicare.clinic.entity.*;
import com.medicare.clinic.entity.enums.*;
import com.medicare.clinic.repository.*;
import com.medicare.clinic.service.impl.HoaDonService;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import java.math.BigDecimal;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
@ExtendWith(MockitoExtension.class)
class HoaDonServiceTest {
 @Mock jakarta.persistence.EntityManager entityManager;
 @Mock HoaDonRepository hoaDonRepository;
 @Mock LuotKhamRepository luotKhamRepository;
 @Mock DonThuocRepository donThuocRepository;
 @Mock ThuNganRepository thuNganRepository;
 @InjectMocks HoaDonService service;
 LuotKham visit; DonThuoc prescription; ThuNgan cashier;
 @BeforeEach void setup() {
  ReflectionTestUtils.setField(service,"examFee",new BigDecimal("150000"));
  NhanVien doctorEmployee=new NhanVien(); doctorEmployee.setHoTen("Doctor");
  BacSi doctor=new BacSi();doctor.setNhanVien(doctorEmployee);
  BenhNhan patient=new BenhNhan();patient.setIdBenhNhan("BN");patient.setHoTen("Patient");
  LichKham appointment=new LichKham();appointment.setBenhNhan(patient);appointment.setBacSi(doctor);
  visit=new LuotKham();visit.setIdLuotKham("V");visit.setTrangThai(TrangThaiLuotKham.HOAN_TAT);visit.setLichKham(appointment);
  Thuoc drug=new Thuoc();drug.setTenThuoc("Medicine");
  ChiTietDonThuoc detail=new ChiTietDonThuoc();detail.setThuoc(drug);detail.setSoLuong(2);detail.setDonGia(new BigDecimal("25000"));
  prescription=new DonThuoc();prescription.setChiTietDonThuocs(List.of(detail));
  NhanVien employee=new NhanVien();employee.setHoTen("Cashier");
  cashier=new ThuNgan();cashier.setMaNv("TN");cashier.setNhanVien(employee);
 }
 TaoHoaDonRequest request(BigDecimal fee) {TaoHoaDonRequest r=new TaoHoaDonRequest();r.setIdLuotKham("V");r.setPhiKhamTuyChinh(fee);return r;}
 void creator() {
  when(thuNganRepository.findById("TN")).thenReturn(Optional.of(cashier));
  when(luotKhamRepository.findForBilling("V")).thenReturn(Optional.of(visit));
 }
 @Test void previewCalculates() {
  when(luotKhamRepository.findById("V")).thenReturn(Optional.of(visit));
  when(donThuocRepository.findByLuotKham_IdLuotKham("V")).thenReturn(Optional.of(prescription));
  assertEquals(new BigDecimal("200000.00"),service.layChiPhiDuKien("V").getTongTien());
 }
 @Test void creationSavesSnapshotsAndPreservesCompletedState() {
  creator();when(donThuocRepository.findByLuotKham_IdLuotKham("V")).thenReturn(Optional.of(prescription));
  var result=service.taoHoaDon(request(null),"TN");assertEquals(new BigDecimal("200000.00"),result.getTongTien());
  ArgumentCaptor<HoaDon> capture=ArgumentCaptor.forClass(HoaDon.class);verify(entityManager).persist(capture.capture());
  assertEquals(2,capture.getValue().getChiTietHoaDons().size());
  assertEquals(TrangThaiLuotKham.HOAN_TAT,visit.getTrangThai());verify(luotKhamRepository,never()).save(any());
  assertEquals("Cashier",result.getThuNganLap());
 }
 @Test void duplicateRejectedAfterVisitLock() {
  creator();when(hoaDonRepository.existsByLuotKham_IdLuotKham("V")).thenReturn(true);
  assertThrows(IllegalStateException.class,()->service.taoHoaDon(request(null),"TN"));
  InOrder order=inOrder(luotKhamRepository,hoaDonRepository);order.verify(luotKhamRepository).findForBilling("V");order.verify(hoaDonRepository).existsByLuotKham_IdLuotKham("V");
  verify(entityManager,never()).persist(any());
 }
 @Test void ongoingVisitRejected() {
  creator();visit.setTrangThai(TrangThaiLuotKham.DANG_KHAM);
  assertThrows(IllegalStateException.class,()->service.taoHoaDon(request(null),"TN"));verify(entityManager,never()).persist(any());
 }
 @Test void completedVisitWithoutPrescriptionChargesOnlyExamFee() {
  creator();assertEquals(new BigDecimal("150000.00"),service.taoHoaDon(request(null),"TN").getTongTien());
 }
 @Test void negativeFeeRejected() {
  creator();when(donThuocRepository.findByLuotKham_IdLuotKham("V")).thenReturn(Optional.of(prescription));
  assertThrows(IllegalArgumentException.class,()->service.taoHoaDon(request(new BigDecimal("-1")),"TN"));
 }
 @Test void invalidQuantityRejected() {
  creator();prescription.getChiTietDonThuocs().get(0).setSoLuong(0);
  when(donThuocRepository.findByLuotKham_IdLuotKham("V")).thenReturn(Optional.of(prescription));
  assertThrows(IllegalArgumentException.class,()->service.taoHoaDon(request(null),"TN"));
 }
 @Test void invalidCashierDoesNotCreateEmployee() {
  assertThrows(org.springframework.web.server.ResponseStatusException.class,()->service.taoHoaDon(request(null),"MISSING"));
  verify(thuNganRepository,never()).save(any());verify(luotKhamRepository,never()).findForBilling(any());
 }
 @Test void storedPreviewUsesSnapshotWithoutReadingPrescription() {
  when(luotKhamRepository.findById("V")).thenReturn(Optional.of(visit));
  HoaDon invoice=new HoaDon();invoice.setId("H");invoice.setTongTien(new BigDecimal("42.00"));
  ChiTietHoaDon line=new ChiTietHoaDon();line.setLoaiChiPhi("TIEN_KHAM");line.setMoTa("Fee");line.setThanhTien(new BigDecimal("42.00"));
  invoice.setChiTietHoaDons(List.of(line));when(hoaDonRepository.findByLuotKham_IdLuotKham("V")).thenReturn(Optional.of(invoice));
  assertEquals(new BigDecimal("42.00"),service.layChiPhiDuKien("V").getTongTien());verifyNoInteractions(donThuocRepository);
 }
}
