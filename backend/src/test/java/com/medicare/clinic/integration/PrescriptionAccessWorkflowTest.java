package com.medicare.clinic.integration;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.junit.jupiter.api.Assertions.*;

class PrescriptionAccessWorkflowTest extends ClinicalWorkflowFixture {
    @ParameterizedTest @ValueSource(strings={"BENH_NHAN","LE_TAN","THU_NGAN","DIEU_DUONG"})
    void otherRolesCannotReadOrModifyPrescriptions(String role) throws Exception {
        var user=session(role,"N1");
        mvc.perform(get("/api/don-thuoc/luot-kham/V1").session(user)).andExpect(status().isForbidden());
        mvc.perform(get("/api/don-thuoc/RX1/in").session(user)).andExpect(status().isForbidden());
        mvc.perform(post("/api/don-thuoc").session(user).contentType("application/json").content(prescriptionBody(2,"Demo"))).andExpect(status().isForbidden());
        mvc.perform(put("/api/don-thuoc/RX1").session(user).contentType("application/json").content(prescriptionBody(2,"Demo"))).andExpect(status().isForbidden());
        em.clear(); assertEquals(1,em.find(com.medicare.clinic.entity.ChiTietDonThuoc.class,"ITEM1").getSoLuong());
    }
    @Test void unassignedDoctorCannotReadModifyOrCreate() throws Exception {
        var user=session("BAC_SI","DR2");
        mvc.perform(get("/api/don-thuoc/luot-kham/S1").session(user)).andExpect(status().isForbidden());
        mvc.perform(put("/api/don-thuoc/RX1").session(user).contentType("application/json").content(prescriptionBody(2,"Demo"))).andExpect(status().isForbidden());
        mvc.perform(post("/api/don-thuoc/kiem-tra-di-ung").param("idLuotKham","V1").session(user).contentType("application/json").content("[\"M1\"]")).andExpect(status().isForbidden());
    }
    @Test void assignedDoctorCanReadAndPrint() throws Exception {
        var user=session("BAC_SI","DR1");
        mvc.perform(get("/api/don-thuoc/luot-kham/S1").session(user)).andExpect(status().isOk()).andExpect(jsonPath("$.idDonThuoc").value("RX1"));
        mvc.perform(get("/api/don-thuoc/RX1/in").session(user)).andExpect(status().isOk());
        mvc.perform(get("/api/don-thuoc/danh-muc-thuoc").session(user)).andExpect(status().isOk());
    }
    @Test void anonymousRequestIsRejected() throws Exception {
        mvc.perform(get("/api/don-thuoc/luot-kham/V1")).andExpect(status().isUnauthorized());
    }
}
