package com.medicare.clinic.service;
import com.medicare.clinic.entity.*;
import org.junit.jupiter.api.Test;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;
class BillingEntityGraphTest {
 @Test void visitAppointmentCycleDoesNotRecurse(){LuotKham v=new LuotKham();v.setIdLuotKham("V");LichKham a=new LichKham();a.setIdLichKham("A");v.setLichKham(a);a.setLuotKham(v);assertDoesNotThrow(()->{v.hashCode();a.hashCode();v.toString();a.toString();});}
 @Test void invoiceDetailsCycleDoesNotRecurse(){HoaDon h=new HoaDon();h.setId("H");ChiTietHoaDon d=new ChiTietHoaDon();d.setId("D");d.setHoaDon(h);h.setChiTietHoaDons(List.of(d));assertDoesNotThrow(()->{h.hashCode();d.hashCode();h.toString();d.toString();});}
}
