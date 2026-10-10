package com.medicare.clinic.repository;

import com.medicare.clinic.entity.LuotKham;
import com.medicare.clinic.entity.enums.TrangThaiLuotKham;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LuotKhamRepository
        extends JpaRepository<LuotKham, String> {

    List<LuotKham>
    findByTrangThaiAndLichKham_NgayKhamOrderByLichKham_GioKhamAsc(
            TrangThaiLuotKham trangThai,
            LocalDate ngayKham
    );

    boolean existsByLichKham_IdLichKham(String idLichKham);

    @Query("SELECT l FROM LuotKham l " +
           "JOIN FETCH l.lichKham lk " +
           "JOIN FETCH lk.bacSi bs " +
           "WHERE lk.benhNhan.idBenhNhan = :idBenhNhan " +
           "AND lk.idLichKham != :currentLichKhamId " +
           "ORDER BY lk.ngayKham DESC, lk.gioKham DESC")
    List<LuotKham> findHistoryByBenhNhanId(
            @Param("idBenhNhan") String idBenhNhan, 
            @Param("currentLichKhamId") String currentLichKhamId);
}
