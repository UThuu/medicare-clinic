package com.medicare.clinic.integration;

import com.medicare.clinic.entity.*;
import com.medicare.clinic.entity.enums.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.junit.jupiter.api.Assertions.*;

class PrescriptionBillingWorkflowTest extends ClinicalWorkflowFixture {
    @ParameterizedTest @EnumSource(TrangThaiHoaDon.class)
    void billedPrescriptionCannotBeChanged(TrangThaiHoaDon state) throws Exception {
        invoice("H1","V1",state);
        mvc.perform(put("/api/don-thuoc/RX1").session(session("BAC_SI","DR1"))
                .contentType("application/json").content(prescriptionBody(2,"Changed"))).andExpect(status().isConflict());
        em.clear(); assertEquals(1,em.find(ChiTietDonThuoc.class,"ITEM1").getSoLuong());
        assertEquals(state,em.find(HoaDon.class,"H1").getTrangThai());
    }
    @Test void cannotAddPrescriptionAfterInvoiceWithoutMedicine() throws Exception {
        invoice("H2","V2",TrangThaiHoaDon.CHUA_THANH_TOAN);
        mvc.perform(post("/api/don-thuoc").session(session("BAC_SI","DR2"))
                .contentType("application/json").content(prescriptionBody(1,"Demo"))).andExpect(status().isConflict());
        assertEquals(0L,em.createQuery("select count(d) from DonThuoc d where d.luotKham.idLuotKham='V2'",Long.class).getSingleResult());
    }
    @Test void unbilledPrescriptionCanBeUpdated() throws Exception {
        mvc.perform(put("/api/don-thuoc/RX1").session(session("BAC_SI","DR1"))
                .contentType("application/json").content(prescriptionBody(2,"Changed"))).andExpect(status().isOk())
                .andExpect(jsonPath("$.chiTietDonThuoc[0].soLuong").value(2));
    }
}
