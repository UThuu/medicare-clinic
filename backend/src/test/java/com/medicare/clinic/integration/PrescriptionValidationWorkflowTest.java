package com.medicare.clinic.integration;

import org.junit.jupiter.api.Test;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.junit.jupiter.api.Assertions.*;

class PrescriptionValidationWorkflowTest extends ClinicalWorkflowFixture {
    @Test void excessiveDoseLengthIsRejectedBeforePersisting() throws Exception {
        mvc.perform(put("/api/don-thuoc/RX1").session(session("BAC_SI","DR1"))
                .contentType("application/json").content(prescriptionBody(2,"X".repeat(101)))).andExpect(status().isBadRequest());
        assertEquals(1,em.find(com.medicare.clinic.entity.ChiTietDonThuoc.class,"ITEM1").getSoLuong());
    }
    @Test void nullListItemIsValidationError() throws Exception {
        mvc.perform(post("/api/don-thuoc").session(session("BAC_SI","DR2"))
                .contentType("application/json").content("{\"idLuotKham\":\"V2\",\"chiTietDonThuoc\":[null]}"))
                .andExpect(status().isBadRequest());
    }
    @Test void missingVisitReturnsNotFound() throws Exception {
        mvc.perform(get("/api/don-thuoc/luot-kham/NOT-FOUND").session(session("BAC_SI","DR1"))).andExpect(status().isNotFound());
    }
}
