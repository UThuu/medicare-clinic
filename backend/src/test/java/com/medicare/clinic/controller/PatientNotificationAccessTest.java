package com.medicare.clinic.controller;
import com.medicare.clinic.dto.auth.LoginResponse;
import com.medicare.clinic.dto.request.BenhNhanThongBaoLichKhamRequest;
import com.medicare.clinic.dto.response.BenhNhanThongBaoLichKhamResponse;
import com.medicare.clinic.service.interfaces.IBenhNhanService;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpSession;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.standaloneSetup;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
class PatientNotificationAccessTest {
 private final IBenhNhanService service=mock(IBenhNhanService.class);
 private MockHttpSession session(String role) {MockHttpSession s=new MockHttpSession();s.setAttribute("AUTH_USER",new LoginResponse("account","user","Name",role,null,"own-patient"));return s;}
 @Test void unauthenticatedDenied() throws Exception {standaloneSetup(new BenhNhanController(service)).build().perform(post("/api/benhnhan/thong-bao-lich-kham")).andExpect(status().isUnauthorized());verifyNoInteractions(service);}
 @Test void staffDenied() throws Exception {for(String role:new String[]{"LE_TAN","BAC_SI","THU_NGAN","DIEU_DUONG"})standaloneSetup(new BenhNhanController(service)).build().perform(post("/api/benhnhan/thong-bao-lich-kham").session(session(role))).andExpect(status().isForbidden());verifyNoInteractions(service);}
 @Test void forgedPatientIgnored() throws Exception {when(service.thongBaoLichKham(eq("own-patient"),any())).thenReturn(new BenhNhanThongBaoLichKhamResponse());standaloneSetup(new BenhNhanController(service)).build().perform(post("/api/benhnhan/thong-bao-lich-kham").session(session("BENH_NHAN")).contentType("application/json").content("{\"idBenhNhan\":\"another-patient\"}")).andExpect(status().isOk());verify(service).thongBaoLichKham(eq("own-patient"),any(BenhNhanThongBaoLichKhamRequest.class));}
}
