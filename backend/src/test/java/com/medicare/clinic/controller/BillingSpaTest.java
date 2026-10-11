package com.medicare.clinic.controller;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
class BillingSpaTest {
 @Test void billingRouteRefreshReturnsSpa() throws Exception {MockMvcBuilders.standaloneSetup(new SpaController()).build().perform(get("/staff/billing")).andExpect(status().isOk()).andExpect(forwardedUrl("/index.html"));}
 @Test void apiStillDoesNotFallBackToSpa() throws Exception {MockMvcBuilders.standaloneSetup(new SpaController()).build().perform(get("/api/unknown")).andExpect(status().isNotFound());}
}