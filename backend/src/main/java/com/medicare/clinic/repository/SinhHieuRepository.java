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
