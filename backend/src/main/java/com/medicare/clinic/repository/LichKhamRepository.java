package com.medicare.clinic.repository;

import com.medicare.clinic.entity.LichKham;
import com.medicare.clinic.entity.enums.TrangThaiLichKham;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface LichKhamRepository extends JpaRepository<LichKham, String> {

    List<LichKham> findByBenhNhan_IdBenhNhanAndNgayKhamOrderByGioKhamAsc(
            String idBenhNhan,
            LocalDate ngayKham
    );

    List<LichKham> findByBenhNhan_IdBenhNhanAndNgayKhamAndTrangThaiOrderByGioKhamAsc(
            String idBenhNhan,
            LocalDate ngayKham,
            TrangThaiLichKham trangThai
    );

    List<LichKham> findByBenhNhan_IdBenhNhanAndTrangThaiNotOrderByNgayKhamAscGioKhamAsc(
            String idBenhNhan,
            TrangThaiLichKham trangThai
    );

    boolean existsByBacSi_MaNvAndNgayKhamAndGioKhamAndTrangThaiNot(
            String maBacSi,
            LocalDate ngayKham,
            LocalTime gioKham,
            TrangThaiLichKham trangThai
    );

    @Query("SELECT lk FROM LichKham lk " +
           "LEFT JOIN FETCH lk.luotKham " +
           "JOIN FETCH lk.benhNhan " +
           "WHERE lk.bacSi.maNv = :maNv AND lk.ngayKham = :ngayKham " +
           "ORDER BY lk.gioKham ASC, lk.idLichKham ASC")
    List<LichKham> findScheduleByDoctorAndDate(
            @Param("maNv") String maNv,
            @Param("ngayKham") LocalDate ngayKham
    );
}
