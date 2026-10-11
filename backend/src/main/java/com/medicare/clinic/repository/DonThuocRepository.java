package com.medicare.clinic.repository;

import com.medicare.clinic.entity.DonThuoc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

@Repository
public interface DonThuocRepository extends JpaRepository<DonThuoc, String> {
    @Query("SELECT d FROM DonThuoc d WHERE d.luotKham.idLuotKham IN :idLuotKhams")
    List<DonThuoc> findByLuotKham_IdLuotKhamIn(@Param("idLuotKhams") List<String> idLuotKhams);
}
