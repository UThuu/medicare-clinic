package com.medicare.clinic.integration;

import com.medicare.clinic.entity.*;
import org.junit.jupiter.api.Test;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.junit.jupiter.api.Assertions.*;

class VitalsHistoryWorkflowTest extends ClinicalWorkflowFixture {
    @Test void editingVitalsPreservesOriginalRecorderAndAuditsActualEditor() throws Exception {
        mvc.perform(put("/api/sinh-hieu/luot-kham/V1").session(session("DIEU_DUONG","N2"))
                .contentType("application/json").content("{\"huyetApTamThu\":125,\"huyetApTamTruong\":85,\"canNang\":61,\"nhietDo\":37}"))
                .andExpect(status().isOk());
        em.flush(); em.clear();
        var histories=em.createQuery("select h from LichSuSinhHieu h",LichSuSinhHieu.class).getResultList();
        assertEquals(1,histories.size()); var history=histories.get(0);
        assertEquals("N2",history.getDieuDuong().getMaNv()); assertEquals(120,history.getHuyetApTamThuCu());
        assertEquals(125,history.getHuyetApTamThuMoi()); assertNotNull(history.getThoiGianSua());
        assertEquals("N1",em.find(SinhHieu.class,"SH1").getDieuDuong().getMaNv());
        assertEquals(125,em.find(SinhHieu.class,"SH1").getHuyetApTamThu());
    }
    @Test void invalidUpdateDoesNotChangeVitalsOrAddHistory() throws Exception {
        mvc.perform(put("/api/sinh-hieu/luot-kham/V1").session(session("DIEU_DUONG","N2"))
                .contentType("application/json").content("{\"huyetApTamThu\":0,\"huyetApTamTruong\":85,\"canNang\":61,\"nhietDo\":37}"))
                .andExpect(status().isBadRequest());
        assertEquals(120,em.find(SinhHieu.class,"SH1").getHuyetApTamThu());
        assertEquals(0L,em.createQuery("select count(h) from LichSuSinhHieu h",Long.class).getSingleResult());
    }
}
