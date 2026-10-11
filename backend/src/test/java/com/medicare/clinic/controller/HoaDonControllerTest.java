package com.medicare.clinic.controller;
import com.medicare.clinic.dto.auth.LoginResponse;
import com.medicare.clinic.service.interfaces.IHoaDonService;
import org.junit.jupiter.api.*;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
class HoaDonControllerTest {
 MockMvc mvc; IHoaDonService service;
 @BeforeEach void setup(){service=mock(IHoaDonService.class);mvc=MockMvcBuilders.standaloneSetup(new HoaDonController(service,mock(com.medicare.clinic.service.PaymentAccess.class))).build();}
 MockHttpSession session(String role){var s=new MockHttpSession();s.setAttribute("AUTH_USER",new LoginResponse("A","login","User",role,"TN",null));return s;}
 @Test void anonymousDenied() throws Exception {mvc.perform(get("/api/hoadon")).andExpect(status().isUnauthorized());verifyNoInteractions(service);}
 @Test void wrongRoleDenied() throws Exception {mvc.perform(get("/api/hoadon").session(session("LE_TAN"))).andExpect(status().isForbidden());verifyNoInteractions(service);}
 @Test void negativeFeeBadRequest() throws Exception {mvc.perform(post("/api/hoadon/tao").session(session("THU_NGAN")).contentType("application/json").content("{\"idLuotKham\":\"V\",\"phiKhamTuyChinh\":-1}")).andExpect(status().isBadRequest());verifyNoInteractions(service);}
 @Test void cashierFromSession() throws Exception {mvc.perform(post("/api/hoadon/tao").session(session("THU_NGAN")).contentType("application/json").content("{\"idLuotKham\":\"V\",\"maThuNgan\":\"SPOOFED\"}")).andExpect(status().isCreated());verify(service).taoHoaDon(any(),eq("TN"));}
 @Test void databaseConflictIs409WithoutSql() throws Exception {when(service.taoHoaDon(any(),eq("TN"))).thenThrow(new org.springframework.dao.DataIntegrityViolationException("private SQL"));mvc.perform(post("/api/hoadon/tao").session(session("THU_NGAN")).contentType("application/json").content("{\"idLuotKham\":\"V\"}")).andExpect(status().isConflict()).andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("private SQL"))));}
 @Test void malformedJsonIs400() throws Exception {mvc.perform(post("/api/hoadon/tao").session(session("THU_NGAN")).contentType("application/json").content("{bad json")).andExpect(status().isBadRequest());verifyNoInteractions(service);}
}
