package com.medicare.clinic.repository;

import com.medicare.clinic.entity.SinhHieu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Pageable;

import java.util.Optional;
import java.util.List;

@Repository
public interface SinhHieuRepository extends JpaRepository<SinhHieu, String> {
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select s from SinhHieu s where s.luotKham.idLuotKham = :visit")
    java.util.Optional<SinhHieu> findForUpdate(@org.springframework.data.repository.query.Param("visit") String visit);

    Optional<SinhHieu> findByLuotKham_IdLuotKham(String idLuotKham);

    @Query("SELECT s FROM SinhHieu s " +
           "JOIN s.luotKham lk " +
           "JOIN lk.lichKham l " +
           "WHERE l.benhNhan.idBenhNhan = :idBenhNhan " +
           "ORDER BY s.thoiDiemDo DESC, s.idSinhHieu DESC")
    List<SinhHieu> findLatestByBenhNhanId(
            @Param("idBenhNhan") String idBenhNhan, 
            Pageable pageable);
}
